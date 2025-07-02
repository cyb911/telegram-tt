import type {
  ApiDimensions,
} from '../../../api/types';

export const REM = parseInt(getComputedStyle(document.documentElement).fontSize, 10);
export const AVATAR_FULL_DIMENSIONS = { width: 640, height: 640 };

export function getPictogramDimensions(): ApiDimensions {
  return {
    width: 2 * REM,
    height: 2 * REM,
  };
}

export function getDocumentThumbnailDimensions(smaller?: boolean): ApiDimensions {
  if (smaller) {
    return {
      width: 3 * REM,
      height: 3 * REM,
    };
  }

  return {
    width: 3.375 * REM,
    height: 3.375 * REM,
  };
}

