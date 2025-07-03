import type { FC } from '../../lib/teact/teact';

import type { OwnProps } from './WalletPaymentPage';

import { Bundles } from '../../util/moduleLoader';

import useModuleLoader from '../../hooks/useModuleLoader';

const WalletPaymentPageAsync: FC<OwnProps> = (props) => {
  const { isOpen } = props;
  const WalletPaymentPage = useModuleLoader(Bundles.Extra, 'WalletPaymentPage', !isOpen);

  return WalletPaymentPage ? <WalletPaymentPage {...props} /> : undefined;
};

export default WalletPaymentPageAsync;
