import type { ApiChat, ApiPeer, ApiUser } from '../../api/types';
import type { OldLangFn } from '../../hooks/useOldLang';
import type { CustomPeer } from '../../types';

import { type LangFn } from '../../util/localization';
import { getChatTitle } from './chats';
import { getUserFirstOrLastName } from './users';

export function isApiPeerChat(peer: ApiPeer): peer is ApiChat {
  return 'title' in peer;
}

export function isApiPeerUser(peer: ApiPeer): peer is ApiUser {
  return !isApiPeerChat(peer);
}

export function getPeerTitle(lang: OldLangFn | LangFn, peer: ApiPeer | CustomPeer) {
  if (!peer) return undefined;
  if ('isCustomPeer' in peer) {
    // TODO: Remove any after full migration to new lang
    return peer.titleKey ? lang(peer.titleKey as any) : peer.title;
  }
  return isApiPeerUser(peer) ? getUserFirstOrLastName(peer) : getChatTitle(lang, peer);
}
