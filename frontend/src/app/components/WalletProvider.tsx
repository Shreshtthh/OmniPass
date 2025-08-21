'use client';

import '@rainbow-me/rainbowkit/styles.css';
import { RainbowKitProvider, getDefaultConfig } from '@rainbow-me/rainbowkit';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { http } from 'viem';
import type { Chain } from 'viem';
import { SUPPORTED_CHAINS } from '@/lib/contracts'; // Import your chains

// Create a query client for React Query
const queryClient = new QueryClient();

// Create Wagmi config using the new API
const wagmiConfig = getDefaultConfig({
  appName: 'OmniPass',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'YOUR_PROJECT_ID',
  chains: SUPPORTED_CHAINS as unknown as readonly [Chain, ...Chain[]], // Fixed type assertion
  transports: SUPPORTED_CHAINS.reduce(
    (acc, chain) => ({
      ...acc,
      [chain.id]: http(), // Use HTTP transport for each chain
    }),
    {}
  ),
  ssr: true, // Enable server-side rendering support
});

// Create the provider component
export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
