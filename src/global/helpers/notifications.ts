import type {
  ApiChat,
  ApiNotifyPeerType,
  ApiPeer,
  ApiPeerNotifySettings,
} from '../../api/types';

import { isUserId } from '../../util/entities/ids';
import { omitUndefined } from '../../util/iteratees';
import { getServerTime } from '../../util/serverTime';
import { isChatChannel } from './chats';

export function getIsChatMuted(
  chat: ApiChat,
  notifyDefaults?: Record<ApiNotifyPeerType, ApiPeerNotifySettings>,
  notifyException?: ApiPeerNotifySettings,
) {
  const settings = getChatNotifySettings(chat, notifyDefaults, notifyException);
  if (!settings?.mutedUntil) return false;
  return getServerTime() < settings.mutedUntil;
}

export function getChatNotifySettings(
  chat: ApiChat,
  notifyDefaults?: Record<ApiNotifyPeerType, ApiPeerNotifySettings>,
  notifyException?: ApiPeerNotifySettings,
): ApiPeerNotifySettings | undefined {
  const defaults = notifyDefaults?.[getNotificationPeerType(chat)];

  if (!notifyException && !defaults) {
    return undefined;
  }

  return {
    ...defaults,
    ...(notifyException && omitUndefined(notifyException)),
  };
}

export function getNotificationPeerType(peer: ApiPeer): ApiNotifyPeerType {
  if (isUserId(peer.id)) {
    return 'users';
  }

  const chat = peer as ApiChat;
  return isChatChannel(chat) ? 'channels' : 'groups';
}
