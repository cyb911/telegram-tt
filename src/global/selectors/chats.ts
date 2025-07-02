import type {
  ApiChat, ApiChatFullInfo, ApiChatType,
} from '../../api/types';
import type { ChatListType } from '../../types';
import type { GlobalState, TabArgs } from '../types';

import {
  ALL_FOLDER_ID, ARCHIVED_FOLDER_ID, SAVED_FOLDER_ID, SERVICE_NOTIFICATIONS_USER_ID,
} from '../../config';
import { getCurrentTabId } from '../../util/establishMultitabRole';
import {
  getPrivateChatUserId,
  isChatChannel,
  isHistoryClearMessage,
  isUserBot,
} from '../helpers';
import { selectTabState } from './tabs';
import {
  selectBot, selectUser,
} from './users';

export function selectChat<T extends GlobalState>(global: T, chatId: string): ApiChat | undefined {
  return global.chats.byId[chatId];
}

export function selectChatFullInfo<T extends GlobalState>(global: T, chatId: string): ApiChatFullInfo | undefined {
  return global.chats.fullInfoById[chatId];
}

export function selectChatListLoadingParameters<T extends GlobalState>(
  global: T, listType: ChatListType,
) {
  return global.chats.loadingParameters[listType];
}

export function selectChatUser<T extends GlobalState>(global: T, chat: ApiChat) {
  const userId = getPrivateChatUserId(chat);
  if (!userId) {
    return false;
  }

  return selectUser(global, userId);
}

export function selectIsChatWithSelf<T extends GlobalState>(global: T, chatId: string) {
  return chatId === global.currentUserId;
}

export function selectIsChatWithBot<T extends GlobalState>(global: T, chat: ApiChat) {
  const user = selectChatUser(global, chat);
  return user && isUserBot(user);
}

export function selectSupportChat<T extends GlobalState>(global: T) {
  return Object.values(global.chats.byId).find(({ isSupport }: ApiChat) => isSupport);
}

export function selectIsTrustedBot<T extends GlobalState>(global: T, botId: string) {
  return global.trustedBotIds.includes(botId);
}

export function selectChatType<T extends GlobalState>(global: T, chatId: string): ApiChatType | undefined {
  const bot = selectBot(global, chatId);
  if (bot) {
    return 'bots';
  }

  const user = selectUser(global, chatId);
  if (user) {
    return 'users';
  }

  const chat = selectChat(global, chatId);
  if (!chat) return undefined;

  if (isChatChannel(chat)) {
    return 'channels';
  }

  return 'chats';
}

export function selectIsChatBotNotStarted<T extends GlobalState>(global: T, chatId: string) {
  const bot = selectBot(global, chatId);
  if (!bot) {
    return false;
  }

  const lastMessage = selectChatLastMessage(global, chatId);
  if (lastMessage && isHistoryClearMessage(lastMessage)) {
    return true;
  }

  return Boolean(!lastMessage);
}

export function selectIsChatListed<T extends GlobalState>(
  global: T, chatId: string, type?: ChatListType,
): boolean {
  const { listIds } = global.chats;
  if (type) {
    const targetList = listIds[type];
    return Boolean(targetList && targetList.includes(chatId));
  }

  return Object.values(listIds).some((list) => list && list.includes(chatId));
}

export function selectChatListType<T extends GlobalState>(
  global: T, chatId: string,
): 'active' | 'archived' | undefined {
  const chat = selectChat(global, chatId);
  if (!chat || !selectIsChatListed(global, chatId)) {
    return undefined;
  }

  return chat.folderId === ARCHIVED_FOLDER_ID ? 'archived' : 'active';
}

export function selectChatFolder<T extends GlobalState>(global: T, folderId: number) {
  return global.chatFolders.byId[folderId];
}

export function selectIsChatPinned<T extends GlobalState>(
  global: T, chatId: string, folderId = ALL_FOLDER_ID,
): boolean {
  const { active, archived, saved } = global.chats.orderedPinnedIds;

  if (folderId === ALL_FOLDER_ID) {
    return Boolean(active?.includes(chatId));
  }

  if (folderId === ARCHIVED_FOLDER_ID) {
    return Boolean(archived?.includes(chatId));
  }

  if (folderId === SAVED_FOLDER_ID) {
    return Boolean(saved?.includes(chatId));
  }

  const { byId: chatFoldersById } = global.chatFolders;

  const { pinnedChatIds } = chatFoldersById[folderId] || {};
  return Boolean(pinnedChatIds?.includes(chatId));
}

// Slow, not to be used in `withGlobal`
export function selectChatByUsername<T extends GlobalState>(global: T, username: string) {
  const usernameLowered = username.toLowerCase();
  return Object.values(global.chats.byId).find(
    (chat) => chat.usernames?.some((c) => c.username.toLowerCase() === usernameLowered),
  );
}

export function selectIsServiceChatReady<T extends GlobalState>(global: T) {
  return Boolean(selectChat(global, SERVICE_NOTIFICATIONS_USER_ID));
}

export function selectSendAs<T extends GlobalState>(global: T, chatId: string) {
  const chat = selectChat(global, chatId);
  if (!chat) return undefined;

  const id = selectChatFullInfo(global, chatId)?.sendAsId;
  if (!id) return undefined;

  return selectUser(global, id) || selectChat(global, id);
}

export function selectRequestedDraft<T extends GlobalState>(
  global: T, chatId: string,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
) {
  const { requestedDraft } = selectTabState(global, tabId);
  if (requestedDraft?.chatId === chatId && !requestedDraft.files?.length) {
    return requestedDraft.text;
  }
  return undefined;
}

export function selectRequestedDraftFiles<T extends GlobalState>(
  global: T, chatId: string,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
) {
  const { requestedDraft } = selectTabState(global, tabId);
  if (requestedDraft?.chatId === chatId) {
    return requestedDraft.files;
  }
  return undefined;
}

export function filterChatIdsByType<T extends GlobalState>(
  global: T, chatIds: string[], filter: readonly ApiChatType[],
) {
  return chatIds.filter((id) => {
    const type = selectChatType(global, id);
    if (!type) {
      return false;
    }
    return filter.includes(type);
  });
}

export function selectRequestedChatTranslationLanguage<T extends GlobalState>(
  global: T, chatId: string,
  ...[tabId = getCurrentTabId()]: TabArgs<T>
) {
  const { requestedTranslations } = selectTabState(global, tabId);

  return requestedTranslations.byChatId[chatId]?.toLanguage;
}

export function selectSimilarChannelIds<T extends GlobalState>(
  global: T,
  chatId: string,
) {
  return global.chats.similarChannelsById[chatId];
}

export function selectChatLastMessageId<T extends GlobalState>(
  global: T, chatId: string, listType: 'all' | 'saved' = 'all',
) {
  return global.chats.lastMessageIds[listType]?.[chatId];
}

export function selectChatLastMessage<T extends GlobalState>(
  global: T, chatId: string, listType: 'all' | 'saved' = 'all',
) {
  const id = selectChatLastMessageId(global, chatId, listType);
  if (!id) return undefined;

  const realChatId = listType === 'saved' ? global.currentUserId! : chatId;
  return global.messages.byChatId[realChatId]?.byId[id];
}

export function selectIsMonoforumAdmin<T extends GlobalState>(
  global: T, chatId: string,
) {
  const chat = selectChat(global, chatId);
  if (!chat?.isMonoforum) return;

  const channel = selectMonoforumChannel(global, chatId);
  if (!channel) return;

  return Boolean(chat.isCreator || chat.adminRights || channel.isCreator || channel.adminRights);
}

/**
 * Only selects monoforum channel for monoforum chats.
 * Returns `undefined` for other chats, including channels that have linked monoforum.
 */
export function selectMonoforumChannel<T extends GlobalState>(
  global: T, chatId: string,
) {
  const chat = selectChat(global, chatId);
  if (!chat) return;

  return chat.isMonoforum ? selectChat(global, chat.linkedMonoforumId!) : undefined;
}
