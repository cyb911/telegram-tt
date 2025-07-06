import type { ActionReturnType } from '../../types';

import { addActionHandler } from '../../index';

const MAX_RECENTLY_FOUND_IDS = 10;

addActionHandler('addRecentlyFoundChatId', (global, actions, payload): ActionReturnType => {
  const { id } = payload;
  const { recentlyFoundChatIds } = global;

  if (!recentlyFoundChatIds) {
    return {
      ...global,
      recentlyFoundChatIds: [id],
    };
  }

  const newRecentIds = recentlyFoundChatIds.filter((chatId) => chatId !== id);
  newRecentIds.unshift(id);
  if (newRecentIds.length > MAX_RECENTLY_FOUND_IDS) {
    newRecentIds.pop();
  }

  return {
    ...global,
    recentlyFoundChatIds: newRecentIds,
  };
});

addActionHandler('clearRecentlyFoundChats', (global): ActionReturnType => {
  return {
    ...global,
    recentlyFoundChatIds: undefined,
  };
});
