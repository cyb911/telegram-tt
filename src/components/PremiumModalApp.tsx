import type { FC } from '@teact';
import { memo } from '@teact';
import { withGlobal } from '../global';

import { selectTabState } from '../global/selectors';

import PremiumMainModal from './main/premium/PremiumMainModal.async';

interface StateProps {
  isOpen: boolean;
}

const PremiumModalApp: FC<StateProps> = ({ isOpen }) => (
  <PremiumMainModal isOpen={isOpen} />
);

export default memo(withGlobal(
  (global): StateProps => ({
    isOpen: Boolean(selectTabState(global).premiumModal?.isOpen),
  }),
)(PremiumModalApp));
