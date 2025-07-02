import type { ApiMessage, ApiSponsoredMessage } from '../../../api/types';
import type { ThreadId } from '../../../types';

import {
  getMessageText,
} from '../../../global/helpers';
import { getMessageKey } from '../../../util/keys/messageKey';
import trimText from '../../../util/trimText';
import { renderTextWithEntities } from './renderTextWithEntities';

export function renderMessageText({
  message,
  highlight,
  emojiSize,
  asPreview,
  truncateLength,
  isProtected,
  forcePlayback,
  shouldRenderAsHtml,
  isForMediaViewer,
  threadId,
  maxTimestamp,
}: {
  message: ApiMessage | ApiSponsoredMessage;
  highlight?: string;
  emojiSize?: number;
  asPreview?: boolean;
  truncateLength?: number;
  isProtected?: boolean;
  forcePlayback?: boolean;
  shouldRenderAsHtml?: boolean;
  isForMediaViewer?: boolean;
  threadId?: ThreadId;
  maxTimestamp?: number;
}) {
  const { text, entities } = message.content.text || {};

  if (!text) {
    const contentNotSupportedText = getMessageText(message)?.text;
    return contentNotSupportedText ? [trimText(contentNotSupportedText, truncateLength)] : undefined;
  }

  const messageKey = getMessageKey(message);

  return renderTextWithEntities({
    text: trimText(text, truncateLength),
    entities,
    highlight,
    emojiSize,
    shouldRenderAsHtml,
    containerId: `${isForMediaViewer ? 'mv-' : ''}${messageKey}`,
    asPreview,
    isProtected,
    forcePlayback,
    messageId: 'id' in message ? message.id : undefined,
    chatId: message.chatId,
    threadId,
    maxTimestamp,
  });
}
