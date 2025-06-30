import type { UniqueCustomPeer } from '../../types';

export const CUSTOM_PEER_PREMIUM: UniqueCustomPeer = {
  isCustomPeer: true,
  type: 'premium',
  titleKey: 'PrivacyPremium',
  subtitleKey: 'PrivacyPremiumText',
  avatarIcon: 'star',
  isAvatarSquare: true,
  withPremiumGradient: true,
};

export const CUSTOM_PEER_HIDDEN: UniqueCustomPeer<'hidden'> = {
  isCustomPeer: true,
  type: 'hidden',
  titleKey: 'StarsTransactionHidden',
  avatarIcon: 'author-hidden',
  peerColorId: 4,
};
