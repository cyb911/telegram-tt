import { memo } from '@teact';
import type { FC } from '../../lib/teact/teact';

import useWalletPayment from '../../hooks/useWalletPayment';

import Button from '../ui/Button';
import Modal from '../ui/Modal';

export type OwnProps = {
  isOpen?: boolean;
  onClose: NoneToVoidFunction;
};

const WalletPaymentModal: FC<OwnProps> = ({ isOpen, onClose }) => {
  const { startPayment, isProcessing } = useWalletPayment();

  return (
    <Modal isOpen={isOpen} onClose={onClose} hasCloseButton>
      <div className="payment-modal-content">
        <p>Wallet payment</p>
        <Button onClick={startPayment} isLoading={isProcessing}>
          Pay
        </Button>
      </div>
    </Modal>
  );
};

export default memo(WalletPaymentModal);
