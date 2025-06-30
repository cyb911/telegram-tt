import type { FC } from '../../lib/teact/teact';

import type { OwnProps } from './WalletPaymentModal';

import { Bundles } from '../../util/moduleLoader';

import useModuleLoader from '../../hooks/useModuleLoader';

const WalletPaymentModalAsync: FC<OwnProps> = (props) => {
  const { isOpen } = props;
  const WalletPaymentModal = useModuleLoader(Bundles.Extra, 'WalletPaymentModal', !isOpen);

  return WalletPaymentModal ? <WalletPaymentModal {...props} /> : undefined;
};

export default WalletPaymentModalAsync;
