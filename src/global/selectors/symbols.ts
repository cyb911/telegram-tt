import type { ApiSticker, ApiStickerSet, ApiStickerSetInfo } from '../../api/types';
import type { GlobalState } from '../types';

import { RESTRICTED_EMOJI_SET_ID } from '../../config';
import { selectIsCurrentUserPremium } from './users';

export function selectIsStickerFavorite<T extends GlobalState>(global: T, sticker: ApiSticker) {
  const { stickers } = global.stickers.favorite;
  return stickers && stickers.some(({ id }) => id === sticker.id);
}

export function selectStickerSet<T extends GlobalState>(global: T, id: string | ApiStickerSetInfo) {
  if (typeof id === 'string') {
    return global.stickers.setsById[id];
  }

  if ('id' in id) {
    return global.stickers.setsById[id.id];
  }

  if ('isMissing' in id) return undefined;

  return Object.values(global.stickers.setsById).find(({ shortName }) => (
    shortName.toLowerCase() === id.shortName.toLowerCase()
  ));
}

export function selectStickersForEmoji<T extends GlobalState>(global: T, emoji: string) {
  const addedSets = global.stickers.added.setIds;
  let stickersForEmoji: ApiSticker[] = [];
  // Favorites
  global.stickers.favorite.stickers.forEach((sticker) => {
    if (sticker.emoji === emoji) stickersForEmoji.push(sticker);
  });

  // Added sets
  addedSets?.forEach((id) => {
    const packs = global.stickers.setsById[id].packs;
    if (!packs) {
      return;
    }

    stickersForEmoji = stickersForEmoji.concat(packs[emoji] || [], packs[cleanEmoji(emoji)] || []);
  });
  return stickersForEmoji;
}

export function selectCustomEmojiForEmoji<T extends GlobalState>(global: T, emoji: string) {
  const isCurrentUserPremium = selectIsCurrentUserPremium(global);
  const addedCustomSets = global.customEmojis.added.setIds;
  let customEmojiForEmoji: ApiSticker[] = [];

  // Added sets
  addedCustomSets?.forEach((id) => {
    const packs = global.stickers.setsById[id].packs;
    if (!packs) {
      return;
    }

    customEmojiForEmoji = customEmojiForEmoji.concat(packs[emoji] || [], packs[cleanEmoji(emoji)] || []);
  });
  return isCurrentUserPremium ? customEmojiForEmoji : customEmojiForEmoji.filter(({ isFree }) => isFree);
}

export function selectIsSetPremium(stickerSet: Pick<ApiStickerSet, 'stickers' | 'isEmoji'>) {
  return stickerSet.isEmoji && stickerSet.stickers?.some((sticker) => !sticker.isFree);
}

function cleanEmoji(emoji: string) {
  // Some emojis (❤️ for example) with a service symbol 'VARIATION SELECTOR-16' are not recognized as animated
  return emoji.replace('\ufe0f', '');
}

export function selectAnimatedEmojiEffect<T extends GlobalState>(global: T, emoji: string) {
  const { animatedEmojiEffects } = global;
  if (!animatedEmojiEffects || !animatedEmojiEffects.stickers) {
    return undefined;
  }

  const cleanedEmoji = cleanEmoji(emoji);

  return animatedEmojiEffects.stickers.find((sticker) => sticker.emoji === emoji || sticker.emoji === cleanedEmoji);
}

export function selectIsAlwaysHighPriorityEmoji<T extends GlobalState>(
  global: T, stickerSet: ApiStickerSetInfo | ApiStickerSet,
) {
  if (!('id' in stickerSet)) return false;
  return stickerSet.id === global.appConfig?.defaultEmojiStatusesStickerSetId
    || stickerSet.id === RESTRICTED_EMOJI_SET_ID;
}
