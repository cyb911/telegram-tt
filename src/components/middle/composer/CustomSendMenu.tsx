import type {
  ApiAvailableReaction,
  ApiReaction,
} from '../../../api/types';

import './CustomSendMenu.scss';

export type OwnProps = {
  isOpen: boolean;
  isOpenToBottom?: boolean;
  isSavedMessages?: boolean;
  canSchedule?: boolean;
  canScheduleUntilOnline?: boolean;
  onSendSilent?: NoneToVoidFunction;
  onSendSchedule?: NoneToVoidFunction;
  onSendWhenOnline?: NoneToVoidFunction;
  onRemoveEffect?: NoneToVoidFunction;
  onClose: NoneToVoidFunction;
  onCloseAnimationEnd?: NoneToVoidFunction;
  chatId?: string;
  withEffects?: boolean;
  hasCurrentEffect?: boolean;
  effectReactions?: ApiReaction[];
  allAvailableReactions?: ApiAvailableReaction[];
  onToggleReaction?: (reaction: ApiReaction) => void;
  canBuyPremium?: boolean;
  isCurrentUserPremium?: boolean;
  isInSavedMessages?: boolean;
  isInStoryViewer?: boolean;
  canPlayAnimatedEmojis?: boolean;
};
