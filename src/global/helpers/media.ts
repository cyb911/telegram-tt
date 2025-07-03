export function getStoryKey(chatId: string, storyId: number) {
  return `story${chatId}-${storyId}`;
}
