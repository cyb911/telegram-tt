import type { ApiChat, ApiMessage, ApiReactionWithPaid } from '../../api/types';
import type { GlobalState } from '../types';

import { updateReactionCount } from '../helpers';
import { selectIsChatWithSelf, selectSendAs } from '../selectors';
import { updateChat } from './chats';
import { updateChatMessage } from './messages';

export function subtractXForEmojiInteraction(global: GlobalState, x: number) {
  return x;
}

export function addMessageReaction<T extends GlobalState>(
  global: T, message: ApiMessage, userReactions: ApiReactionWithPaid[],
): T {
  const isInSavedMessages = selectIsChatWithSelf(global, message.chatId);
  const currentReactions = message.reactions || { results: [], areTags: isInSavedMessages };
  const currentSendAs = selectSendAs(global, message.chatId);

  // Update UI without waiting for server response
  const results = updateReactionCount(currentReactions.results, userReactions);

  let { recentReactions = [] } = currentReactions;

  if (recentReactions.length) {
    recentReactions = recentReactions.filter(({ isOwn, peerId }) => !isOwn && peerId !== global.currentUserId);
  }

  userReactions.forEach((reaction) => {
    const { currentUserId } = global;
    if (reaction.type === 'paid') return;
    recentReactions.unshift({
      peerId: currentSendAs?.id || currentUserId!,
      reaction,
      addedDate: Math.floor(Date.now() / 1000),
      isOwn: true,
    });
  });

  return updateChatMessage(global, message.chatId, message.id, {
    reactions: {
      ...currentReactions,
      results,
      recentReactions,
    },
  });
}

export function updateUnreadReactions<T extends GlobalState>(
  global: T, chatId: string, update: Pick<ApiChat, 'unreadReactionsCount' | 'unreadReactions'>,
): T {
  return updateChat(global, chatId, update, true);
}
