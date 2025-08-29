// lib/wagmi.ts
import { createConfig, http } from 'wagmi'
import { sepolia, polygonAmoy } from 'wagmi/chains'
import { injected, metaMask, walletConnect } from 'wagmi/connectors'

// Define ZetaChain Athens 3 testnet
export const zetaChainAthens3 = {
  id: 7001,
  name: 'ZetaChain Athens 3',
  nativeCurrency: {
    decimals: 18,
    name: 'ZETA',
    symbol: 'ZETA',
  },
  rpcUrls: {
    public: { http: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'] },
    default: { http: ['https://zetachain-athens-evm.blockpi.network/v1/rpc/public'] },
  },
  blockExplorers: {
    default: { name: 'ZetaScan', url: 'https://athens3.explorer.zetachain.com' },
  },
  contracts: {
    multicall3: {
      address: '0xcA11bde05977b3631167028862bE2a173976CA11',
      blockCreated: 1963112,
    },
  },
  testnet: true,
} as const;

export const config = createConfig({
  chains: [sepolia, polygonAmoy, zetaChainAthens3],
  connectors: [
    injected({ shimDisconnect: true }),
    metaMask(),
    walletConnect({
      projectId: import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || 'demo',
    }),
  ],
  transports: {
    [sepolia.id]: http(`https://eth-sepolia.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`),
    [polygonAmoy.id]: http(`https://polygon-amoy.g.alchemy.com/v2/${import.meta.env.VITE_ALCHEMY_API_KEY}`),
    [zetaChainAthens3.id]: http(),
  },
})

export const supportedChains = [
  {
    id: 11155111, // Sepolia
    name: 'Sepolia',
    color: '#627EEA',
    protocols: ['Aave V3 (Testnet)'],
    faucet: 'https://sepoliafaucet.com/',
    explorer: 'https://sepolia.etherscan.io',
    isTestnet: true
  },
  {
    id: 80002, // Polygon Amoy  
    name: 'Polygon Amoy',
    color: '#8247E5',
    protocols: ['Aave V3 (Testnet)'],
    faucet: 'https://faucet.polygon.technology/',
    explorer: 'https://amoy.polygonscan.com',
    isTestnet: true
  },
  {
    id: 7001, // ZetaChain Athens 3
    name: 'ZetaChain Athens 3',
    color: '#00D4AA',
    protocols: ['OmniPass Credential'],
    faucet: 'https://labs.zetachain.com/get-zeta',
    explorer: 'https://athens3.explorer.zetachain.com',
    isTestnet: true
  }
];

// Helper function to check if current network is supported
export const isSupportedChain = (chainId: number): boolean => {
  return supportedChains.some(chain => chain.id === chainId);
};

// Helper to get chain info
export const getChainInfo = (chainId: number) => {
  return supportedChains.find(chain => chain.id === chainId);
};

// Export for compatibility
export { zetaChainAthens3 as zetachainTestnet };
