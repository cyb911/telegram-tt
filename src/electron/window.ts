import type { HandlerDetails } from 'electron';
import {
  app, BrowserWindow, ipcMain, shell, systemPreferences,
} from 'electron';
import path from 'path';

import type { WindowButtonsPosition } from '../types/electron';
import { ElectronAction, ElectronEvent } from '../types/electron';

import { processDeeplink } from './deeplink';
import { captureLocalStorage, restoreLocalStorage } from './localStorage';
import tray from './tray';
import {
  checkIsWebContentsUrlAllowed, getAppTitle, getCurrentWindow,
  IS_PREVIEW, IS_PRODUCTION, IS_WINDOWS,
  reloadWindows, WINDOW_BUTTONS_POSITION, windows,
} from './utils';
import windowStateKeeper from './windowState';

const ALLOWED_DEVICE_ORIGINS = ['http://localhost:1234', 'file://'];

export function createWindow(url?: string) {
  const windowState = windowStateKeeper({
    defaultWidth: 1088,
    defaultHeight: 700,
  });

  let x;
  let y;

  const currentWindow = getCurrentWindow();
  if (currentWindow) {
    const [currentWindowX, currentWindowY] = currentWindow.getPosition();
    x = currentWindowX + 24;
    y = currentWindowY + 24;
  } else {
    x = windowState.x;
    y = windowState.y;
  }

  let width;
  let height;

  if (currentWindow) {
    const bounds = currentWindow.getBounds();

    width = bounds.width;
    height = bounds.height;
  } else {
    width = windowState.width;
    height = windowState.height;
  }

  const window = new BrowserWindow({
    show: false,
    x,
    y,
    minWidth: 360,
    width,
    height,
    title: getAppTitle(),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      devTools: !IS_PRODUCTION,
    },
  });

  windowState.manage(window);

  window.webContents.setWindowOpenHandler((details: HandlerDetails) => {
    shell.openExternal(details.url);
    return { action: 'deny' };
  });

  window.webContents.session.setDevicePermissionHandler(({ deviceType, origin }) => {
    return deviceType === 'hid' && ALLOWED_DEVICE_ORIGINS.includes(origin);
  });

  window.webContents.on('will-navigate', (event, newUrl) => {
    if (!checkIsWebContentsUrlAllowed(newUrl)) {
      event.preventDefault();
    }
  });

  window.on('page-title-updated', (event: Electron.Event) => {
    event.preventDefault();
  });

  window.on('enter-full-screen', () => {
    window.webContents.send(ElectronEvent.FULLSCREEN_CHANGE, true);
  });

  window.on('leave-full-screen', () => {
    window.webContents.send(ElectronEvent.FULLSCREEN_CHANGE, false);
  });

  window.on('close', (event) => {
  });

  windowState.clearLastUrlHash();

  if (IS_WINDOWS && tray.isEnabled) {
    tray.setupListeners(window);
    tray.create();
  }

  window.webContents.once('dom-ready', async () => {
    processDeeplink();
    window.show();
  });

  windows.add(window);
  loadWindowUrl(window, url, windowState.urlHash);
}

function loadWindowUrl(window: BrowserWindow, url?: string, hash?: string): void {
  if (url && checkIsWebContentsUrlAllowed(url)) {
    window.loadURL(url);
  } else if (!app.isPackaged) {
    window.loadURL(`http://localhost:1234${hash}`);
    window.webContents.openDevTools();
  } else {
    window.loadURL(`file://${__dirname}/index.html${hash}`);
  }
}

export function setupElectronActionHandlers() {
  ipcMain.handle(ElectronAction.OPEN_NEW_WINDOW, (_, url: string) => {
    createWindow(url);
  });

  ipcMain.handle(ElectronAction.SET_WINDOW_TITLE, (_, newTitle?: string) => {
    getCurrentWindow()?.setTitle(getAppTitle(newTitle));
  });

  ipcMain.handle(ElectronAction.GET_IS_FULLSCREEN, () => {
    getCurrentWindow()?.isFullScreen();
  });

  ipcMain.handle(ElectronAction.HANDLE_DOUBLE_CLICK, () => {
    const currentWindow = getCurrentWindow();
    const doubleClickAction = systemPreferences.getUserDefault('AppleActionOnDoubleClick', 'string');

    if (doubleClickAction === 'Minimize') {
      currentWindow?.minimize();
    } else if (doubleClickAction === 'Maximize') {
      if (!currentWindow?.isMaximized()) {
        currentWindow?.maximize();
      } else {
        currentWindow?.unmaximize();
      }
    }
  });

  ipcMain.handle(ElectronAction.SET_WINDOW_BUTTONS_POSITION, (_, position: WindowButtonsPosition) => {
    getCurrentWindow()?.setWindowButtonPosition(WINDOW_BUTTONS_POSITION[position]);
  });

  ipcMain.handle(ElectronAction.SET_IS_AUTO_UPDATE_ENABLED, async (_, isAutoUpdateEnabled: boolean) => {
    if (IS_PREVIEW) {
      return;
    }
    await captureLocalStorage();
    reloadWindows(isAutoUpdateEnabled);
  });

  ipcMain.handle(ElectronAction.SET_IS_TRAY_ICON_ENABLED, (_, isTrayIconEnabled: boolean) => {
    if (isTrayIconEnabled) {
      tray.enable();
    } else {
      tray.disable();
    }
  });

  ipcMain.handle(ElectronAction.GET_IS_TRAY_ICON_ENABLED, () => tray.isEnabled);

  ipcMain.handle(ElectronAction.RESTORE_LOCAL_STORAGE, () => restoreLocalStorage());
}

export function setupCloseHandlers() {
  app.on('activate', () => {
    const hasActiveWindow = BrowserWindow.getAllWindows().length > 0;

    if (!hasActiveWindow) {
      createWindow();
    }
  });
}
