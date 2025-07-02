import { addExtraClass } from '../../lib/teact/teact-dom';

import { requestMutation } from '../../lib/fasterdom/fasterdom';
import { removeVS16s } from '../../lib/twemojiRegex';
import withCache from '../withCache';

export const LOADED_EMOJIS = new Set<string>();

export function handleEmojiLoad(event: React.SyntheticEvent<HTMLImageElement>) {
  const emoji = event.currentTarget;

  LOADED_EMOJIS.add(event.currentTarget.dataset.path!);

  requestMutation(() => {
    addExtraClass(emoji, 'open');
  });
}

export function nativeToUnified(emoji: string) {
  let code;

  if (emoji.length === 1) {
    code = emoji.charCodeAt(0).toString(16).padStart(4, '0');
  } else {
    const pairs = [];
    for (let i = 0; i < emoji.length; i++) {
      if (emoji.charCodeAt(i) >= 0xd800 && emoji.charCodeAt(i) <= 0xdbff) {
        if (emoji.charCodeAt(i + 1) >= 0xdc00 && emoji.charCodeAt(i + 1) <= 0xdfff) {
          pairs.push(
            (emoji.charCodeAt(i) - 0xd800) * 0x400
            + (emoji.charCodeAt(i + 1) - 0xdc00) + 0x10000,
          );
        }
      } else if (emoji.charCodeAt(i) < 0xd800 || emoji.charCodeAt(i) > 0xdfff) {
        pairs.push(emoji.charCodeAt(i));
      }
    }

    code = pairs.map((x) => x.toString(16).padStart(4, '0')).join('-');
  }

  return code;
}

function nativeToUnifiedExtended(emoji: string) {
  return nativeToUnified(removeVS16s(emoji));
}

export const nativeToUnifiedExtendedWithCache = withCache(nativeToUnifiedExtended);
