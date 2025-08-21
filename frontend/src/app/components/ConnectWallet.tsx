'use client';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useEnsName } from 'wagmi';
import { formatAddress } from '../../lib/utils';
import { useState, useEffect } from 'react';

interface ConnectWalletProps {
  onAddressChange?: (address: string | undefined) => void;
}

export default function ConnectWallet({ onAddressChange }: ConnectWalletProps) {
  const { address, isConnected } = useAccount();
  const { data: ensName } = useEnsName({ address });
  const [mounted, setMounted] = useState(false);

  // Ensure component only renders after hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Notify parent component when address changes
  useEffect(() => {
    if (mounted) {
      onAddressChange?.(address);
    }
  }, [address, onAddressChange, mounted]);

  // Show loading state until mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="flex items-center space-x-2">
        <div className="w-32 h-10 bg-gray-200 animate-pulse rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <ConnectButton />
      {isConnected && address && (
        <div className="text-sm text-gray-600">
          Connected: {ensName || formatAddress(address)}
        </div>
      )}
    </div>
  );
}
