import type {
  ApiMessage,
  ApiStory,
  ApiTypeStory,
} from '../../api/types';
import type {
  ApiPoll, MediaContainer, StatefulMediaContent,
} from '../../api/types/messages';
import type { GlobalState } from '../types';
import { ApiMessageEntityTypes } from '../../api/types';

import {
  CONTENT_NOT_SUPPORTED,
  RE_LINK_TEMPLATE,
  SERVICE_NOTIFICATIONS_USER_ID,
  VERIFICATION_CODES_USER_ID,
} from '../../config';
import { areSortedArraysIntersecting, unique } from '../../util/iteratees';
import { isLocalMessageId } from '../../util/keys/messageKey';
import { getGlobal } from '../index';

const RE_LINK = new RegExp(RE_LINK_TEMPLATE, 'i');

export function getMessageHtmlId(messageId: number, index?: number) {
  const parts = ['message', messageId.toString().replace('.', '-'), index].filter(Boolean);
  return parts.join('-');
}

export function getMessageTranscription(message: ApiMessage) {
  const { transcriptionId } = message;
  const global = getGlobal();

  return transcriptionId && global.transcriptions[transcriptionId]?.text;
}

export function hasMessageText(message: MediaContainer) {
  const {
    action, text, sticker, photo, video, audio, voice, document, pollId, webPage, contact, invoice, location,
    game, storyData, giveaway, giveawayResults, paidMedia,
  } = message.content;

  return Boolean(text) || !(
    sticker || photo || video || audio || voice || document || contact || pollId || webPage || invoice || location
    || game || storyData || giveaway || giveawayResults || paidMedia || action?.type === 'phoneCall'
  );
}

export function getMessageStatefulContent(global: GlobalState, message: ApiMessage): StatefulMediaContent {
  const poll = message.content.pollId ? global.messages.pollById[message.content.pollId] : undefined;

  const { peerId: storyPeerId, id: storyId } = message.content.storyData || {};
  const story = storyId && storyPeerId ? global.stories.byPeerId[storyPeerId]?.byId[storyId] : undefined;

  return groupStatefulContent({ poll, story });
}

export function groupStatefulContent({
  poll,
  story,
}: {
  poll?: ApiPoll;
  story?: ApiTypeStory;
}) {
  return {
    poll,
    story: story && 'content' in story ? story : undefined,
  };
}

export function getMessageText(message: MediaContainer) {
  return hasMessageText(message) ? message.content.text || { text: CONTENT_NOT_SUPPORTED } : undefined;
}

export function matchLinkInMessageText(message: ApiMessage) {
  const { text } = message.content;
  const match = text && text.text.match(RE_LINK);

  if (!match) {
    return undefined;
  }

  return {
    url: match[0],
    domain: match[3],
  };
}

export function isOwnMessage(message: ApiMessage) {
  return message.isOutgoing;
}

export function isForwardedMessage(message: ApiMessage) {
  return Boolean(message.forwardInfo || message.content.storyData);
}

export function isActionMessage(message: ApiMessage) {
  return Boolean(message.content.action);
}

export function isServiceNotificationMessage(message: ApiMessage) {
  return message.chatId === SERVICE_NOTIFICATIONS_USER_ID && Math.round(message.id) !== message.id;
}

export function isMessageLocal(message: ApiMessage) {
  return isLocalMessageId(message.id);
}

export function isMessageFailed(message: ApiMessage) {
  return message.sendingState === 'messageSendingStateFailed';
}

export function isHistoryClearMessage(message: ApiMessage) {
  return message.content.action && message.content.action.type === 'historyClear';
}

export function orderHistoryIds(listedIds: number[]) {
  return listedIds.sort((a, b) => a - b);
}

export function orderPinnedIds(pinnedIds: number[]) {
  return pinnedIds.sort((a, b) => b - a);
}

export function mergeIdRanges(ranges: number[][], idsUpdate: number[]): number[][] {
  let hasIntersection = false;
  let newOutlyingLists = ranges.length ? ranges.map((list) => {
    if (areSortedArraysIntersecting(list, idsUpdate) && !hasIntersection) {
      hasIntersection = true;
      return orderHistoryIds(unique(list.concat(idsUpdate)));
    }
    return list;
  }) : [idsUpdate];

  if (!hasIntersection) {
    newOutlyingLists = newOutlyingLists.concat([idsUpdate]);
  }

  newOutlyingLists.sort((a, b) => a[0] - b[0]);

  let length = newOutlyingLists.length;
  for (let i = 0; i < length; i++) {
    const array = newOutlyingLists[i];
    const prevArray = newOutlyingLists[i - 1];

    if (prevArray && (prevArray.includes(array[0]) || prevArray.includes(array[0] - 1))) {
      newOutlyingLists[i - 1] = orderHistoryIds(unique(array.concat(prevArray)));
      newOutlyingLists.splice(i, 1);

      length--;
      i--;
    }
  }

  return newOutlyingLists;
}

export function extractMessageText(message: ApiMessage | ApiStory, inChatList = false) {
  const contentText = message.content.text;
  if (!contentText) return undefined;

  const { text } = contentText;
  let { entities } = contentText;

  if (text && 'chatId' in message) {
    if (message.chatId === SERVICE_NOTIFICATIONS_USER_ID) {
      const authCode = text.match(/^\D*([\d-]{5,7})\D/)?.[1];
      if (authCode) {
        entities = [
          ...entities || [],
          {
            type: inChatList ? ApiMessageEntityTypes.Spoiler : ApiMessageEntityTypes.Code,
            offset: text.indexOf(authCode),
            length: authCode.length,
          },
        ];
        entities.sort((a, b) => (a.offset > b.offset ? 1 : -1));
      }
    }

    if (inChatList && message.chatId === VERIFICATION_CODES_USER_ID && entities) {
      // Wrap code entities in spoiler
      const hasCodeEntities = entities.some((entity) => entity.type === ApiMessageEntityTypes.Code);
      if (hasCodeEntities) {
        const oldEntities = entities;
        entities = [];

        for (let i = 0; i < oldEntities.length; i++) {
          const entity = oldEntities[i];
          if (entity.type === ApiMessageEntityTypes.Code) {
            entities.push({
              type: ApiMessageEntityTypes.Spoiler,
              offset: entity.offset,
              length: entity.length,
            });
          }
          entities.push(entity);
        }
      }
    }
  }

  return { text, entities };
}

export function isExpiredMessage(message: ApiMessage) {
  return message.content.action?.type === 'expired';
}

export function hasMessageTtl(message: ApiMessage) {
  return message.content?.ttlSeconds !== undefined;
}

export function splitMessagesForForwarding(messages: ApiMessage[], limit: number): ApiMessage[][] {
  const result: ApiMessage[][] = [];
  let currentArr: ApiMessage[] = [];

  // Group messages by `groupedId`
  messages.reduce<ApiMessage[][]>((acc, message) => {
    const lastGroup = acc[acc.length - 1];
    if (message.groupedId && lastGroup?.[0]?.groupedId === message.groupedId) {
      lastGroup.push(message);
      return acc;
    }

    acc.push([message]);
    return acc;
  }, []).forEach((batch) => {
    // Fit them into `limit` size
    if (currentArr.length + batch.length > limit) {
      result.push(currentArr);
      currentArr = [];
    }

    currentArr.push(...batch);
  });

  if (currentArr.length) {
    result.push(currentArr);
  }

  return result;
}
