import type { ApiUser } from '../../api/types';

import { SERVICE_NOTIFICATIONS_USER_ID } from '../../config';
import { formatPhoneNumber } from '../../util/phoneNumber';

export function getUserFirstOrLastName(user?: ApiUser) {
  if (!user) {
    return undefined;
  }

  switch (user.type) {
    case 'userTypeBot':
      return user.firstName;
    case 'userTypeRegular': {
      return user.firstName || user.lastName;
    }

    case 'userTypeDeleted':
    case 'userTypeUnknown': {
      return 'Deleted';
    }

    default:
      return undefined;
  }
}

export function getUserFullName(user?: ApiUser) {
  if (!user) {
    return undefined;
  }

  if (isDeletedUser(user)) {
    return 'Deleted Account';
  }

  switch (user.type) {
    case 'userTypeBot':
    case 'userTypeRegular': {
      if (user.firstName && user.lastName) {
        return `${user.firstName} ${user.lastName}`;
      }

      if (user.firstName) {
        return user.firstName;
      }

      if (user.lastName) {
        return user.lastName;
      }

      if (user.phoneNumber) {
        return `+${formatPhoneNumber(user.phoneNumber)}`;
      }

      break;
    }
  }

  return undefined;
}

export function isDeletedUser(user: ApiUser) {
  return (user.type === 'userTypeDeleted' || user.type === 'userTypeUnknown')
    && user.id !== SERVICE_NOTIFICATIONS_USER_ID;
}

export function isUserBot(user: ApiUser) {
  return user.type === 'userTypeBot';
}

export function getPeerStoryHtmlId(userId: string) {
  return `peer-story${userId}`;
}
