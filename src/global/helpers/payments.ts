import type {
  ApiInputInvoice,
  ApiInputSavedStarGift,
  ApiMessage,
  ApiRequestInputInvoice,
  ApiRequestInputSavedStarGift,
  ApiStarsAmount,
  ApiStarsTransaction,
} from '../../api/types';
import type { LangFn } from '../../util/localization';
import type { GlobalState } from '../types';

import arePropsShallowEqual from '../../util/arePropsShallowEqual';
import { selectChat, selectPeer, selectUser } from '../selectors';

export function getRequestInputInvoice<T extends GlobalState>(
  global: T, inputInvoice: ApiInputInvoice,
): ApiRequestInputInvoice | undefined {
  if (inputInvoice.type === 'slug') return inputInvoice;

  if (inputInvoice.type === 'stargiftResale') {
    const {
      slug,
      peerId,
    } = inputInvoice;
    const peer = selectPeer(global, peerId);

    if (!peer) return undefined;

    return {
      type: 'stargiftResale',
      slug,
      peer,
    };
  }

  if (inputInvoice.type === 'stargift') {
    const {
      peerId, shouldHideName, giftId, message, shouldUpgrade,
    } = inputInvoice;
    const peer = selectPeer(global, peerId);

    if (!peer) return undefined;

    return {
      type: 'stargift',
      peer,
      shouldHideName,
      giftId,
      message,
      shouldUpgrade,
    };
  }

  if (inputInvoice.type === 'starsgift') {
    const {
      userId, stars, amount, currency,
    } = inputInvoice;
    const user = selectUser(global, userId);

    if (!user) return undefined;

    return {
      type: 'stars',
      purpose: {
        type: 'starsgift',
        user,
        stars,
        amount,
        currency,
      },
    };
  }

  if (inputInvoice.type === 'stars') {
    const {
      stars, amount, currency,
    } = inputInvoice;

    return {
      type: 'stars',
      purpose: {
        type: 'stars',
        stars,
        amount,
        currency,
      },
    };
  }

  if (inputInvoice.type === 'chatInviteSubscription') {
    const { hash } = inputInvoice;

    return {
      type: 'chatInviteSubscription',
      hash,
    };
  }

  if (inputInvoice.type === 'message') {
    const chat = selectChat(global, inputInvoice.chatId);
    if (!chat) {
      return undefined;
    }
    return {
      type: 'message',
      chat,
      messageId: inputInvoice.messageId,
    };
  }

  if (inputInvoice.type === 'premiumGiftStars') {
    const {
      months, userId, message,
    } = inputInvoice;
    const user = selectUser(global, userId);

    if (!user) return undefined;

    return {
      type: 'premiumGiftStars',
      months,
      message,
      user,
    };
  }

  if (inputInvoice.type === 'giftcode') {
    const {
      userIds, boostChannelId, amount, currency, option, message,
    } = inputInvoice;
    const users = userIds.map((id) => selectUser(global, id)).filter(Boolean);
    const boostChannel = boostChannelId ? selectChat(global, boostChannelId) : undefined;

    return {
      type: 'giveaway',
      option,
      purpose: {
        type: 'giftcode',
        amount,
        currency,
        users,
        boostChannel,
        message,
      },
    };
  }

  if (inputInvoice.type === 'starsgiveaway') {
    const {
      chatId, additionalChannelIds, amount, currency, untilDate, areWinnersVisible, countries,
      isOnlyForNewSubscribers, prizeDescription, stars, users,
    } = inputInvoice;
    const chat = selectChat(global, chatId);
    if (!chat) {
      return undefined;
    }
    const additionalChannels = additionalChannelIds?.map((id) => selectChat(global, id)).filter(Boolean);

    return {
      type: 'starsgiveaway',
      purpose: {
        type: 'starsgiveaway',
        amount,
        currency,
        chat,
        additionalChannels,
        untilDate,
        areWinnersVisible,
        countries,
        isOnlyForNewSubscribers,
        prizeDescription,
        stars,
        users,
      },
    };
  }

  if (inputInvoice.type === 'giveaway') {
    const {
      chatId, additionalChannelIds, amount, currency, option, untilDate, areWinnersVisible, countries,
      isOnlyForNewSubscribers, prizeDescription,
    } = inputInvoice;
    const chat = selectChat(global, chatId);
    if (!chat) {
      return undefined;
    }
    const additionalChannels = additionalChannelIds?.map((id) => selectChat(global, id)).filter(Boolean);

    return {
      type: 'giveaway',
      option,
      purpose: {
        type: 'giveaway',
        amount,
        currency,
        chat,
        additionalChannels,
        untilDate,
        areWinnersVisible,
        countries,
        isOnlyForNewSubscribers,
        prizeDescription,
      },
    };
  }

  if (inputInvoice.type === 'stargiftUpgrade') {
    const { inputSavedGift, shouldKeepOriginalDetails } = inputInvoice;
    const savedGift = getRequestInputSavedStarGift(global, inputSavedGift);
    if (!savedGift) return undefined;

    return {
      type: 'stargiftUpgrade',
      inputSavedGift: savedGift,
      shouldKeepOriginalDetails,
    };
  }

  if (inputInvoice.type === 'stargiftTransfer') {
    const { inputSavedGift, recipientId } = inputInvoice;
    const savedGift = getRequestInputSavedStarGift(global, inputSavedGift);
    const peer = selectPeer(global, recipientId);
    if (!savedGift || !peer) return undefined;

    return {
      type: 'stargiftTransfer',
      inputSavedGift: savedGift,
      recipient: peer,
    };
  }

  return undefined;
}

export function getRequestInputSavedStarGift<T extends GlobalState>(
  global: T, inputGift: ApiInputSavedStarGift,
): ApiRequestInputSavedStarGift | undefined {
  if (inputGift.type === 'user') return inputGift;

  if (inputGift.type === 'chat') {
    const chat = selectChat(global, inputGift.chatId);
    if (!chat) return undefined;

    return {
      type: 'chat',
      chat,
      savedId: inputGift.savedId,
    };
  }

  return undefined;
}

export function formatStarsAmount(lang: LangFn, starsAmount: ApiStarsAmount) {
  return lang.number(starsAmount.amount + starsAmount.nanos / 1e9);
}

export function getStarsTransactionFromGift(message: ApiMessage): ApiStarsTransaction | undefined {
  const { action } = message.content;

  if (action?.type !== 'giftStars') return undefined;

  const { transactionId, stars } = action;

  return {
    id: transactionId,
    stars: {
      amount: stars,
      nanos: 0,
    },
    peer: {
      type: 'peer',
      id: message.isOutgoing ? message.chatId : (message.senderId || message.chatId),
    },
    date: message.date,
    isGift: true,
    isMyGift: message.isOutgoing || undefined,
  };
}

export function getPrizeStarsTransactionFromGiveaway(message: ApiMessage): ApiStarsTransaction | undefined {
  const { action } = message.content;

  if (action?.type !== 'prizeStars') return undefined;

  const { transactionId, stars, boostPeerId } = action;

  return {
    id: transactionId,
    stars: {
      amount: stars,
      nanos: 0,
    },
    peer: {
      type: 'peer',
      id: boostPeerId,
    },
    date: message.date,
    giveawayPostId: message.id,
  };
}

export function areInputSavedGiftsEqual(one: ApiInputSavedStarGift, two: ApiInputSavedStarGift) {
  return arePropsShallowEqual(one, two);
}
