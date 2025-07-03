import '../../global/actions/all';

import {
  beginHeavyAnimation,
  memo, useEffect, useLayoutEffect,
  useRef, useState,
} from '../../lib/teact/teact';
import { addExtraClass } from '../../lib/teact/teact-dom';
import { getActions, getGlobal, withGlobal } from '../../global';

import type { ApiChatFolder, ApiLimitTypeWithModal, ApiUser } from '../../api/types';
import type { TabState } from '../../global/types';
import { ElectronEvent } from '../../types/electron';

import { BASE_EMOJI_KEYWORD_LANG, DEBUG, INACTIVE_MARKER } from '../../config';
import { requestNextMutation } from '../../lib/fasterdom/fasterdom';
import {
  selectCanAnimateInterface,
  selectCurrentMessageList,
  selectIsCurrentUserPremium,
  selectIsForwardModalOpen,
  selectIsMediaViewerOpen,
  selectIsReactionPickerOpen,
  selectIsRightColumnShown,
  selectIsServiceChatReady,
  selectIsStoryViewerOpen,
  selectTabState,
  selectUser,
} from '../../global/selectors';
import { IS_ANDROID, IS_ELECTRON } from '../../util/browser/windowEnvironment';
import buildClassName from '../../util/buildClassName';
import { waitForTransitionEnd } from '../../util/cssAnimationEndListeners';
import { processDeepLink } from '../../util/deeplink';
import { Bundles, loadBundle } from '../../util/moduleLoader';
import { parseInitialLocationHash, parseLocationHash } from '../../util/routing';
import updateIcon from '../../util/updateIcon';

import useInterval from '../../hooks/schedulers/useInterval';
import useTimeout from '../../hooks/schedulers/useTimeout';
import useAppLayout from '../../hooks/useAppLayout';
import useForceUpdate from '../../hooks/useForceUpdate';
import useLang from '../../hooks/useLang';
import useLastCallback from '../../hooks/useLastCallback';
import usePreventPinchZoomGesture from '../../hooks/usePreventPinchZoomGesture';
import useShowTransition from '../../hooks/useShowTransition';
import useSyncEffect from '../../hooks/useSyncEffect';
import useBackgroundMode from '../../hooks/window/useBackgroundMode';
import useBeforeUnload from '../../hooks/window/useBeforeUnload';
import { useFullscreenStatus } from '../../hooks/window/useFullscreen';
import PremiumMainModal from './premium/PremiumMainModal.async';

import './Main.scss';

export interface OwnProps {
  isMobile?: boolean;
}

type StateProps = {
  isMasterTab?: boolean;
  currentUserId?: string;
  isLeftColumnOpen: boolean;
  isMiddleColumnOpen: boolean;
  isRightColumnOpen: boolean;
  isMediaViewerOpen: boolean;
  isStoryViewerOpen: boolean;
  isForwardModalOpen: boolean;
  hasNotifications: boolean;
  hasDialogs: boolean;
  safeLinkModalUrl?: string;
  isHistoryCalendarOpen: boolean;
  shouldSkipHistoryAnimations?: boolean;
  openedStickerSetShortName?: string;
  openedCustomEmojiSetIds?: string[];
  activeGroupCallId?: string;
  isServiceChatReady?: boolean;
  wasTimeFormatSetManually?: boolean;
  isPhoneCallActive?: boolean;
  addedSetIds?: string[];
  addedCustomEmojiIds?: string[];
  newContactUserId?: string;
  newContactByPhoneNumber?: boolean;
  openedGame?: TabState['openedGame'];
  gameTitle?: string;
  isRatePhoneCallModalOpen?: boolean;
  isPremiumModalOpen?: boolean;
  botTrustRequest?: TabState['botTrustRequest'];
  botTrustRequestBot?: ApiUser;
  requestedAttachBotInChat?: TabState['requestedAttachBotInChat'];
  requestedDraft?: TabState['requestedDraft'];
  limitReached?: ApiLimitTypeWithModal;
  deleteFolderDialog?: ApiChatFolder;
  isPaymentModalOpen?: boolean;
  isReceiptModalOpen?: boolean;
  isReactionPickerOpen: boolean;
  isGiveawayModalOpen?: boolean;
  isDeleteMessageModalOpen?: boolean;
  isStarsGiftingPickerModal?: boolean;
  isCurrentUserPremium?: boolean;
  noRightColumnAnimation?: boolean;
  withInterfaceAnimations?: boolean;
  isSynced?: boolean;
  isAccountFrozen?: boolean;
  isAppConfigLoaded?: boolean;
};

const APP_OUTDATED_TIMEOUT_MS = 5 * 60 * 1000; // 5 min
const CALL_BUNDLE_LOADING_DELAY_MS = 5000; // 5 sec

let DEBUG_isLogged = false;

const Main = ({
  isMobile,
  isLeftColumnOpen,
  isMiddleColumnOpen,
  isRightColumnOpen,
  isMediaViewerOpen,
  isStoryViewerOpen,
  shouldSkipHistoryAnimations,
  isServiceChatReady,
  withInterfaceAnimations,
  wasTimeFormatSetManually,
  addedSetIds,
  addedCustomEmojiIds,
  isPremiumModalOpen,
  isCurrentUserPremium,
  isMasterTab,
  noRightColumnAnimation,
  isSynced,
  currentUserId,
  isAccountFrozen,
  isAppConfigLoaded,
}: OwnProps & StateProps) => {
  const {
    initMain,
    loadAnimatedEmojis,
    loadBirthdayNumbersStickers,
    loadRestrictedEmojiStickers,
    loadNotificationSettings,
    loadNotificationExceptions,
    updateIsOnline,
    onTabFocusChange,
    loadTopInlineBots,
    loadEmojiKeywords,
    loadCountryList,
    loadAvailableReactions,
    loadStickerSets,
    loadPremiumGifts,
    loadStarGifts,
    loadDefaultTopicIcons,
    loadAddedStickers,
    loadFavoriteStickers,
    loadDefaultStatusIcons,
    ensureTimeFormat,
    checkVersionNotification,
    loadConfig,
    loadAppConfig,
    loadAttachBots,
    loadContactList,
    loadCustomEmojis,
    loadGenericEmojiEffects,
    checkAppVersion,
    openThread,
    toggleLeftColumn,
    loadRecentEmojiStatuses,
    loadUserCollectibleStatuses,
    updatePageTitle,
    loadTopReactions,
    loadRecentReactions,
    loadDefaultTagReactions,
    loadFeaturedEmojiStickers,
    setIsElectronUpdateAvailable,
    loadAuthorizations,
    loadPeerColors,
    loadSavedReactionTags,
    loadTimezones,
    loadQuickReplies,
    loadStarStatus,
    loadAvailableEffects,
    loadTopBotApps,
    loadPaidReactionPrivacy,
    loadPasswordInfo,
    loadBotFreezeAppeal,
    loadAllChats,
    loadAllStories,
    loadAllHiddenStories,
  } = getActions();

  if (DEBUG && !DEBUG_isLogged) {
    DEBUG_isLogged = true;
    // eslint-disable-next-line no-console
    console.log('>>> RENDER MAIN');
  }

  const lang = useLang();

  // Preload Calls bundle to initialize sounds for iOS
  useTimeout(() => {
    void loadBundle(Bundles.Calls);
  }, CALL_BUNDLE_LOADING_DELAY_MS);

  const containerRef = useRef<HTMLDivElement>();

  const { isDesktop } = useAppLayout();
  useEffect(() => {
    if (!isLeftColumnOpen && !isMiddleColumnOpen && !isDesktop) {
      // Always display at least one column
      toggleLeftColumn();
    } else if (isLeftColumnOpen && isMiddleColumnOpen && isMobile) {
      // Can't have two active columns at the same time
      toggleLeftColumn();
    }
  }, [isDesktop, isLeftColumnOpen, isMiddleColumnOpen, isMobile, toggleLeftColumn]);

  useInterval(checkAppVersion, isMasterTab ? APP_OUTDATED_TIMEOUT_MS : undefined, true);

  useEffect(() => {
    if (!IS_ELECTRON) {
      return undefined;
    }

    const removeUpdateAvailableListener = window.electron!.on(ElectronEvent.UPDATE_AVAILABLE, () => {
      setIsElectronUpdateAvailable({ isAvailable: true });
    });

    const removeUpdateErrorListener = window.electron!.on(ElectronEvent.UPDATE_ERROR, () => {
      setIsElectronUpdateAvailable({ isAvailable: false });
      removeUpdateAvailableListener?.();
    });

    return () => {
      removeUpdateErrorListener?.();
      removeUpdateAvailableListener?.();
    };
  }, []);

  // Initial API calls
  useEffect(() => {
    if (isMasterTab && isSynced) {
      updateIsOnline({ isOnline: true });
      loadConfig();
      loadAppConfig();
      loadPeerColors();
      initMain();
      loadContactList();
      checkAppVersion();
      loadAuthorizations();
      loadPasswordInfo();
    }
  }, [isMasterTab, isSynced]);

  // Initial API calls
  useEffect(() => {
    if (isMasterTab && isSynced && isAppConfigLoaded && !isAccountFrozen) {
      loadAllChats({ listType: 'saved' });
      loadAllStories();
      loadAllHiddenStories();
      loadRecentReactions();
      loadDefaultTagReactions();
      loadAttachBots();
      loadNotificationSettings();
      loadNotificationExceptions();
      loadTopInlineBots();
      loadTopReactions();
      loadStarStatus();
      loadEmojiKeywords({ language: BASE_EMOJI_KEYWORD_LANG });
      loadFeaturedEmojiStickers();
      loadSavedReactionTags();
      loadTopBotApps();
      loadPaidReactionPrivacy();
      loadDefaultTopicIcons();
      loadAnimatedEmojis();
      loadAvailableReactions();
      loadUserCollectibleStatuses();
      loadGenericEmojiEffects();
      loadPremiumGifts();
      loadStarGifts();
      loadAvailableEffects();
      loadBirthdayNumbersStickers();
      loadRestrictedEmojiStickers();
      loadQuickReplies();
      loadTimezones();
    }
  }, [isMasterTab, isSynced, isAppConfigLoaded, isAccountFrozen]);

  // Initial Premium API calls
  useEffect(() => {
    if (isMasterTab && isCurrentUserPremium && isAppConfigLoaded && !isAccountFrozen) {
      loadDefaultStatusIcons();
      loadRecentEmojiStatuses();
    }
  }, [isCurrentUserPremium, isMasterTab, isAppConfigLoaded, isAccountFrozen]);

  // Language-based API calls
  useEffect(() => {
    if (isMasterTab) {
      if (lang.code !== BASE_EMOJI_KEYWORD_LANG) {
        loadEmojiKeywords({ language: lang.code });
      }

      loadCountryList({ langCode: lang.code });
    }
  }, [lang, isMasterTab]);

  // Re-fetch cached saved emoji for `localDb`
  useEffect(() => {
    if (isMasterTab) {
      loadCustomEmojis({
        ids: Object.keys(getGlobal().customEmojis.byId),
        ignoreCache: true,
      });
    }
  }, [isMasterTab]);

  // Sticker sets
  useEffect(() => {
    if (isMasterTab && isSynced && isAppConfigLoaded && !isAccountFrozen) {
      if (!addedSetIds || !addedCustomEmojiIds) {
        loadStickerSets();
        loadFavoriteStickers();
      }

      if (addedSetIds && addedCustomEmojiIds) {
        loadAddedStickers();
      }
    }
  }, [addedSetIds, addedCustomEmojiIds, isMasterTab, isSynced, isAppConfigLoaded, isAccountFrozen]);

  useEffect(() => {
    loadBotFreezeAppeal();
  }, [isAppConfigLoaded]);

  // Check version when service chat is ready
  useEffect(() => {
    if (isServiceChatReady && isMasterTab) {
      checkVersionNotification();
    }
  }, [isServiceChatReady, isMasterTab]);

  // Ensure time format
  useEffect(() => {
    if (!wasTimeFormatSetManually) {
      ensureTimeFormat();
    }
  }, [wasTimeFormatSetManually]);

  // Parse deep link
  useEffect(() => {
    if (!isSynced) return;
    updatePageTitle();

    const parsedInitialLocationHash = parseInitialLocationHash();
    if (parsedInitialLocationHash?.tgaddr) {
      processDeepLink(decodeURIComponent(parsedInitialLocationHash.tgaddr));
    }
  }, [isSynced]);

  useEffect(() => {
    return window.electron?.on(ElectronEvent.DEEPLINK, (link: string) => {
      processDeepLink(decodeURIComponent(link));
    });
  }, []);

  useEffect(() => {
    const parsedLocationHash = parseLocationHash(currentUserId);
    if (!parsedLocationHash) return;

    openThread({
      chatId: parsedLocationHash.chatId,
      threadId: parsedLocationHash.threadId,
      type: parsedLocationHash.type,
    });
  }, [currentUserId]);

  // Restore Transition slide class after async rendering
  useLayoutEffect(() => {
    const container = containerRef.current!;
    if (container.parentNode!.childElementCount === 1) {
      addExtraClass(container, 'Transition_slide-active');
    }
  }, []);

  useShowTransition({
    ref: containerRef,
    isOpen: isLeftColumnOpen,
    noCloseTransition: shouldSkipHistoryAnimations,
    prefix: 'left-column-',
  });
  const willAnimateLeftColumnRef = useRef(false);
  const forceUpdate = useForceUpdate();

  // Handle opening middle column
  useSyncEffect(([prevIsLeftColumnOpen]) => {
    if (prevIsLeftColumnOpen === undefined || isLeftColumnOpen === prevIsLeftColumnOpen || !withInterfaceAnimations) {
      return;
    }

    willAnimateLeftColumnRef.current = true;

    if (IS_ANDROID) {
      requestNextMutation(() => {
        document.body.classList.toggle('android-left-blackout-open', !isLeftColumnOpen);
      });
    }

    const endHeavyAnimation = beginHeavyAnimation();

    waitForTransitionEnd(document.getElementById('MiddleColumn')!, () => {
      endHeavyAnimation();
      willAnimateLeftColumnRef.current = false;
      forceUpdate();
    });
  }, [isLeftColumnOpen, withInterfaceAnimations, forceUpdate]);

  useShowTransition({
    ref: containerRef,
    isOpen: isRightColumnOpen,
    noCloseTransition: shouldSkipHistoryAnimations,
    prefix: 'right-column-',
  });
  const willAnimateRightColumnRef = useRef(false);
  const [isNarrowMessageList, setIsNarrowMessageList] = useState(isRightColumnOpen);

  const isFullscreen = useFullscreenStatus();

  // Handle opening right column
  useSyncEffect(([prevIsMiddleColumnOpen, prevIsRightColumnOpen]) => {
    if (prevIsRightColumnOpen === undefined || isRightColumnOpen === prevIsRightColumnOpen) {
      return;
    }

    if (!prevIsMiddleColumnOpen || noRightColumnAnimation) {
      setIsNarrowMessageList(isRightColumnOpen);
      return;
    }

    willAnimateRightColumnRef.current = true;

    const endHeavyAnimation = beginHeavyAnimation();

    waitForTransitionEnd(document.getElementById('RightColumn')!, () => {
      endHeavyAnimation();
      willAnimateRightColumnRef.current = false;
      forceUpdate();
      setIsNarrowMessageList(isRightColumnOpen);
    });
  }, [isMiddleColumnOpen, isRightColumnOpen, noRightColumnAnimation, forceUpdate]);

  const className = buildClassName(
    willAnimateLeftColumnRef.current && 'left-column-animating',
    willAnimateRightColumnRef.current && 'right-column-animating',
    isNarrowMessageList && 'narrow-message-list',
    shouldSkipHistoryAnimations && 'history-animation-disabled',
    isFullscreen && 'is-fullscreen',
  );

  const handleBlur = useLastCallback(() => {
    onTabFocusChange({ isBlurred: true });
  });

  const handleFocus = useLastCallback(() => {
    onTabFocusChange({ isBlurred: false });

    if (!document.title.includes(INACTIVE_MARKER)) {
      updatePageTitle();
    }

    updateIcon(false);
  });

  // Online status and browser tab indicators
  useBackgroundMode(handleBlur, handleFocus, Boolean(IS_ELECTRON));
  useBeforeUnload(handleBlur);
  usePreventPinchZoomGesture(isMediaViewerOpen || isStoryViewerOpen);

  return (
    <div ref={containerRef} id="Main" className={className}>
      <PremiumMainModal isOpen={isPremiumModalOpen} />
    </div>
  );
};

export default memo(withGlobal<OwnProps>(
  (global, { isMobile }): StateProps => {
    const {
      botTrustRequest,
      isLeftColumnShown,
      historyCalendarSelectedAt,
      notifications,
      dialogs,
      newContact,
      premiumModal,
      giveawayModal,
      deleteMessageModal,
      starsGiftingPickerModal,
      payment,
      limitReachedModal,
    } = selectTabState(global);

    const { chatId } = selectCurrentMessageList(global) || {};

    return {
      isLeftColumnOpen: isLeftColumnShown,
      isMiddleColumnOpen: Boolean(chatId),
      isRightColumnOpen: selectIsRightColumnShown(global, isMobile),
      isMediaViewerOpen: selectIsMediaViewerOpen(global),
      isStoryViewerOpen: selectIsStoryViewerOpen(global),
      isForwardModalOpen: selectIsForwardModalOpen(global),
      isReactionPickerOpen: selectIsReactionPickerOpen(global),
      hasNotifications: Boolean(notifications.length),
      hasDialogs: Boolean(dialogs.length),
      isHistoryCalendarOpen: Boolean(historyCalendarSelectedAt),
      isServiceChatReady: selectIsServiceChatReady(global),
      withInterfaceAnimations: selectCanAnimateInterface(global),
      addedSetIds: global.stickers.added.setIds,
      addedCustomEmojiIds: global.customEmojis.added.setIds,
      newContactUserId: newContact?.userId,
      newContactByPhoneNumber: newContact?.isByPhoneNumber,
      botTrustRequestBot: botTrustRequest && selectUser(global, botTrustRequest.botId),
      isCurrentUserPremium: selectIsCurrentUserPremium(global),
      isPremiumModalOpen: premiumModal?.isOpen,
      isGiveawayModalOpen: giveawayModal?.isOpen,
      isDeleteMessageModalOpen: Boolean(deleteMessageModal),
      isStarsGiftingPickerModal: starsGiftingPickerModal?.isOpen,
      limitReached: limitReachedModal?.limit,
      isPaymentModalOpen: payment.isPaymentModalOpen,
      isReceiptModalOpen: Boolean(payment.receipt),
      isSynced: global.isSynced,
      isAppConfigLoaded: global.isAppConfigLoaded,
    };
  },
)(Main));
