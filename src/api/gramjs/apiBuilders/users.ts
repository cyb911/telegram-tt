import { Api as GramJs } from '../../../lib/gramjs';

import type {
  ApiBirthday,
  ApiPeerSettings,
  ApiUser,
  ApiUserFullInfo,
  ApiUserStatus,
  ApiUserType,
} from '../../types';

import { buildApiBusinessIntro, buildApiBusinessLocation, buildApiBusinessWorkHours } from './business';
import {
  buildApiBotVerification, buildApiPhoto, buildApiUsernames, buildAvatarPhotoId,
} from './common';
import { buildApiDisallowedGiftsSettings } from './gifts';
import { omitVirtualClassFields } from './helpers';
import { buildApiEmojiStatus, buildApiPeerColor, buildApiPeerId } from './peers';

export function buildApiUserFullInfo(mtpUserFull: GramJs.users.UserFull): ApiUserFullInfo {
  const {
    fullUser: {
      about, commonChatsCount, pinnedMsgId, blocked,
      profilePhoto, voiceMessagesForbidden, hasScheduled,
      fallbackPhoto, personalPhoto, translationsDisabled, storiesPinnedAvailable,
      contactRequirePremium, businessWorkHours, businessLocation, businessIntro,
      birthday, personalChannelId, personalChannelMessage, sponsoredEnabled, stargiftsCount, botVerification,
      botCanManageEmojiStatus, settings, sendPaidMessagesStars, displayGiftsButton, disallowedGifts,
    },
  } = mtpUserFull;

  return {
    bio: about,
    commonChatsCount,
    pinnedMessageId: pinnedMsgId,
    isBlocked: Boolean(blocked),
    noVoiceMessages: voiceMessagesForbidden,
    hasPinnedStories: Boolean(storiesPinnedAvailable),
    isTranslationDisabled: translationsDisabled,
    profilePhoto: profilePhoto instanceof GramJs.Photo ? buildApiPhoto(profilePhoto) : undefined,
    fallbackPhoto: fallbackPhoto instanceof GramJs.Photo ? buildApiPhoto(fallbackPhoto) : undefined,
    personalPhoto: personalPhoto instanceof GramJs.Photo ? buildApiPhoto(personalPhoto) : undefined,
    isContactRequirePremium: contactRequirePremium,
    shouldDisplayGiftsButton: displayGiftsButton,
    disallowedGifts: disallowedGifts && buildApiDisallowedGiftsSettings(disallowedGifts),
    birthday: birthday && buildApiBirthday(birthday),
    businessLocation: businessLocation && buildApiBusinessLocation(businessLocation),
    businessWorkHours: businessWorkHours && buildApiBusinessWorkHours(businessWorkHours),
    businessIntro: businessIntro && buildApiBusinessIntro(businessIntro),
    personalChannelId: personalChannelId && buildApiPeerId(personalChannelId, 'channel'),
    personalChannelMessageId: personalChannelMessage,
    botVerification: botVerification && buildApiBotVerification(botVerification),
    areAdsEnabled: sponsoredEnabled,
    starGiftCount: stargiftsCount,
    isBotCanManageEmojiStatus: botCanManageEmojiStatus,
    hasScheduledMessages: hasScheduled,
    paidMessagesStars: sendPaidMessagesStars?.toJSNumber(),
    settings: buildApiPeerSettings(settings),
  };
}

export function buildApiPeerSettings({
  autoarchived,
  reportSpam,
  addContact,
  blockContact,
  registrationMonth,
  phoneCountry,
  nameChangeDate,
  photoChangeDate,
  chargePaidMessageStars,
}: GramJs.PeerSettings): ApiPeerSettings {
  return {
    isAutoArchived: Boolean(autoarchived),
    canReportSpam: Boolean(reportSpam),
    canAddContact: Boolean(addContact),
    canBlockContact: Boolean(blockContact),
    registrationMonth,
    phoneCountry,
    nameChangeDate,
    photoChangeDate,
    chargedPaidMessageStars: chargePaidMessageStars?.toJSNumber(),
  };
}

export function buildApiUser(mtpUser: GramJs.TypeUser): ApiUser | undefined {
  if (!(mtpUser instanceof GramJs.User)) {
    return undefined;
  }

  const {
    id, firstName, lastName, fake, scam, support, closeFriend, storiesUnavailable, storiesMaxId,
    bot, botActiveUsers, botVerificationIcon, botInlinePlaceholder, botAttachMenu, botCanEdit,
    sendPaidMessagesStars, username,
  } = mtpUser;
  const hasVideoAvatar = mtpUser.photo instanceof GramJs.UserProfilePhoto ? Boolean(mtpUser.photo.hasVideo) : undefined;
  const avatarPhotoId = mtpUser.photo && buildAvatarPhotoId(mtpUser.photo);
  const userType = buildApiUserType(mtpUser);
  const usernames = buildApiUsernames(mtpUser);
  const emojiStatus = mtpUser.emojiStatus ? buildApiEmojiStatus(mtpUser.emojiStatus) : undefined;

  return {
    id: buildApiPeerId(id, 'user'),
    isMin: Boolean(mtpUser.min),
    fakeType: scam ? 'scam' : (fake ? 'fake' : undefined),
    ...(mtpUser.self && { isSelf: true }),
    isPremium: Boolean(mtpUser.premium),
    ...(mtpUser.verified && { isVerified: true }),
    ...(closeFriend && { isCloseFriend: true }),
    ...(support && { isSupport: true }),
    ...((mtpUser.contact || mtpUser.mutualContact) && { isContact: true }),
    type: userType,
    firstName,
    lastName,
    hasMainMiniApp: Boolean(mtpUser.botHasMainApp),
    canEditBot: botCanEdit,
    ...(userType === 'userTypeBot' && { canBeInvitedToGroup: !mtpUser.botNochats }),
    ...(usernames && { usernames }),
    hasUsername: Boolean(username),
    phoneNumber: mtpUser.phone || '',
    noStatus: !mtpUser.status,
    ...(mtpUser.accessHash && { accessHash: String(mtpUser.accessHash) }),
    avatarPhotoId,
    emojiStatus,
    hasVideoAvatar,
    areStoriesHidden: Boolean(mtpUser.storiesHidden),
    maxStoryId: storiesMaxId,
    hasStories: Boolean(storiesMaxId) && !storiesUnavailable,
    ...(bot && botInlinePlaceholder && { botPlaceholder: botInlinePlaceholder }),
    ...(bot && botAttachMenu && { isAttachBot: botAttachMenu }),
    botActiveUsers,
    botVerificationIconId: botVerificationIcon?.toString(),
    color: mtpUser.color && buildApiPeerColor(mtpUser.color),
    paidMessagesStars: sendPaidMessagesStars?.toJSNumber(),
  };
}

function buildApiUserType(user: GramJs.User): ApiUserType {
  if (user.bot) {
    return 'userTypeBot';
  }
  if (user.deleted) {
    return 'userTypeDeleted';
  }

  return 'userTypeRegular';
}

export function buildApiUserStatus(mtpStatus?: GramJs.TypeUserStatus): ApiUserStatus {
  if (!mtpStatus || mtpStatus instanceof GramJs.UserStatusEmpty) {
    return { type: 'userStatusEmpty' };
  } else if (mtpStatus instanceof GramJs.UserStatusOnline) {
    return { type: 'userStatusOnline', expires: mtpStatus.expires };
  } else if (mtpStatus instanceof GramJs.UserStatusOffline) {
    return { type: 'userStatusOffline', wasOnline: mtpStatus.wasOnline };
  } else if (mtpStatus instanceof GramJs.UserStatusRecently) {
    return { type: 'userStatusRecently', isReadDateRestrictedByMe: mtpStatus.byMe };
  } else if (mtpStatus instanceof GramJs.UserStatusLastWeek) {
    return { type: 'userStatusLastWeek', isReadDateRestrictedByMe: mtpStatus.byMe };
  } else {
    return { type: 'userStatusLastMonth', isReadDateRestrictedByMe: mtpStatus.byMe };
  }
}

export function buildApiUserStatuses(mtpUsers: GramJs.TypeUser[]) {
  const userStatusesById: Record<string, ApiUserStatus> = {};
  mtpUsers.forEach((mtpUser) => {
    if ('status' in mtpUser) {
      const userId = buildApiPeerId(mtpUser.id, 'user');
      userStatusesById[userId] = buildApiUserStatus(mtpUser.status);
    }
  });

  return userStatusesById;
}

export function buildApiBirthday(birthday: GramJs.TypeBirthday): ApiBirthday {
  return omitVirtualClassFields(birthday);
}
