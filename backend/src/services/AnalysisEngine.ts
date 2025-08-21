import { AlchemyService } from './AlchemyService';
import { GeminiService } from './GeminiService';
import { CrossChainAnalysis, ChainData, ProtocolData } from '../types';

export class AnalysisEngine {
  private alchemyService: AlchemyService;
  private geminiService: GeminiService;

  constructor() {
    this.alchemyService = new AlchemyService();
    this.geminiService = new GeminiService();
  }

  async performCrossChainAnalysis(address: string): Promise<CrossChainAnalysis> {
    console.log(`🔍 Starting cross-chain analysis for address: ${address}`);
    console.log(`📍 Analyzing Sepolia and Amoy testnets - REAL DATA ONLY`);
    
    try {
      // Get ONLY real blockchain data (no mock Aave data)
      const [sepoliaBalance, amoyBalance] = await Promise.all([
        this.alchemyService.getSepoliaBalance(address),
        this.alchemyService.getAmoyBalance(address)
      ]);

      // Calculate TVL based on REAL balances only
      const ethPrice = 2000; // Assume ETH = $2000
      const maticPrice = 0.8; // Assume MATIC = $0.80
      
      const sepoliaTvl = sepoliaBalance * ethPrice;
      const amoyTvl = amoyBalance * maticPrice;
      const totalTvl = sepoliaTvl + amoyTvl;

      console.log(`💰 REAL Sepolia: ${sepoliaBalance} ETH = $${sepoliaTvl.toFixed(2)}`);
      console.log(`💰 REAL Amoy: ${amoyBalance} MATIC = $${amoyTvl.toFixed(2)}`);
      console.log(`💰 REAL Total TVL: $${totalTvl.toFixed(2)} (NO MOCK DATA)`);

      // Create chains data with REAL values only
      const chains: ChainData[] = [
        {
          name: 'Sepolia',
          chainId: 11155111,
          tvl: sepoliaTvl,
          protocols: sepoliaBalance > 0 ? [
            {
              name: 'Wallet Balance',
              tvl: sepoliaTvl,
              positions: 1,
              healthFactor: 1.0 // N/A for wallet balances, set to neutral
            }
          ] : []
        },
        {
          name: 'Polygon Amoy',
          chainId: 80002,
          tvl: amoyTvl,
          protocols: amoyBalance > 0 ? [
            {
              name: 'Wallet Balance',
              tvl: amoyTvl,
              positions: 1,
              healthFactor: 1.0 // N/A for wallet balances, set to neutral
            }
          ] : []
        }
      ];

      // Calculate scores based on REAL data only
      const riskScore = this.calculateRiskScoreFromTvl(totalTvl);
      const activityScore = this.calculateActivityScore(chains);
      const diversificationScore = this.calculateDiversificationScore(chains);

      // Prepare data for AI analysis with REAL values
      const aiAnalysisData = {
        address,
        totalTvl,
        sepoliaTvl,
        amoyTvl,
        sepoliaBalance,
        amoyBalance,
        activeChains: chains.filter(c => c.tvl > 0).length,
        isTestnet: true,
        dataSource: 'real_blockchain_only'
      };

      // Get AI insights
      const aiInsights = await this.geminiService.analyzeUserActivity(aiAnalysisData);

      // Determine access level based on REAL data
      const activeChainCount = chains.filter(c => c.tvl > 0).length;
      const avgHealthFactor = 1.0; // Neutral for wallet balances
      const accessLevel = this.geminiService.determineAccessLevel(totalTvl, avgHealthFactor, activeChainCount);

      const analysis: CrossChainAnalysis = {
        address,
        totalValueLocked: totalTvl,
        riskScore,
        activityScore,
        diversificationScore,
        chains,
        aiInsights,
        accessLevel
      };

      console.log(`✅ Cross-chain analysis completed for ${address}`);
      console.log(`💰 REAL Total TVL: $${totalTvl.toLocaleString()}`);
      console.log(`🏆 Access Tier: ${accessLevel.tier} (Based on real data)`);
      console.log(`🌐 Active on ${activeChainCount} chains (Real balances only)`);
      
      return analysis;

    } catch (error) {
      console.error('Error in cross-chain analysis:', error);
      throw new Error('Failed to complete cross-chain analysis');
    }
  }

  // NEW: Risk score based on actual TVL instead of health factors
  private calculateRiskScoreFromTvl(totalTvl: number): number {
    if (totalTvl >= 10000) return 95; // Very high TVL
    if (totalTvl >= 5000) return 85;  // High TVL
    if (totalTvl >= 1000) return 75;  // Good TVL
    if (totalTvl >= 500) return 60;   // Moderate TVL
    if (totalTvl >= 100) return 45;   // Low TVL
    if (totalTvl >= 10) return 30;    // Very low TVL
    return 15; // Minimal TVL
  }

  private calculateActivityScore(chains: ChainData[]): number {
    let score = 0;
    
    chains.forEach(chain => {
      if (chain.tvl > 0) {
        score += 30; // Base points for having any balance on chain
        
        // Bonus points based on balance size
        if (chain.tvl >= 1000) score += 25; // Significant balance
        else if (chain.tvl >= 100) score += 15; // Moderate balance
        else if (chain.tvl >= 10) score += 10; // Small balance
      }
    });

    return Math.min(score, 100);
  }

  private calculateDiversificationScore(chains: ChainData[]): number {
    const activeChains = chains.filter(c => c.tvl > 0).length;
    
    if (activeChains >= 2) {
      // Multi-chain presence gets high score
      return 80;
    } else if (activeChains === 1) {
      // Single chain gets moderate score
      return 40;
    }
    
    return 0; // No activity
  }
}
