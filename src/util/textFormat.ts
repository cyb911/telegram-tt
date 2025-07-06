import EMOJI_REGEX from '../lib/twemojiRegex';
import fixNonStandardEmoji from './emoji/fixNonStandardEmoji';
import withCache from './withCache';

export function formatInteger(value: number) {
  return String(value).replace(/\d(?=(\d{3})+$)/g, '$& ');
}

export const getFirstLetters = withCache((phrase: string, count = 2) => {
  return phrase
    .replace(/[.,!@#$%^&*()_+=\-`~[\]/\\{}:"|<>?]+/gi, '')
    .trim()
    .split(/\s+/)
    .slice(0, count)
    .map((word: string) => {
      if (!word.length) return '';
      word = fixNonStandardEmoji(word);
      const emojis = word.match(EMOJI_REGEX);
      if (emojis && word.startsWith(emojis[0])) {
        return emojis[0];
      }
      return word.match(/./u)![0].toUpperCase();
    })
    .join('');
});
