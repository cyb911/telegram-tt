import type {
  ApiAudio,
  ApiDocument,
  ApiMediaExtendedPreview,
  ApiMessage,
  ApiMessageSearchType,
  ApiPhoto,
  ApiSticker,
  ApiVideo,
  ApiVoice,
  ApiWebDocument,
  MediaContainer,
} from '../../api/types';
import { ApiMediaFormat } from '../../api/types';

import {
  IS_OPFS_SUPPORTED,
  IS_OPUS_SUPPORTED,
  IS_PROGRESSIVE_SUPPORTED,
  IS_SAFARI,
  MAX_BUFFER_SIZE,
} from '../../util/browser/windowEnvironment';
import { getDocumentHasPreview } from '../../components/common/helpers/documentInfo';
import { matchLinkInMessageText } from './messages';

export type MediaWithThumbs = ApiPhoto | ApiVideo | ApiDocument | ApiSticker | ApiMediaExtendedPreview;
export type DownloadableMedia = ApiPhoto | ApiVideo | ApiDocument | ApiSticker | ApiAudio | ApiVoice | ApiWebDocument;

type Target =
  'micro'
  | 'pictogram'
  | 'inline'
  | 'preview'
  | 'full'
  | 'download';

export function getMessageContent(message: MediaContainer) {
  return message.content;
}

export function getMessagePhoto(message: MediaContainer) {
  return message.content.photo;
}

export function getMessageActionPhoto(message: MediaContainer) {
  return message.content.action?.type === 'suggestProfilePhoto' ? message.content.action.photo : undefined;
}

export function getMessageVideo(message: MediaContainer) {
  return message.content.video;
}

export function getMessageAudio(message: MediaContainer) {
  return message.content.audio;
}

export function getMessageVoice(message: MediaContainer) {
  return message.content.voice;
}

export function getMessageSticker(message: MediaContainer) {
  return message.content.sticker;
}

export function getMessageDocument(message: MediaContainer) {
  return message.content.document;
}

export function getMessageWebPageDocument(message: MediaContainer) {
  return getMessageWebPage(message)?.document;
}

export function isDocumentPhoto(document: ApiDocument) {
  return document.innerMediaType === 'photo';
}

export function isDocumentVideo(document: ApiDocument) {
  return document.innerMediaType === 'video';
}

export function isMessageDocumentSticker(message: MediaContainer) {
  const document = getMessageDocument(message);
  return document ? document.mimeType === 'image/webp' : undefined;
}

export function getMessageInvoice(message: MediaContainer) {
  return message.content.invoice;
}

export function getMessageWebPage(message: MediaContainer) {
  return message.content.webPage;
}

export function getMessageWebPagePhoto(message: MediaContainer) {
  return getMessageWebPage(message)?.photo;
}

export function getMessageWebPageVideo(message: MediaContainer) {
  return getMessageWebPage(message)?.video;
}

export function getMessageWebPageAudio(message: MediaContainer) {
  return getMessageWebPage(message)?.audio;
}

export function getMessageDownloadableMedia(message: MediaContainer): DownloadableMedia | undefined {
  return (
    getMessagePhoto(message)
    || getMessageVideo(message)
    || getMessageDocument(message)
    || getMessageSticker(message)
    || getMessageAudio(message)
    || getMessageVoice(message)
    || getMessageWebPagePhoto(message)
    || getMessageWebPageVideo(message)
    || getMessageWebPageAudio(message)
  );
}

function getMessageMediaThumbnail(message: MediaContainer) {
  const media = getMessagePhoto(message)
    || getMessageVideo(message)
    || getMessageDocument(message)
    || getMessageSticker(message)
    || getMessageWebPagePhoto(message)
    || getMessageWebPageVideo(message)
    || getMessageInvoice(message)?.extendedMedia;

  if (!media) {
    return undefined;
  }

  return media.thumbnail;
}

export function getMessageMediaThumbDataUri(message: MediaContainer) {
  return getMessageMediaThumbnail(message)?.dataUri;
}

export function getPhotoMediaHash(photo: ApiPhoto | ApiDocument, target: Target, isAction?: boolean) {
  const base = `photo${photo.id}`;
  const isVideo = photo.mediaType === 'photo' && photo.isVideo;

  switch (target) {
    case 'micro':
    case 'pictogram':
      return `${base}?size=${isAction ? 'a' : 'm'}`;
    case 'inline':
      return !hasMediaLocalBlobUrl(photo) ? `${base}?size=${isAction ? 'b' : 'x'}` : undefined;
    case 'preview':
      return `${base}?size=${isAction ? 'b' : 'x'}`;
    case 'download':
      return !isVideo ? base : getVideoProfilePhotoMediaHash(photo);
    case 'full':
    default:
      return base;
  }
}

export function getVideoProfilePhotoMediaHash(photo: ApiPhoto) {
  if (!photo.isVideo) return undefined;
  return `photo${photo.id}?size=u`;
}

export function getVideoMediaHash(video: ApiVideo | ApiDocument, target: Target) {
  const base = `document${video.id}`;

  switch (target) {
    case 'micro':
    case 'pictogram':
      return `${base}?size=m`;
    case 'inline':
      return !hasMediaLocalBlobUrl(video) ? appendProgressiveQueryParameters(video, base) : undefined;
    case 'preview':
      return `${base}?size=x`;
    case 'download':
      return `${base}?download`;
    case 'full':
    default:
      return appendProgressiveQueryParameters(video, base);
  }
}

export function getDocumentMediaHash(document: ApiDocument, target: Target) {
  const base = `document${document.id}`;

  switch (target) {
    case 'micro':
    case 'pictogram':
    case 'inline':
    case 'preview':
      if (!getDocumentHasPreview(document) || hasMediaLocalBlobUrl(document)) {
        return undefined;
      }

      return `${base}?size=m`;
    case 'full':
    case 'download':
    default:
      return base;
  }
}

export function getAudioMediaHash(audio: ApiAudio, target: Target) {
  const base = `document${audio.id}`;

  switch (target) {
    case 'micro':
    case 'pictogram':
      return getAudioHasCover(audio) ? `${base}?size=m` : undefined;
    case 'inline':
      return appendProgressiveQueryParameters(audio, base);
    case 'download':
      return `${base}?download`;
    default:
      return base;
  }
}

export function getVoiceMediaHash(voice: ApiVoice, target: Target) {
  const base = `document${voice.id}`;

  switch (target) {
    case 'micro':
    case 'pictogram':
      return undefined;
    case 'download':
      return `${base}?download`;
    case 'inline':
    default:
      return base;
  }
}

export function getWebDocumentHash(webDocument?: ApiWebDocument) {
  if (!webDocument) return undefined;
  return `webDocument:${webDocument.url}`;
}

export function getStickerMediaHash(sticker: ApiSticker, target: Target) {
  const base = `document${sticker.id}`;

  switch (target) {
    case 'micro':
    case 'pictogram':
      if (!sticker.previewPhotoSizes?.some((size) => size.type === 's')) {
        return getStickerMediaHash(sticker, 'preview');
      }
      return `${base}?size=s`;
    case 'preview':
      return `${base}?size=m`;
    case 'download':
      return `${base}?download`;
    case 'inline':
    default:
      return base;
  }
}

export function getMediaHash(media: DownloadableMedia, target: Target) {
  switch (media.mediaType) {
    case 'photo':
      return getPhotoMediaHash(media, target);
    case 'video':
      return getVideoMediaHash(media, target);
    case 'document':
      return getDocumentMediaHash(media, target);
    case 'audio':
      return getAudioMediaHash(media, target);
    case 'voice':
      return getVoiceMediaHash(media, target);
    case 'sticker':
      return getStickerMediaHash(media, target);
    case 'webDocument':
      return getWebDocumentHash(media);
    default:
      return undefined;
  }
}

export function appendProgressiveQueryParameters(media: ApiAudio | ApiVideo | ApiDocument, base: string) {
  if (IS_PROGRESSIVE_SUPPORTED && IS_SAFARI) {
    const url = new URL(base, window.location.href);
    url.searchParams.append('fileSize', media.size.toString());
    url.searchParams.append('mimeType', media.mimeType);
    return url.toString();
  }

  return base;
}

export function getAudioHasCover(media: ApiAudio) {
  return media.thumbnailSizes && media.thumbnailSizes.length > 0;
}

export function getMediaFormat(
  media: DownloadableMedia, target: Target,
): ApiMediaFormat {
  const isDocument = media.mediaType === 'document';
  const hasInnerVideo = isDocument && media.innerMediaType === 'video';
  const isVideo = media.mediaType === 'video' || hasInnerVideo;
  const isAudio = media.mediaType === 'audio';
  const isVoice = media.mediaType === 'voice';

  const size = getMediaFileSize(media) || 0; // Media types that do not have `size` are smaller than `MAX_BUFFER_SIZE`

  if (target === 'download') {
    if (IS_PROGRESSIVE_SUPPORTED && size > MAX_BUFFER_SIZE && !IS_OPFS_SUPPORTED) {
      return ApiMediaFormat.DownloadUrl;
    }
    return ApiMediaFormat.BlobUrl;
  }

  if (isVideo && IS_PROGRESSIVE_SUPPORTED && (
    target === 'full' || target === 'inline'
  )) {
    return ApiMediaFormat.Progressive;
  }

  if (isAudio || isVoice) {
    // Safari
    if (isVoice && !IS_OPUS_SUPPORTED) {
      return ApiMediaFormat.BlobUrl;
    }

    return ApiMediaFormat.Progressive;
  }

  return ApiMediaFormat.BlobUrl;
}

export function getMediaFileSize(media: DownloadableMedia) {
  return 'size' in media ? media.size : undefined;
}

export function hasMediaLocalBlobUrl(media: ApiPhoto | ApiVideo | ApiDocument) {
  if ('blobUrl' in media) {
    return Boolean(media.blobUrl);
  }

  if ('previewBlobUrl' in media) {
    return Boolean(media.previewBlobUrl);
  }

  return false;
}

export function getChatMediaMessageIds(
  messages: Record<number, ApiMessage>, listedIds: number[], isFromSharedMedia = false,
) {
  return getMessageContentIds(messages, listedIds, isFromSharedMedia ? 'media' : 'inlineMedia');
}

export function getMessageContentIds(
  messages: Record<number, ApiMessage>, messageIds: number[], contentType: ApiMessageSearchType | 'inlineMedia',
) {
  let validator: (message: ApiMessage) => unknown;

  switch (contentType) {
    case 'media':
      validator = (message: ApiMessage) => {
        const video = getMessageVideo(message);
        return getMessagePhoto(message) || (video && !video.isRound && !video.isGif);
      };
      break;

    case 'documents':
      validator = getMessageDocument;
      break;

    case 'links':
      validator = (message: ApiMessage) => getMessageWebPage(message) || matchLinkInMessageText(message);
      break;

    case 'audio':
      validator = getMessageAudio;
      break;

    case 'voice':
      validator = (message: ApiMessage) => {
        const video = getMessageVideo(message);
        return getMessageVoice(message) || (video && video.isRound);
      };
      break;

    case 'inlineMedia':
      validator = (message: ApiMessage) => {
        const video = getMessageVideo(message);
        const document = getMessageDocument(message);
        return (
          getMessagePhoto(message)
          || (video && !video.isRound && !video.isGif)
          || (document && isDocumentPhoto(document))
          || (document && isDocumentVideo(document))
        );
      };
      break;

    default:
      return [] as Array<number>;
  }

  return messageIds.reduce((result, messageId) => {
    if (messages[messageId] && validator(messages[messageId])) {
      result.push(messageId);
    }

    return result;
  }, [] as Array<number>);
}

export function isMediaLoadableInViewer(newMessage: ApiMessage) {
  if (!newMessage.content) return false;
  if (newMessage.content.photo) return true;
  if (newMessage.content.video && !newMessage.content.video.isRound && !newMessage.content.video.isGif) return true;
  return false;
}

export function getMediaFilename(media: DownloadableMedia) {
  if ('fileName' in media && media.fileName) {
    return media.fileName;
  }

  if (media.mediaType === 'sticker') {
    const extension = media.isLottie ? 'tgs' : media.isVideo ? 'webm' : 'webp';
    return `${media.id}.${extension}`;
  }

  if (media.mediaType === 'photo') {
    return `${media.id}.${media.isVideo ? 'mp4' : 'jpg'}`;
  }

  if (media.mediaType === 'voice') {
    return `${media.id}.${IS_OPUS_SUPPORTED ? 'ogg' : 'wav'}`;
  }

  if ('id' in media && media.id) {
    return media.id;
  }

  return `${media.mediaType}-${Math.random().toString(36).slice(4)}`;
}

export function getTimestampableMedia(message: MediaContainer) {
  const video = getMessageVideo(message) || getMessageWebPageVideo(message);
  return (video && !video.isRound && !video.isGif ? video : undefined)
    || getMessageAudio(message)
    || getMessageVoice(message);
}
