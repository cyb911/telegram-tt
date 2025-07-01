import type { FC } from '@teact';
import { memo } from '@teact';
import { getActions, withGlobal } from '../global';

import type { TabState } from '../global/types';

import { selectTabState } from '../global/selectors';

import PremiumMainModal from './main/premium/PremiumMainModal.async';
import WalletPaymentModal from './payment/WalletPaymentModal.async';

interface StateProps {
  isOpen: boolean;
  walletModal?: TabState['walletPaymentModal'];
}

const PremiumModalApp: FC<StateProps> = ({ isOpen, walletModal }) => {
  const actions = getActions();

  return (
    <>
      <PremiumMainModal isOpen={isOpen} />
      <WalletPaymentModal
        isOpen={Boolean(walletModal)}
        orderInfo={walletModal?.invoice as any}
        onClose={actions.closeWalletPaymentModal}
      />
    </>
  );
};

export default memo(withGlobal(
  (global): StateProps => ({
    isOpen: Boolean(selectTabState(global).premiumModal?.isOpen),
    walletModal: selectTabState(global).walletPaymentModal,
  }),
)(PremiumModalApp));
