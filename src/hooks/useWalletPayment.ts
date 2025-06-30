import { useState } from '../lib/teact/teact';

export default function useWalletPayment() {
  const [isProcessing, setProcessing] = useState(false);

  const startPayment = async () => {
    setProcessing(true);
    // TODO: integrate wallet payment logic
    setProcessing(false);
  };

  return {
    startPayment,
    isProcessing,
  };
}
