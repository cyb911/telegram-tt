import type {
  ApiChat,
  ApiChatAdminRights,
  ApiChatBannedRights,
  ApiChatFullInfo,
  ApiPeer,
  ApiTopic,
} from '../../api/types';
import type { OldLangFn } from '../../hooks/useOldLang';
import type {
  ThreadId,
} from '../../types';
import type { LangFn } from '../../util/localization';
import { MAIN_THREAD_ID } from '../../api/types';

import {
  ANONYMOUS_USER_ID,
  ARCHIVED_FOLDER_ID, REPLIES_USER_ID,
  VERIFICATION_CODES_USER_ID,
} from '../../config';
import { getPeerIdDividend, isUserId } from '../../util/entities/ids';
import { getGlobal } from '..';
import { isSystemBot } from './bots';

export function isChatGroup(chat: ApiChat) {
  return isChatBasicGroup(chat) || isChatSuperGroup(chat);
}

export function isChatBasicGroup(chat: ApiChat) {
  return chat.type === 'chatTypeBasicGroup';
}

export function isChatSuperGroup(chat: ApiChat) {
  return chat.type === 'chatTypeSuperGroup';
}

export function isChatChannel(chat: ApiChat) {
  return chat.type === 'chatTypeChannel';
}

export function isChatMonoforum(chat: ApiChat) {
  return chat.isMonoforum;
}

export function isCommonBoxChat(chat: ApiChat) {
  return chat.type === 'chatTypePrivate' || chat.type === 'chatTypeBasicGroup';
}

export function isChatWithRepliesBot(chatId: string) {
  return chatId === REPLIES_USER_ID;
}

export function isChatWithVerificationCodesBot(chatId: string) {
  return chatId === VERIFICATION_CODES_USER_ID;
}

export function isAnonymousForwardsChat(chatId: string) {
  return chatId === ANONYMOUS_USER_ID;
}

export function getChatTypeString(chat: ApiChat) {
  switch (chat.type) {
    case 'chatTypePrivate':
      return 'PrivateChat';
    case 'chatTypeBasicGroup':
    case 'chatTypeSuperGroup':
      return 'AccDescrGroup';
    case 'chatTypeChannel':
      return 'AccDescrChannel';
    default:
      return 'Chat';
  }
}

export function getPrivateChatUserId(chat: ApiChat) {
  if (chat.type !== 'chatTypePrivate' && chat.type !== 'chatTypeSecret') {
    return undefined;
  }
  return chat.id;
}

export function getChatTitle(lang: OldLangFn | LangFn, chat: ApiChat, isSelf = false) {
  if (isSelf) {
    return lang('SavedMessages');
  }
  return chat.title || lang('HiddenName');
}

export function getChatAvatarHash(
  owner: ApiPeer,
  size: 'normal' | 'big' = 'normal',
  avatarPhotoId = owner.avatarPhotoId,
) {
  if (!avatarPhotoId) {
    return undefined;
  }

  switch (size) {
    case 'big':
      return `profile${owner.id}?${avatarPhotoId}`;
    default:
      return `avatar${owner.id}?${avatarPhotoId}`;
  }
}

export function isChatAdmin(chat: ApiChat) {
  return Boolean(chat.adminRights || chat.isCreator);
}

export function getHasAdminRight(chat: ApiChat, key: keyof ApiChatAdminRights) {
  return chat.adminRights?.[key] || false;
}

export function isUserRightBanned(chat: ApiChat, key: keyof ApiChatBannedRights, chatFullInfo?: ApiChatFullInfo) {
  const unrestrictedByBoosts = chatFullInfo?.boostsToUnrestrict
    && (chatFullInfo.boostsApplied || 0) >= chatFullInfo.boostsToUnrestrict;
  return Boolean(
    (chat.currentUserBannedRights?.[key])
    || (chat.defaultBannedRights?.[key] && !unrestrictedByBoosts),
  );
}

export function getCanPostInChat(
  chat: ApiChat, topic?: ApiTopic, isMessageThread?: boolean, chatFullInfo?: ApiChatFullInfo,
) {
  if (topic) {
    if (chat.isForum) {
      if (chat.isNotJoined) {
        return false;
      }

      if (topic?.isClosed && !topic.isOwner && !getHasAdminRight(chat, 'manageTopics')) {
        return false;
      }
    }
  }

  if (chat.isRestricted || chat.isForbidden || chat.migratedTo
    || (chat.isNotJoined && !isChatMonoforum(chat) && !isMessageThread)
    || isSystemBot(chat.id) || isAnonymousForwardsChat(chat.id)) {
    return false;
  }

  if (chat.isCreator) {
    return true;
  }

  if (isUserId(chat.id)) {
    return true;
  }

  if (isChatChannel(chat)) {
    return getHasAdminRight(chat, 'postMessages');
  }

  return isChatAdmin(chat) || !isUserRightBanned(chat, 'sendMessages', chatFullInfo);
}

export interface IAllowedAttachmentOptions {
  canAttachMedia: boolean;
  canAttachPolls: boolean;
  canSendStickers: boolean;
  canSendGifs: boolean;
  canAttachEmbedLinks: boolean;
  canSendPhotos: boolean;
  canSendVideos: boolean;
  canSendRoundVideos: boolean;
  canSendAudios: boolean;
  canSendVoices: boolean;
  canSendPlainText: boolean;
  canSendDocuments: boolean;
}

export function getAllowedAttachmentOptions(
  chat?: ApiChat,
  chatFullInfo?: ApiChatFullInfo,
  isChatWithBot = false,
  isSavedMessages = false,
  isStoryReply = false,
  paidMessagesStars?: number,
  isInScheduledList = false,
): IAllowedAttachmentOptions {
  if (!chat || (paidMessagesStars && isInScheduledList)) {
    return {
      canAttachMedia: false,
      canAttachPolls: false,
      canSendStickers: false,
      canSendGifs: false,
      canAttachEmbedLinks: false,
      canSendPhotos: false,
      canSendVideos: false,
      canSendRoundVideos: false,
      canSendAudios: false,
      canSendVoices: false,
      canSendPlainText: false,
      canSendDocuments: false,
    };
  }

  const isAdmin = isChatAdmin(chat);

  return {
    canAttachMedia: isAdmin || isStoryReply || !isUserRightBanned(chat, 'sendMedia', chatFullInfo),
    canAttachPolls: !isStoryReply && !chat.isMonoforum
      && (isAdmin || !isUserRightBanned(chat, 'sendPolls', chatFullInfo))
      && (!isUserId(chat.id) || isChatWithBot || isSavedMessages),
    canSendStickers: isAdmin || isStoryReply || !isUserRightBanned(chat, 'sendStickers', chatFullInfo),
    canSendGifs: isAdmin || isStoryReply || !isUserRightBanned(chat, 'sendGifs', chatFullInfo),
    canAttachEmbedLinks: !isStoryReply && (isAdmin || !isUserRightBanned(chat, 'embedLinks', chatFullInfo)),
    canSendPhotos: isAdmin || isStoryReply || !isUserRightBanned(chat, 'sendPhotos', chatFullInfo),
    canSendVideos: isAdmin || isStoryReply || !isUserRightBanned(chat, 'sendVideos', chatFullInfo),
    canSendRoundVideos: isAdmin || isStoryReply || !isUserRightBanned(chat, 'sendRoundvideos', chatFullInfo),
    canSendAudios: isAdmin || isStoryReply || !isUserRightBanned(chat, 'sendAudios', chatFullInfo),
    canSendVoices: isAdmin || isStoryReply || !isUserRightBanned(chat, 'sendVoices', chatFullInfo),
    canSendPlainText: isAdmin || isStoryReply || !isUserRightBanned(chat, 'sendPlain', chatFullInfo),
    canSendDocuments: isAdmin || isStoryReply || !isUserRightBanned(chat, 'sendDocs', chatFullInfo),
  };
}

export function isChatArchived(chat: ApiChat) {
  return chat.folderId === ARCHIVED_FOLDER_ID;
}

export function getCanDeleteChat(chat: ApiChat) {
  return isChatBasicGroup(chat) || ((isChatSuperGroup(chat) || isChatChannel(chat)) && chat.isCreator);
}

export function isChatPublic(chat: ApiChat) {
  return chat.hasUsername;
}

export function getPeerColorKey(peer: ApiPeer | undefined) {
  if (peer?.color?.color) return peer.color.color;

  return peer ? getPeerIdDividend(peer.id) % 7 : 0;
}

export function getPeerColorCount(peer: ApiPeer) {
  const key = getPeerColorKey(peer);
  const global = getGlobal();
  return global.peerColors?.general[key].colors?.length || 1;
}

export function getIsSavedDialog(chatId: string, threadId: ThreadId | undefined, currentUserId: string | undefined) {
  return chatId === currentUserId && threadId !== MAIN_THREAD_ID;
}

export function getGroupStatus(lang: OldLangFn, chat: ApiChat) {
  const chatTypeString = lang(getChatTypeString(chat));
  const { membersCount } = chat;

  if (chat.isRestricted) {
    return chatTypeString === 'Channel' ? 'channel is inaccessible' : 'group is inaccessible';
  }

  if (!membersCount) {
    return chatTypeString;
  }

  return chatTypeString === 'Channel'
    ? lang('Subscribers', membersCount, 'i')
    : lang('Members', membersCount, 'i');
}
