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
    console.log(`🔍 Starting analysis for address: ${address}`);
    
    try {
      // Gather data from multiple chains
      const [aaveData, venusData, ethBalance] = await Promise.all([
        this.alchemyService.getAaveLendingData(address),
        this.alchemyService.getVenusLendingData(address),
        this.alchemyService.getEthereumBalance(address)
      ]);

      // Calculate metrics
      const ethTvl = aaveData.totalSupplied;
      const bscTvl = venusData.totalSupplied;
      const totalTvl = ethTvl + bscTvl + (ethBalance * 2000); // Assume ETH = $2000

      const chains: ChainData[] = [
        {
          name: 'Ethereum',
          chainId: 1,
          tvl: ethTvl,
          protocols: [
            {
              name: 'Aave V3',
              tvl: aaveData.totalSupplied,
              positions: aaveData.positions.length,
              healthFactor: aaveData.healthFactor
            }
          ]
        },
        {
          name: 'BSC',
          chainId: 56,
          tvl: bscTvl,
          protocols: [
            {
              name: 'Venus Protocol',
              tvl: venusData.totalSupplied,
              positions: venusData.positions.length,
              healthFactor: venusData.healthFactor
            }
          ]
        }
      ];

      // Calculate scores
      const riskScore = this.calculateRiskScore(aaveData.healthFactor, venusData.healthFactor);
      const activityScore = this.calculateActivityScore(chains);
      const diversificationScore = this.calculateDiversificationScore(chains);

      // Prepare data for AI analysis
      const aiAnalysisData = {
        address,
        totalTvl,
        ethTvl,
        bscTvl,
        aaveHealth: aaveData.healthFactor,
        venusHealth: venusData.healthFactor,
        activePositions: aaveData.positions.length + venusData.positions.length,
        chainCount: chains.filter(c => c.tvl > 0).length
      };

      // Get AI insights
      const aiInsights = await this.geminiService.analyzeUserActivity(aiAnalysisData);

      // Determine access level
      const avgHealth = (aaveData.healthFactor + venusData.healthFactor) / 2;
      const chainCount = chains.filter(c => c.tvl > 100).length;
      const accessLevel = this.geminiService.determineAccessLevel(totalTvl, avgHealth, chainCount);

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

      console.log(`✅ Analysis completed for ${address}. TVL: $${totalTvl.toLocaleString()}, Tier: ${accessLevel.tier}`);
      
      return analysis;
    } catch (error) {
      console.error('Error in cross-chain analysis:', error);
      throw new Error('Failed to complete cross-chain analysis');
    }
  }

  private calculateRiskScore(aaveHealth: number, venusHealth: number): number {
    const avgHealth = (aaveHealth + venusHealth) / 2;
    
    if (avgHealth >= 2.0) return 90;
    if (avgHealth >= 1.5) return 75;
    if (avgHealth >= 1.3) return 60;
    if (avgHealth >= 1.1) return 45;
    return 25;
  }

  private calculateActivityScore(chains: ChainData[]): number {
    let score = 0;
    
    chains.forEach(chain => {
      if (chain.tvl > 0) score += 20; // Base points for chain presence
      
      chain.protocols.forEach(protocol => {
        if (protocol.tvl > 1000) score += 10;
        if (protocol.positions > 1) score += 5;
        if (protocol.tvl > 10000) score += 15;
      });
    });

    return Math.min(score, 100);
  }

  private calculateDiversificationScore(chains: ChainData[]): number {
    const activeChains = chains.filter(c => c.tvl > 100).length;
    const totalProtocols = chains.reduce((sum, chain) => 
      sum + chain.protocols.filter(p => p.tvl > 0).length, 0
    );

    let score = activeChains * 25; // 25 points per active chain
    score += Math.min(totalProtocols * 15, 50); // Max 50 points from protocols

    return Math.min(score, 100);
  }
} 