/*
 * Thanks to Ace Monkey for this mind-blowing patch.
 */

export function isSafariPatchInProgress(audioEl: HTMLAudioElement) {
  return Boolean(audioEl.dataset.patchForSafariInProgress);
}
