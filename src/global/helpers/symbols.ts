export function getStickerHashById(stickerId: string, isPreview?: boolean) {
  const base = `sticker${stickerId}`;
  return !isPreview ? base : `${base}?size=m`;
}
