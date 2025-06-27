import type { ApiMessage } from '../../api/types';

export type SearchResultKey = `${string}_${number}`;

export function getSearchResultKey(message: ApiMessage): SearchResultKey {
  const { chatId, id } = message;

  return `${chatId}_${id}`;
}
