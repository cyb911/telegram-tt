import useWalletPayment from '../../hooks/useWalletPayment';

import '../payment/WalletPaymentModal.scss';

const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

const WALLET_LIST = [
  { name: 'MetaMask钱包', logo: './wallet/metamask.svg' },
  { name: 'TronLink钱包', logo: './wallet/4.png' },
  { name: 'imToken钱包', logo: './wallet/1.png' },
  { name: 'TokenPocket', logo: './wallet/2.png' },
  { name: 'BitGet钱包', logo: './wallet/3.png' },
  { name: 'Bitpie钱包', logo: './wallet/5.png' },
];

const orderInfo = {
  orderNo: '20250611200635756528',
  goodsDesc: '（提货专用链接）请根据客服沟通指引下单，请勿乱拍',
  buyCount: '1件',
  payAmount: '0.10 USDT',
};

export default function WalletPaymentModal() {
  const {
    selectedWallet,
    setSelectedWallet,
    openPayment,
  } = useWalletPayment();

  return (
    <div className="payment-modal">
      {isMobile && !window.ethereum && (
        <p style={{ color: 'red', fontWeight: 'bold' }}>
          您尚未安装
          {' '}
          <strong>MetaMask</strong>
        </p>
      )}

      <div className="order-info-box">
        <div className="info-item">
          <span className="label">商品订单</span>
          <span className="value">{orderInfo.orderNo}</span>
        </div>
        <div className="info-item">
          <span className="label">商品详情</span>
          <span className="value">{orderInfo.goodsDesc}</span>
        </div>
        <div className="info-item">
          <span className="label">购买数量</span>
          <span className="value">{orderInfo.buyCount}</span>
        </div>
        <div className="info-item">
          <span className="label">付款金额</span>
          <span className="value">{orderInfo.payAmount}</span>
        </div>
      </div>

      <div className="wallet-select-box">
        <h3 className="title">选择付款钱包</h3>
        {WALLET_LIST.map((wallet, index) => (
          <div
            key={index}
            className="wallet-item"
            onClick={() => setSelectedWallet(wallet.name)}
          >
            <img src={wallet.logo} alt="钱包图标" className="wallet-logo" />
            <span className="wallet-name">{wallet.name}</span>
            <input
              type="radio"
              name="wallet"
              value={wallet.name}
              checked={selectedWallet === wallet.name}
              onChange={() => setSelectedWallet(wallet.name)}
              className="wallet-radio"
            />
          </div>
        ))}
      </div>

      <button
        className="pay-button"
        onClick={openPayment}
        disabled={!selectedWallet}
      >
        打开支付
      </button>
    </div>
  );
}
