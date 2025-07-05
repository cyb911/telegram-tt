
export const CLIPBOARD_ITEM_SUPPORTED = window.navigator.clipboard && window.ClipboardItem;

const textCopyEl = document.createElement('textarea');
textCopyEl.setAttribute('readonly', '');
textCopyEl.tabIndex = -1;
textCopyEl.className = 'visually-hidden';

export const copyTextToClipboard = (str: string): void => {
  textCopyEl.value = str;
  document.body.appendChild(textCopyEl);
  const selection = document.getSelection();

  if (selection) {
    // Store previous selection
    const rangeToRestore = selection.rangeCount > 0 && selection.getRangeAt(0);
    textCopyEl.select();
    document.execCommand('copy');
    // Restore the original selection
    if (rangeToRestore) {
      selection.removeAllRanges();
      selection.addRange(rangeToRestore);
    }
  }

  document.body.removeChild(textCopyEl);
};

export const copyHtmlToClipboard = (html: string, text: string): void => {
  if (!window.navigator.clipboard?.write) {
    copyTextToClipboard(text);
    return;
  }

  window.navigator.clipboard.write([
    new ClipboardItem({
      'text/plain': new Blob([text], { type: 'text/plain' }),
      'text/html': new Blob([html], { type: 'text/html' }),
    }),
  ]);
};

export const copyTextToClipboardFromPromise = async (
  getTextPromise: Promise<string | undefined>,
  onSuccess: NoneToVoidFunction,
  onFailure: NoneToVoidFunction,
) => {
  const copyTextToClipboardFallback = async () => {
    try {
      const text = await getTextPromise;
      if (text) {
        copyTextToClipboard(text);
      } else {
        onFailure();
      }
      return Boolean(text);
    } catch {
      onFailure();
      return false;
    }
  };
  if (!CLIPBOARD_ITEM_SUPPORTED || !navigator.clipboard.write) {
    if (await copyTextToClipboardFallback()) onSuccess();
    return;
  }
  try {
    let hasGetDataError = false;
    const rejectGetDataError = () => Promise.reject(new Error('GET_DATA_ERROR'));

    const clipboardTextItem = new ClipboardItem({
      'text/plain': getTextPromise.then((text) => text || rejectGetDataError()).catch(() => {
        hasGetDataError = true;
        return '';
      }),
    });
    await navigator.clipboard.write([clipboardTextItem]);
    if (hasGetDataError) {
      onFailure();
      return;
    }
  } catch {
    // Promises in ClipboardItem aren't supported in older Chrome versions
    if (!await copyTextToClipboardFallback()) return;
  }
  onSuccess();
};
