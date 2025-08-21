// backend/src/services/ContractService.ts
import { ethers } from 'ethers';
import { CONTRACT_CONFIG, OMNIPASS_ABI } from '../config/contracts';

export class ContractService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  private analyzerWallet: ethers.Wallet;

  constructor() {
    // Initialize ZetaChain provider
    this.provider = new ethers.JsonRpcProvider(
      'https://zetachain-athens-evm.blockpi.network/v1/rpc/public'
    );

    // Initialize analyzer wallet
    const privateKey = process.env.ANALYZER_PRIVATE_KEY;
    if (!privateKey) {
      throw new Error('ANALYZER_PRIVATE_KEY not found in environment variables');
    }
    
    this.analyzerWallet = new ethers.Wallet(privateKey, this.provider);
    
    // Initialize contract with analyzer wallet
    this.contract = new ethers.Contract(
      CONTRACT_CONFIG.OMNIPASS_CREDENTIAL.address,
      OMNIPASS_ABI,
      this.analyzerWallet
    );

    console.log('📜 ContractService initialized');
    console.log('🔗 Contract Address:', CONTRACT_CONFIG.OMNIPASS_CREDENTIAL.address);
    console.log('🤖 Analyzer Address:', this.analyzerWallet.address);
  }

  /**
   * Issue a credential on-chain after analysis
   */
  async issueCredential(
    userAddress: string,
    crossChainData: Array<{
      chainId: number;
      tvl: number;
      positions: number;
      dataHash: string;
    }>,
    aiInsightsHash: string
  ): Promise<string> {
    try {
      console.log(`🎫 Issuing credential for ${userAddress}...`);

      // Convert crossChainData to contract format
      const contractData = crossChainData.map(data => ({
        chainId: data.chainId,
        tvl: ethers.parseEther(data.tvl.toString()),
        positions: data.positions,
        dataHash: data.dataHash,
        signature: '0x' // Simplified for MVP
      }));

      // Issue the credential
      const tx = await this.contract.issueCredential(
        userAddress,
        contractData,
        aiInsightsHash,
        '0x' // Simplified signature for MVP
      );

      console.log('⏳ Transaction submitted:', tx.hash);
      const receipt = await tx.wait();
      console.log('✅ Credential issued successfully!');
      
      return tx.hash;
    } catch (error) {
      console.error('❌ Error issuing credential:', error);
      throw error;
    }
  }

  /**
   * Verify if user has valid credential
   */
  async verifyCredential(
    userAddress: string,
    requiredTier: 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' = 'BRONZE'
  ): Promise<{ isValid: boolean; userTier: string }> {
    try {
      const tierMap = { 'BRONZE': 0, 'SILVER': 1, 'GOLD': 2, 'PLATINUM': 3 };
      
      const [isValid, userTierNum] = await this.contract.verifyCredential(
        userAddress,
        tierMap[requiredTier]
      );

      const tierNames = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
      const userTier = tierNames[userTierNum] || 'NONE';

      return { isValid, userTier };
    } catch (error) {
      console.error('❌ Error verifying credential:', error);
      return { isValid: false, userTier: 'NONE' };
    }
  }

  /**
   * Get user's full credential details
   */
  async getCredential(userAddress: string) {
    try {
      const credential = await this.contract.getCredential(userAddress);
      
      return {
        user: credential.user,
        tier: credential.tier,
        totalValueLocked: ethers.formatEther(credential.totalValueLocked),
        riskScore: credential.riskScore.toString(),
        activityScore: credential.activityScore.toString(),
        diversificationScore: credential.diversificationScore.toString(),
        issuedAt: new Date(Number(credential.issuedAt) * 1000),
        expiresAt: new Date(Number(credential.expiresAt) * 1000),
        isValid: credential.isValid
      };
    } catch (error) {
      console.error('❌ Error getting credential:', error);
      return null;
    }
  }

  /**
   * Check if analyzer is authorized
   */
  async checkAnalyzerAuthorization(): Promise<boolean> {
    try {
      return await this.contract.authorizedAnalyzers(this.analyzerWallet.address);
    } catch (error) {
      console.error('❌ Error checking authorization:', error);
      return false;
    }
  }

  /**
   * Get contract address for frontend
   */
  getContractAddress(): string {
    return CONTRACT_CONFIG.OMNIPASS_CREDENTIAL.address;
  }

  /**
   * Get analyzer address
   */
  getAnalyzerAddress(): string {
    return this.analyzerWallet.address;
  }
}