"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContractService = void 0;
// backend/src/services/ContractService.ts
const ethers_1 = require("ethers");
const contracts_1 = require("../config/contracts");
class ContractService {
    constructor() {
        // Initialize ZetaChain provider
        this.provider = new ethers_1.ethers.JsonRpcProvider('https://zetachain-athens-evm.blockpi.network/v1/rpc/public');
        // Initialize analyzer wallet
        const privateKey = process.env.ANALYZER_PRIVATE_KEY;
        if (!privateKey) {
            throw new Error('ANALYZER_PRIVATE_KEY not found in environment variables');
        }
        this.analyzerWallet = new ethers_1.ethers.Wallet(privateKey, this.provider);
        // Initialize contract with analyzer wallet
        this.contract = new ethers_1.ethers.Contract(contracts_1.CONTRACT_CONFIG.OMNIPASS_CREDENTIAL.address, contracts_1.OMNIPASS_ABI, this.analyzerWallet);
        console.log('📜 ContractService initialized');
        console.log('🔗 Contract Address:', contracts_1.CONTRACT_CONFIG.OMNIPASS_CREDENTIAL.address);
        console.log('🤖 Analyzer Address:', this.analyzerWallet.address);
    }
    /**
     * Issue a credential on-chain after analysis
     */
    async issueCredential(userAddress, crossChainData, aiInsightsHash) {
        try {
            console.log(`🎫 Issuing credential for ${userAddress}...`);
            // Convert crossChainData to contract format
            const contractData = crossChainData.map(data => ({
                chainId: data.chainId,
                tvl: ethers_1.ethers.parseEther(data.tvl.toString()),
                positions: data.positions,
                dataHash: data.dataHash,
                signature: '0x' // Simplified for MVP
            }));
            // Issue the credential
            const tx = await this.contract.issueCredential(userAddress, contractData, aiInsightsHash, '0x' // Simplified signature for MVP
            );
            console.log('⏳ Transaction submitted:', tx.hash);
            const receipt = await tx.wait();
            console.log('✅ Credential issued successfully!');
            return tx.hash;
        }
        catch (error) {
            console.error('❌ Error issuing credential:', error);
            throw error;
        }
    }
    /**
     * Verify if user has valid credential
     */
    async verifyCredential(userAddress, requiredTier = 'BRONZE') {
        try {
            const tierMap = { 'BRONZE': 0, 'SILVER': 1, 'GOLD': 2, 'PLATINUM': 3 };
            const [isValid, userTierNum] = await this.contract.verifyCredential(userAddress, tierMap[requiredTier]);
            const tierNames = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM'];
            const userTier = tierNames[userTierNum] || 'NONE';
            return { isValid, userTier };
        }
        catch (error) {
            console.error('❌ Error verifying credential:', error);
            return { isValid: false, userTier: 'NONE' };
        }
    }
    /**
     * Get user's full credential details
     */
    async getCredential(userAddress) {
        try {
            const credential = await this.contract.getCredential(userAddress);
            return {
                user: credential.user,
                tier: credential.tier,
                totalValueLocked: ethers_1.ethers.formatEther(credential.totalValueLocked),
                riskScore: credential.riskScore.toString(),
                activityScore: credential.activityScore.toString(),
                diversificationScore: credential.diversificationScore.toString(),
                issuedAt: new Date(Number(credential.issuedAt) * 1000),
                expiresAt: new Date(Number(credential.expiresAt) * 1000),
                isValid: credential.isValid
            };
        }
        catch (error) {
            console.error('❌ Error getting credential:', error);
            return null;
        }
    }
    /**
     * Check if analyzer is authorized
     */
    async checkAnalyzerAuthorization() {
        try {
            return await this.contract.authorizedAnalyzers(this.analyzerWallet.address);
        }
        catch (error) {
            console.error('❌ Error checking authorization:', error);
            return false;
        }
    }
    /**
     * Get contract address for frontend
     */
    getContractAddress() {
        return contracts_1.CONTRACT_CONFIG.OMNIPASS_CREDENTIAL.address;
    }
    /**
     * Get analyzer address
     */
    getAnalyzerAddress() {
        return this.analyzerWallet.address;
    }
}
exports.ContractService = ContractService;
