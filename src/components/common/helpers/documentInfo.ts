import type { ApiDocument } from '../../../api/types';

export function getDocumentHasPreview(document: ApiDocument) {
  return Boolean(document.previewBlobUrl || document.thumbnail);
}
