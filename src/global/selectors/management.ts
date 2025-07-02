import type { GlobalState, TabArgs } from '../types';

import { getCurrentTabId } from '../../util/establishMultitabRole';
import { selectCurrentMessageList } from './messages';
import { selectTabState } from './tabs';

export function selectCurrentManagement<T extends GlobalState>(
  global: T,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
) {
  const { chatId, threadId } = selectCurrentMessageList(global, tabId) || {};
  if (!chatId || !threadId) {
    return undefined;
  }

  const currentManagement = selectTabState(global, tabId).management.byChatId[chatId];
  if (!currentManagement?.isActive) {
    return undefined;
  }

  return currentManagement;
}
