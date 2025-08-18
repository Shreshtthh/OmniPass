import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { mainnet, polygon, bsc } from 'wagmi/chains';

export const config = getDefaultConfig({
  appName: 'OmniPass',
  projectId: 'YOUR_WALLETCONNECT_PROJECT_ID', // Get this from WalletConnect
  chains: [mainnet, polygon, bsc],
  ssr: true, // If your dApp uses server side rendering (SSR)
});

export const supportedChains = [
  {
    id: 1,
    name: 'Ethereum',
    color: '#627EEA',
    protocols: ['Aave V3', 'Compound']
  },
  {
    id: 56,
    name: 'BSC',
    color: '#F3BA2F',
    protocols: ['Venus Protocol', 'PancakeSwap']
  },
  {
    id: 137,
    name: 'Polygon',
    color: '#8247E5',
    protocols: ['Aave V3', 'QuickSwap']
  }
];