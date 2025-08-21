// frontend/src/hooks/useContract.ts
'use client';

import { useContract, useAccount, useChainId } from 'wagmi';
import { OMNIPASS_CONTRACT, OMNIPASS_ABI } from '@/lib/contracts';

export function useOmniPassContract() {
  const { address } = useAccount();
  const chainId = useChainId();

  const contract = useContract({
    address: OMNIPASS_CONTRACT.address,
    abi: OMNIPASS_ABI,
    chainId: OMNIPASS_CONTRACT.chainId, // Always ZetaChain
  });

  // Check if user has valid credential
  const checkCredential = async (requiredTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' = 'BRONZE') => {
    if (!contract || !address) return null;
    
    try {
      const tierMap = { 'BRONZE': 0, 'SILVER': 1, 'GOLD': 2, 'PLATINUM': 3 };
      const result = await contract.read.verifyCredential([address, tierMap[requiredTier]]);
      
      const tierNames = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
      return {
        isValid: result[0],
        userTier: tierNames[result[1]] || 'NONE'
      };
    } catch (error) {
      console.error('Error checking credential:', error);
      return null;
    }
  };

  // Get full credential details
  const getCredentialDetails = async () => {
    if (!contract || !address) return null;
    
    try {
      const credential = await contract.read.getCredential([address]);
      
      return {
        user: credential.user,
        tier: credential.tier,
        totalValueLocked: credential.totalValueLocked,
        riskScore: credential.riskScore,
        activityScore: credential.activityScore,
        diversificationScore: credential.diversificationScore,
        issuedAt: new Date(Number(credential.issuedAt) * 1000),
        expiresAt: new Date(Number(credential.expiresAt) * 1000),
        isValid: credential.isValid
      };
    } catch (error) {
      console.error('Error getting credential details:', error);
      return null;
    }
  };

  return {
    contract,
    contractAddress: OMNIPASS_CONTRACT.address,
    isCorrectChain: chainId === OMNIPASS_CONTRACT.chainId,
    checkCredential,
    getCredentialDetails,
    targetChainId: OMNIPASS_CONTRACT.chainId
  };
}

// Hook for contract events
export function useContractEvents() {
  // Add contract event listeners here
  // This would listen for CredentialIssued events, etc.
}