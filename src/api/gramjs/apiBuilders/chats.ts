import { Api as GramJs } from '../../../lib/gramjs';
import type { Entity } from '../../../lib/gramjs/types';

import type {
  ApiChat,
  ApiChatAdminRights,
  ApiChatBannedRights,
  ApiChatInviteImporter,
  ApiExportedInvite,
  ApiRestrictionReason,
  ApiSendAsPeerId,
  ApiSponsoredMessageReportResult,
  ApiStarsSubscriptionPricing,
} from '../../types';

import { pick } from '../../../util/iteratees';
import { serializeBytes } from '../helpers/misc';
import {
  buildApiUsernames, buildAvatarPhotoId,
} from './common';
import { omitVirtualClassFields } from './helpers';
import {
  buildApiEmojiStatus,
  buildApiPeerColor,
  buildApiPeerId,
  getApiChatIdFromMtpPeer,
} from './peers';

type PeerEntityApiChatFields = Omit<ApiChat, (
  'id' | 'type' | 'title' |
  'lastReadOutboxMessageId' | 'lastReadInboxMessageId' |
  'unreadCount' | 'unreadMentionsCount' | 'isMuted'
)>;

function buildApiChatFieldsFromPeerEntity(
  peerEntity: Entity,
  isSupport = false,
): PeerEntityApiChatFields {
  const user = peerEntity instanceof GramJs.User ? peerEntity : undefined;
  const channel = peerEntity instanceof GramJs.Channel ? peerEntity : undefined;

  const userOrChannel = user || channel;

  // Shared fields
  const isMin = Boolean('min' in peerEntity && peerEntity.min);
  const accessHash = ('accessHash' in peerEntity) ? String(peerEntity.accessHash) : undefined;
  const hasVideoAvatar = 'photo' in peerEntity && peerEntity.photo && 'hasVideo' in peerEntity.photo
    && peerEntity.photo.hasVideo;
  const avatarPhotoId = ('photo' in peerEntity) && peerEntity.photo ? buildAvatarPhotoId(peerEntity.photo) : undefined;
  const hasUsername = Boolean('username' in peerEntity && peerEntity.username);

  const usernames = buildApiUsernames(peerEntity);

  // Chat and channel shared fields
  const isCallActive = 'callActive' in peerEntity && peerEntity.callActive;
  const isCallNotEmpty = 'callNotEmpty' in peerEntity && peerEntity.callNotEmpty;
  const creationDate = 'date' in peerEntity ? peerEntity.date : undefined;
  const membersCount = 'participantsCount' in peerEntity ? peerEntity.participantsCount : undefined;
  const isProtected = 'noforwards' in peerEntity && peerEntity.noforwards;
  const isCreator = 'creator' in peerEntity && peerEntity.creator;

  // User and channel shared fields
  const isScam = userOrChannel?.scam;
  const isFake = userOrChannel?.fake;
  const areStoriesHidden = userOrChannel?.storiesHidden;
  const maxStoryId = userOrChannel?.storiesMaxId;
  const botVerificationIconId = userOrChannel?.botVerificationIcon?.toString();
  const storiesUnavailable = userOrChannel?.storiesUnavailable;
  const color = userOrChannel?.color ? buildApiPeerColor(userOrChannel.color) : undefined;
  const emojiStatus = userOrChannel?.emojiStatus ? buildApiEmojiStatus(userOrChannel.emojiStatus) : undefined;
  const paidMessagesStars = userOrChannel?.sendPaidMessagesStars;
  const isVerified = userOrChannel?.verified;

  return {
    isMin,
    isLinkedInDiscussion: channel?.hasLink,
    areSignaturesShown: channel?.signatures,
    areProfilesShown: channel?.signatureProfiles,
    usernames,
    accessHash,
    hasVideoAvatar,
    avatarPhotoId,
    isVerified,
    isCallActive,
    isCallNotEmpty,
    creationDate,
    hasUsername,
    ...(membersCount !== undefined && { membersCount }),
    isProtected,
    isSupport: isSupport || undefined,
    isCreator,
    fakeType: isScam ? 'scam' : (isFake ? 'fake' : undefined),
    color,
    isJoinToSend: channel?.joinToSend,
    isJoinRequest: channel?.joinRequest,
    isForum: channel?.forum,
    isMonoforum: channel?.monoforum,
    linkedMonoforumId: channel?.linkedMonoforumId && buildApiPeerId(channel.linkedMonoforumId, 'channel'),
    areChannelMessagesAllowed: channel?.broadcastMessagesAllowed,
    areStoriesHidden,
    maxStoryId,
    hasStories: Boolean(maxStoryId) && !storiesUnavailable,
    emojiStatus,
    boostLevel: channel?.level,
    botVerificationIconId,
    hasGeo: channel?.hasGeo,
    subscriptionUntil: channel?.subscriptionUntilDate,
    paidMessagesStars: paidMessagesStars?.toJSNumber(),
    level: channel?.level,
    hasAutoTranslation: channel?.autotranslation,

    ...buildApiChatPermissions(peerEntity),
    ...buildApiChatRestrictions(peerEntity),
    ...buildApiChatMigrationInfo(peerEntity),
  };
}

function buildApiChatPermissions(peerEntity: GramJs.TypeUser | GramJs.TypeChat): {
  adminRights?: ApiChatAdminRights;
  currentUserBannedRights?: ApiChatBannedRights;
  defaultBannedRights?: ApiChatBannedRights;
} {
  if (!(peerEntity instanceof GramJs.Chat || peerEntity instanceof GramJs.Channel)) {
    return {};
  }

  return {
    adminRights: peerEntity.adminRights ? omitVirtualClassFields(peerEntity.adminRights) : undefined,
    currentUserBannedRights: 'bannedRights' in peerEntity && peerEntity.bannedRights
      ? omitVirtualClassFields(peerEntity.bannedRights)
      : undefined,
    defaultBannedRights: peerEntity.defaultBannedRights
      ? omitVirtualClassFields(peerEntity.defaultBannedRights)
      : undefined,
  };
}

function buildApiChatRestrictions(peerEntity: GramJs.TypeUser | GramJs.TypeChat): {
  isNotJoined?: boolean;
  isForbidden?: boolean;
  isRestricted?: boolean;
  restrictionReason?: ApiRestrictionReason;
} {
  if (peerEntity instanceof GramJs.ChatForbidden) {
    return {
      isForbidden: true,
    };
  }

  if (peerEntity instanceof GramJs.ChannelForbidden) {
    return {
      isRestricted: true,
    };
  }

  const restrictions = {};

  if ('restricted' in peerEntity) {
    const restrictionReason = peerEntity.restricted
      ? buildApiChatRestrictionReason(peerEntity.restrictionReason)
      : undefined;

    if (restrictionReason) {
      Object.assign(restrictions, {
        isRestricted: true,
        restrictionReason,
      });
    }
  }

  if (peerEntity instanceof GramJs.Chat) {
    Object.assign(restrictions, {
      isNotJoined: peerEntity.left,
    });
  }

  if (peerEntity instanceof GramJs.Channel) {
    Object.assign(restrictions, {
      // `left` is weirdly set to `true` on all channels never joined before
      isNotJoined: peerEntity.left,
    });
  }

  return restrictions;
}

function buildApiChatMigrationInfo(peerEntity: Entity): {
  migratedTo?: {
    chatId: string;
    accessHash?: string;
  };
} {
  if (
    'migratedTo' in peerEntity
    && peerEntity.migratedTo
    && !(peerEntity.migratedTo instanceof GramJs.InputChannelEmpty)
  ) {
    return {
      migratedTo: {
        chatId: getApiChatIdFromMtpPeer(peerEntity.migratedTo),
        ...(peerEntity.migratedTo instanceof GramJs.InputChannel && {
          accessHash: String(peerEntity.migratedTo.accessHash),
        }),
      },
    };
  }

  return {};
}

function buildApiChatRestrictionReason(
  restrictionReasons?: GramJs.RestrictionReason[],
): ApiRestrictionReason | undefined {
  if (!restrictionReasons) {
    return undefined;
  }

  const targetReason = restrictionReasons.find(({ platform }) => platform === 'all');
  return targetReason ? pick(targetReason, ['reason', 'text']) : undefined;
}

export function buildApiChatFromPreview(
  preview: GramJs.TypeChat | GramJs.TypeUser,
  isSupport = false,
): ApiChat | undefined {
  if (preview instanceof GramJs.ChatEmpty || preview instanceof GramJs.UserEmpty) {
    return undefined;
  }
  const id = buildApiPeerId(
    preview.id,
    preview instanceof GramJs.User ? 'user'
      : (preview instanceof GramJs.Chat || preview instanceof GramJs.ChatForbidden) ? 'chat' : 'channel',
  );

  return {
    id,
    type: getApiChatTypeFromPeerEntity(preview),
    title: preview instanceof GramJs.User ? getUserName(preview) : preview.title,
    ...buildApiChatFieldsFromPeerEntity(preview, isSupport),
  };
}

export function getApiChatTypeFromPeerEntity(peerEntity: GramJs.TypeChat | GramJs.TypeUser) {
  if (peerEntity instanceof GramJs.User || peerEntity instanceof GramJs.UserEmpty) {
    return 'chatTypePrivate';
  } else if (
    peerEntity instanceof GramJs.Chat
    || peerEntity instanceof GramJs.ChatForbidden
    || peerEntity instanceof GramJs.ChatEmpty
  ) {
    return 'chatTypeBasicGroup';
  } else {
    return peerEntity.megagroup ? 'chatTypeSuperGroup' : 'chatTypeChannel';
  }
}

function getUserName(user: GramJs.User) {
  return user.firstName
    ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}`
    : (user.lastName || '');
}

export function buildApiExportedInvite(invite: GramJs.ChatInviteExported): ApiExportedInvite {
  const {
    revoked,
    date,
    expireDate,
    link,
    permanent,
    startDate,
    usage,
    usageLimit,
    requested,
    requestNeeded,
    title,
    adminId,
  } = invite;
  return {
    isRevoked: revoked,
    date,
    expireDate,
    link,
    isPermanent: permanent,
    startDate,
    usage,
    usageLimit,
    isRequestNeeded: requestNeeded,
    requested,
    title,
    adminId: buildApiPeerId(adminId, 'user'),
  };
}

export function buildChatInviteImporter(importer: GramJs.ChatInviteImporter): ApiChatInviteImporter {
  const {
    userId,
    date,
    about,
    requested,
    viaChatlist,
  } = importer;
  return {
    userId: buildApiPeerId(userId, 'user'),
    date,
    about,
    isRequested: requested,
    isFromChatList: viaChatlist,
  };
}

export function buildApiSendAsPeerId(sendAs: GramJs.SendAsPeer): ApiSendAsPeerId {
  return {
    id: getApiChatIdFromMtpPeer(sendAs.peer),
    isPremium: sendAs.premiumRequired,
  };
}

export function buildApiSponsoredMessageReportResult(
  result: GramJs.channels.TypeSponsoredMessageReportResult,
): ApiSponsoredMessageReportResult {
  if (result instanceof GramJs.channels.SponsoredMessageReportResultReported) {
    return {
      type: 'reported',
    };
  }

  if (result instanceof GramJs.channels.SponsoredMessageReportResultAdsHidden) {
    return {
      type: 'hidden',
    };
  }

  const title = result.title;
  const options = result.options.map((option) => ({
    text: option.text,
    option: serializeBytes(option.option),
  }));

  return {
    type: 'selectOption',
    title,
    options,
  };
}

export function buildApiStarsSubscriptionPricing(
  pricing: GramJs.StarsSubscriptionPricing,
): ApiStarsSubscriptionPricing {
  return {
    period: pricing.period,
    amount: pricing.amount.toJSNumber(),
  };
}
