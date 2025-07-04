import type { PerformanceTypeKey, ThemeKey } from '../../types';
import type { GlobalState, TabArgs } from '../types';
import { NewChatMembersProgress, RightColumnContent } from '../../types';

import { IS_SNAP_EFFECT_SUPPORTED } from '../../util/browser/windowEnvironment';
import { getCurrentTabId } from '../../util/establishMultitabRole';
import { selectCurrentManagement } from './management';
import { selectSharedSettings } from './sharedState';
import { selectIsStatisticsShown } from './statistics';
import { selectTabState } from './tabs';

export function selectIsMediaViewerOpen<T extends GlobalState>(
  global: T,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
) {
  const {
    mediaViewer: {
      chatId,
      messageId,
      isAvatarView,
      standaloneMedia,
      isSponsoredMessage,
    },
  } = selectTabState(global, tabId);
  return Boolean(standaloneMedia || (chatId && (isAvatarView || messageId || isSponsoredMessage)));
}

export function selectRightColumnContentKey<T extends GlobalState>(
  global: T,
  isMobile?: boolean,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
) {
  const tabState = selectTabState(global, tabId);

  return tabState.editTopicPanel ? (
    RightColumnContent.EditTopic
  ) : tabState.createTopicPanel ? (
    RightColumnContent.CreateTopic
  ) : tabState.pollResults.messageId ? (
    RightColumnContent.PollResults
  ) : selectCurrentManagement(global, tabId) ? (
    RightColumnContent.Management
  ) : tabState.isStatisticsShown && tabState.statistics.currentMessageId ? (
    RightColumnContent.MessageStatistics
  ) : tabState.isStatisticsShown && tabState.statistics.currentStoryId ? (
    RightColumnContent.StoryStatistics
  ) : selectIsStatisticsShown(global, tabId) ? (
    RightColumnContent.Statistics
  ) : tabState.boostStatistics ? (
    RightColumnContent.BoostStatistics
  ) : tabState.monetizationStatistics ? (
    RightColumnContent.MonetizationStatistics
  ) : tabState.stickerSearch.query !== undefined ? (
    RightColumnContent.StickerSearch
  ) : tabState.gifSearch.query !== undefined ? (
    RightColumnContent.GifSearch
  ) : tabState.newChatMembersProgress !== NewChatMembersProgress.Closed ? (
    RightColumnContent.AddingMembers
  ) : tabState.isChatInfoShown && tabState.messageLists.length ? (
    RightColumnContent.ChatInfo
  ) : undefined;
}

export function selectIsRightColumnShown<T extends GlobalState>(
  global: T,
  isMobile?: boolean,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
) {
  return selectRightColumnContentKey(global, isMobile, tabId) !== undefined;
}

export function selectTheme<T extends GlobalState>(global: T) {
  return selectSharedSettings(global).theme;
}

export function selectThemeValues<T extends GlobalState>(global: T, themeKey: ThemeKey) {
  return global.settings.themes[themeKey];
}

export function selectIsReactionPickerOpen<T extends GlobalState>(
  global: T,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
) {
  const { reactionPicker } = selectTabState(global, tabId);
  return Boolean(reactionPicker?.position);
}

export function selectPerformanceSettings<T extends GlobalState>(global: T) {
  return selectSharedSettings(global).performance;
}

export function selectPerformanceSettingsValue<T extends GlobalState>(
  global: T,
  key: PerformanceTypeKey,
) {
  return selectPerformanceSettings(global)[key];
}

export function selectCanPlayAnimatedEmojis<T extends GlobalState>(global: T) {
  return selectPerformanceSettingsValue(global, 'animatedEmoji');
}

export function selectCanAnimateInterface<T extends GlobalState>(global: T) {
  return selectPerformanceSettingsValue(global, 'pageTransitions');
}

export function selectIsSynced<T extends GlobalState>(global: T) {
  return global.isSynced;
}

export function selectCanAnimateSnapEffect<T extends GlobalState>(global: T) {
  return IS_SNAP_EFFECT_SUPPORTED && selectPerformanceSettingsValue(global, 'snapEffect');
}

export function selectWebApp<T extends GlobalState>(
  global: T, key: string, ...[tabId = getCurrentTabId()]: TabArgs<T>
) {
  return selectTabState(global, tabId).webApps.openedWebApps[key];
}

export function selectActiveWebApp<T extends GlobalState>(
  global: T, ...[tabId = getCurrentTabId()]: TabArgs<T>
) {
  const activeWebAppKey = selectTabState(global, tabId).webApps.activeWebAppKey;
  if (!activeWebAppKey) return undefined;

  return selectWebApp(global, activeWebAppKey, tabId);
}
