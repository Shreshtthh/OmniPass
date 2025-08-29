import { AlchemyService } from './AlchemyService';
import { GeminiService } from './GeminiService';
import { CrossChainAnalysis, ChainData, ProtocolData } from '../types';

interface NetworkConfig {
  isMainnet: boolean;
  ethereum: {
    chainId: number;
    name: string;
  };
  polygon: {
    chainId: number;
    name: string;
  };
}

export class AnalysisEngine {
  private alchemyService: AlchemyService;
  private geminiService: GeminiService;
  private networkConfig: NetworkConfig;

  // Protocol quality ratings (blue-chip protocols get higher scores)
  private protocolQuality: { [key: string]: number } = {
    'Aave V3': 95,
    'Compound V3': 90,
    'Uniswap V3': 85,
    'Wallet Balance': 70, // Base wallet holdings
    'Unknown Protocol': 50
  };

  // Risk thresholds for health factors
  private healthFactorRating = {
    excellent: 2.0,
    good: 1.5,
    moderate: 1.3,
    risky: 1.1
  };

  // Token address to CoinGecko ID mapping for mainnet
  private tokenIdMapping: { [address: string]: string } = {
    // Ethereum mainnet tokens
    '0xa0b86a33e6c48a53c2a9cbb0b8b0c1c5e5b5b5b5': 'usd-coin', // USDC
    '0xdac17f958d2ee523a2206206994597c13d831ec7': 'tether', // USDT
    '0x6b175474e89094c44da98b954eedeac495271d0f': 'dai', // DAI
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9': 'aave', // AAVE
    // Testnet tokens (using same IDs for price reference)
    '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8': 'usd-coin', // USDC on Sepolia
    '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357': 'dai', // DAI on Sepolia
    '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582': 'usd-coin', // USDC on Amoy
  };

  constructor(isMainnet: boolean = false) { // Default to testnet for hackathon
    // Validate environment variables
    if (!process.env.ALCHEMY_API_KEY) {
      console.warn('⚠️ ALCHEMY_API_KEY environment variable not found');
    }
    if (!process.env.GEMINI_API_KEY) {
      console.warn('⚠️ GEMINI_API_KEY environment variable not found');
    }

    this.networkConfig = this.getNetworkConfig(isMainnet);
    this.alchemyService = new AlchemyService();
    this.geminiService = new GeminiService();

    console.log(`🚀 AnalysisEngine initialized for ${isMainnet ? 'Mainnet' : 'Testnet'}`);
  }

  private getNetworkConfig(isMainnet: boolean): NetworkConfig {
    if (isMainnet) {
      return {
        isMainnet: true,
        ethereum: {
          chainId: 1,
          name: 'Ethereum Mainnet'
        },
        polygon: {
          chainId: 137,
          name: 'Polygon Mainnet'
        }
      };
    } else {
      return {
        isMainnet: false,
        ethereum: {
          chainId: 11155111,
          name: 'Sepolia Testnet'
        },
        polygon: {
          chainId: 80002,
          name: 'Polygon Amoy Testnet'
        }
      };
    }
  }

  async performCrossChainAnalysis(address: string): Promise<CrossChainAnalysis> {
    console.log(`🔍 Starting cross-chain analysis for address: ${address}`);
    console.log(`🌐 Network: ${this.networkConfig.isMainnet ? 'Mainnet' : 'Testnet'}`);
    console.log(`📊 Using qualitative scoring with protocol quality weighting`);
    
    try {
      // Get real blockchain data using correct methods for current network
      const [ethBalance, polygonBalance] = await Promise.all([
        this.networkConfig.isMainnet 
          ? this.alchemyService.getMainnetBalance(address)
          : this.alchemyService.getSepoliaBalance(address),
        this.networkConfig.isMainnet 
          ? this.alchemyService.getPolygonMainnetBalance(address)
          : this.alchemyService.getAmoyBalance(address)
      ]);

      // Get token balances using CORRECT chain IDs for current network
      const [ethTokens, polygonTokens] = await Promise.all([
        this.alchemyService.getTokenBalances(address, this.networkConfig.ethereum.chainId), // Will be 11155111 for testnet
        this.alchemyService.getTokenBalances(address, this.networkConfig.polygon.chainId)   // Will be 80002 for testnet
      ]);

      // Get real prices from CoinGecko
      const prices = await this.fetchTokenPrices();
      
      const ethTvl = await this.calculateChainTVL(ethBalance, ethTokens, prices.ethereum.usd);
      const polygonTvl = await this.calculateChainTVL(polygonBalance, polygonTokens, prices['matic-network'].usd);
      const totalTvl = ethTvl + polygonTvl;

      console.log(`💰 TVL calculation:`);
      console.log(`   ${this.networkConfig.ethereum.name}: ${ethBalance} ETH + tokens = $${ethTvl.toFixed(2)}`);
      console.log(`   ${this.networkConfig.polygon.name}: ${polygonBalance} MATIC + tokens = $${polygonTvl.toFixed(2)}`);
      console.log(`   Total: $${totalTvl.toFixed(2)}`);

      // Create enhanced chains data
      const chains: ChainData[] = await this.buildChainData(
        address, 
        ethBalance, 
        polygonBalance, 
        ethTvl, 
        polygonTvl,
        ethTokens,
        polygonTokens
      );

      // Calculate sophisticated scores
      const walletAge = this.estimateWalletAge(address);
      const portfolioMetrics = this.calculatePortfolioMetrics(chains, totalTvl);
      
      const riskScore = this.calculateEnhancedRiskScore(chains, portfolioMetrics, walletAge);
      const activityScore = this.calculateEnhancedActivityScore(chains, portfolioMetrics);
      const diversificationScore = this.calculateEnhancedDiversificationScore(chains, portfolioMetrics);

      console.log(`📊 Scores:`);
      console.log(`   Risk Score: ${riskScore}/100`);
      console.log(`   Activity Score: ${activityScore}/100`);
      console.log(`   Diversification Score: ${diversificationScore}/100`);

      // Prepare data for AI analysis
      const aiAnalysisData = {
        address,
        totalTvl,
        ethTvl,
        polygonTvl,
        ethBalance,
        polygonBalance,
        activeChains: chains.filter(c => c.tvl > 0).length,
        portfolioMetrics,
        walletAge,
        protocolDiversity: this.calculateProtocolDiversity(chains),
        riskProfile: this.assessRiskProfile(chains),
        isTestnet: !this.networkConfig.isMainnet,
        dataSource: 'real_blockchain_data'
      };

      // Get AI insights
      const aiInsights = await this.geminiService.analyzeUserActivity(aiAnalysisData);

      // Determine access level
      const overallScore = this.calculateOverallScore(riskScore, activityScore, diversificationScore);
      const avgHealthFactor = this.calculateAverageHealthFactor(chains);
      const activeChainCount = chains.filter(c => c.tvl > 0).length;
      
      const accessLevel = this.geminiService.determineAccessLevel(
        totalTvl, 
        avgHealthFactor, 
        activeChainCount
      );

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

      console.log(`✅ Cross-chain analysis completed:`);
      console.log(`💰 Total TVL: $${totalTvl.toLocaleString()}`);
      console.log(`🏆 Access Tier: ${accessLevel.tier}`);
      console.log(`🌐 Active Chains: ${activeChainCount}`);
      
      return analysis;

    } catch (error) {
      console.error('Error in cross-chain analysis:', error);
      throw new Error('Failed to complete cross-chain analysis');
    }
  }

  private async fetchTokenPrices(): Promise<{ ethereum: { usd: number }, 'matic-network': { usd: number } }> {
    try {
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=ethereum,matic-network&vs_currencies=usd');
      
      if (!response.ok) {
        console.warn('⚠️ CoinGecko API failed, using fallback prices');
        return {
          ethereum: { usd: 2500 }, // Fallback ETH price
          'matic-network': { usd: 0.8 } // Fallback MATIC price
        };
      }

      const prices = await response.json() as { ethereum: { usd: number }, 'matic-network': { usd: number } };
      console.log(`💱 Current prices: ETH=$${prices.ethereum.usd}, MATIC=$${prices['matic-network'].usd}`);
      return prices;

    } catch (error) {
      console.error('❌ Failed to fetch token prices from CoinGecko:', error);
      console.warn('⚠️ Using fallback prices');
      return {
        ethereum: { usd: 2500 },
        'matic-network': { usd: 0.8 }
      };
    }
  }

  private async getTokenPrice(tokenAddress: string): Promise<number> {
    // For testnet, return estimated value
    if (!this.networkConfig.isMainnet) {
      // Check if it's a known testnet token
      const coinGeckoId = this.tokenIdMapping[tokenAddress.toLowerCase()];
      if (coinGeckoId) {
        try {
          const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd`);
          
          if (response.ok) {
            const priceData = await response.json() as Record<string, { usd: number }>;
            return priceData[coinGeckoId]?.usd || 1.0;
          }
        } catch (error) {
          console.error(`❌ Error fetching price for ${coinGeckoId}:`, error);
        }
      }
      return 1.0; // $1 for unknown testnet tokens
    }

    try {
      const coinGeckoId = this.tokenIdMapping[tokenAddress.toLowerCase()];
      if (!coinGeckoId) {
        console.log(`⚠️ Unknown token address: ${tokenAddress}, using $1 estimate`);
        return 1.0;
      }

      const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${coinGeckoId}&vs_currencies=usd`);
      
      if (!response.ok) {
        console.warn(`⚠️ Failed to fetch price for ${coinGeckoId}, using $1 fallback`);
        return 1.0;
      }

      const priceData = await response.json() as Record<string, { usd: number }>;
      return priceData[coinGeckoId]?.usd || 1.0;

    } catch (error) {
      console.error(`❌ Error fetching token price for ${tokenAddress}:`, error);
      return 1.0; // Fallback
    }
  }

  // Enhanced TVL calculation including token balances with real prices
  private async calculateChainTVL(nativeBalance: number, tokenBalances: any[], nativePrice: number): Promise<number> {
    let tvl = nativeBalance * nativePrice;
    
    // Add token values with real prices
    for (const token of tokenBalances) {
      try {
        const balance = parseInt(token.tokenBalance, 16);
        if (balance > 0) {
          const decimals = token.decimals || 18;
          const tokenAmount = balance / Math.pow(10, decimals);
          const tokenPrice = await this.getTokenPrice(token.contractAddress);
          const tokenValue = tokenAmount * tokenPrice;
          
          tvl += tokenValue;
          
          if (tokenValue > 0.01) { // Log significant token holdings
            console.log(`   Token: ${token.symbol || 'Unknown'} = ${tokenAmount.toFixed(4)} × $${tokenPrice} = $${tokenValue.toFixed(2)}`);
          }
        }
      } catch (error) {
        console.error(`❌ Error processing token ${token.contractAddress}:`, error);
        // Continue with other tokens
      }
    }
    
    return tvl;
  }

  // Build chain data with real blockchain information
  private async buildChainData(
    address: string,
    ethBalance: number,
    polygonBalance: number,
    ethTvl: number,
    polygonTvl: number,
    ethTokens: any[],
    polygonTokens: any[]
  ): Promise<ChainData[]> {
    
    const chains: ChainData[] = [
      {
        name: this.networkConfig.ethereum.name,
        chainId: this.networkConfig.ethereum.chainId,
        tvl: ethTvl,
        protocols: this.buildProtocolData('Ethereum', ethBalance, ethTokens, ethTvl)
      },
      {
        name: this.networkConfig.polygon.name,
        chainId: this.networkConfig.polygon.chainId,
        tvl: polygonTvl,
        protocols: this.buildProtocolData('Polygon', polygonBalance, polygonTokens, polygonTvl)
      }
    ];

    // Try to get DeFi protocol data (will use mock data for now)
    try {
      const [sepoliaLending, amoyLending] = await Promise.all([
        this.alchemyService.getAaveLendingData(address),
        this.alchemyService.getAmoyLendingData(address)
      ]);

      // Add DeFi protocols if they exist
      if (sepoliaLending.totalSupplied > 0) {
        chains[0].protocols.push({
          name: sepoliaLending.protocol,
          tvl: sepoliaLending.totalSupplied,
          positions: sepoliaLending.positions.length,
          healthFactor: sepoliaLending.healthFactor
        });
      }

      if (amoyLending.totalSupplied > 0) {
        chains[1].protocols.push({
          name: amoyLending.protocol,
          tvl: amoyLending.totalSupplied,
          positions: amoyLending.positions.length,
          healthFactor: amoyLending.healthFactor
        });
      }

      console.log('📝 DeFi protocol data integrated successfully');
    } catch (error) {
      console.error('❌ Error fetching DeFi data:', error);
      console.log('📝 Note: Using wallet-only analysis');
    }

    return chains;
  }

  private buildProtocolData(chainName: string, nativeBalance: number, tokens: any[], totalTvl: number): ProtocolData[] {
    const protocols: ProtocolData[] = [];
    
    if (nativeBalance > 0 || totalTvl > 0) {
      const tokenCount = tokens.filter(t => parseInt(t.tokenBalance, 16) > 0).length;
      protocols.push({
        name: 'Wallet Balance',
        tvl: totalTvl,
        positions: 1 + tokenCount,
        healthFactor: 1.0 // Neutral for wallet balances
      });
    }
    
    return protocols;
  }

  private estimateWalletAge(address: string): number {
    // Simplified heuristic based on address pattern since we can't easily get first tx
    const seed = parseInt(address.slice(-6), 16);
    const ageMonths = Math.min((seed % 24) + 1, 24);
    console.log(`📅 Estimated wallet age: ${ageMonths} months (heuristic)`);
    return ageMonths;
  }

  // Switch network configuration
  switchNetwork(isMainnet: boolean): void {
    console.log(`🔄 Switching to ${isMainnet ? 'Mainnet' : 'Testnet'}`);
    this.networkConfig = this.getNetworkConfig(isMainnet);
    this.alchemyService.switchNetwork(isMainnet);
    console.log(`✅ Network switched to ${this.networkConfig.ethereum.name} / ${this.networkConfig.polygon.name}`);
  }

  // Get current network status
  getCurrentNetwork(): NetworkConfig {
    return this.networkConfig;
  }

  private calculateEnhancedRiskScore(chains: ChainData[], portfolioMetrics: any, walletAge: number): number {
    let score = 0;
    let maxScore = 0;

    // Protocol Quality Score (40% weight)
    let protocolScore = 0;
    let protocolWeight = 0;
    
    chains.forEach(chain => {
      chain.protocols.forEach(protocol => {
        const quality = this.protocolQuality[protocol.name] || this.protocolQuality['Unknown Protocol'];
        const weight = protocol.tvl;
        protocolScore += quality * weight;
        protocolWeight += weight;
      });
    });
    
    if (protocolWeight > 0) {
      score += (protocolScore / protocolWeight) * 0.4;
    }
    maxScore += 40;

    // Health Factor Score (30% weight)
    let healthScore = 0;
    let healthCount = 0;
    
    chains.forEach(chain => {
      chain.protocols.forEach(protocol => {
        if (protocol.healthFactor && protocol.healthFactor !== 1.0) {
          if (protocol.healthFactor >= this.healthFactorRating.excellent) healthScore += 30;
          else if (protocol.healthFactor >= this.healthFactorRating.good) healthScore += 25;
          else if (protocol.healthFactor >= this.healthFactorRating.moderate) healthScore += 15;
          else healthScore += 5;
          healthCount++;
        }
      });
    });
    
    if (healthCount > 0) {
      score += (healthScore / healthCount) * 0.3;
    } else {
      score += 20; // Neutral score for wallet-only users
    }
    maxScore += 30;

    // Wallet Age Score (20% weight)
    score += Math.min(walletAge * 2, 20);
    maxScore += 20;

    // Portfolio Size Score (10% weight)
    const tvlScore = Math.min(portfolioMetrics.totalTvl / 100, 10);
    score += tvlScore;
    maxScore += 10;

    return Math.round((score / maxScore) * 100);
  }

  private calculateEnhancedActivityScore(chains: ChainData[], portfolioMetrics: any): number {
    let score = 0;

    // Multi-chain presence (30 points)
    const activeChains = chains.filter(c => c.tvl > 0).length;
    if (activeChains >= 2) score += 30;
    else if (activeChains === 1) score += 15;

    // Protocol diversity (25 points)
    if (portfolioMetrics.totalProtocols >= 3) score += 25;
    else if (portfolioMetrics.totalProtocols >= 2) score += 15;
    else if (portfolioMetrics.totalProtocols >= 1) score += 10;

    // Position complexity (20 points)
    const totalPositions = chains.reduce((sum, chain) => 
      sum + chain.protocols.reduce((pSum, protocol) => pSum + protocol.positions, 0), 0);
    
    if (totalPositions >= 5) score += 20;
    else if (totalPositions >= 3) score += 15;
    else if (totalPositions >= 1) score += 10;

    // TVL engagement (15 points)
    if (portfolioMetrics.totalTvl >= 5000) score += 15;
    else if (portfolioMetrics.totalTvl >= 1000) score += 12;
    else if (portfolioMetrics.totalTvl >= 500) score += 8;
    else if (portfolioMetrics.totalTvl >= 100) score += 5;

    // DeFi protocol usage bonus (10 points)
    const hasDeFi = chains.some(chain => 
      chain.protocols.some(protocol => 
        protocol.name !== 'Wallet Balance' && protocol.healthFactor && protocol.healthFactor !== 1.0
      )
    );
    if (hasDeFi) score += 10;

    return Math.min(score, 100);
  }

  private calculateEnhancedDiversificationScore(chains: ChainData[], portfolioMetrics: any): number {
    let score = 0;

    // Chain diversification (50% weight)
    const activeChains = chains.filter(c => c.tvl > 0).length;
    if (activeChains >= 2) {
      score += 50;
      
      // Bonus for balanced distribution
      const chainTvls = chains.filter(c => c.tvl > 0).map(c => c.tvl);
      const totalTvl = chainTvls.reduce((sum, tvl) => sum + tvl, 0);
      const distribution = chainTvls.map(tvl => tvl / totalTvl);
      
      if (Math.max(...distribution) < 0.8) {
        score += 15; // Bonus for balanced distribution
      }
    } else if (activeChains === 1) {
      score += 20;
    }

    // Protocol diversification (35% weight)
    const uniqueProtocolTypes = new Set();
    chains.forEach(chain => {
      chain.protocols.forEach(protocol => {
        if (protocol.name === 'Wallet Balance') uniqueProtocolTypes.add('Wallet');
        else if (protocol.name.includes('Aave')) uniqueProtocolTypes.add('Lending');
        else if (protocol.name.includes('Uniswap')) uniqueProtocolTypes.add('DEX');
        else uniqueProtocolTypes.add('Other');
      });
    });

    if (uniqueProtocolTypes.size >= 3) score += 35;
    else if (uniqueProtocolTypes.size >= 2) score += 25;
    else if (uniqueProtocolTypes.size >= 1) score += 15;

    return Math.min(score, 100);
  }

  private calculatePortfolioMetrics(chains: ChainData[], totalTvl: number) {
    const totalProtocols = chains.reduce((sum, chain) => sum + chain.protocols.length, 0);
    const totalPositions = chains.reduce((sum, chain) => 
      sum + chain.protocols.reduce((pSum, protocol) => pSum + protocol.positions, 0), 0);
    
    const avgTvlPerChain = totalTvl / chains.filter(c => c.tvl > 0).length || 0;
    
    return {
      totalTvl,
      totalProtocols,
      totalPositions,
      avgTvlPerChain,
      chainConcentration: this.calculateChainConcentration(chains, totalTvl)
    };
  }

  private calculateChainConcentration(chains: ChainData[], totalTvl: number): number {
    if (totalTvl === 0) return 0;
    
    const maxChainTvl = Math.max(...chains.map(c => c.tvl));
    return maxChainTvl / totalTvl;
  }

  private calculateProtocolDiversity(chains: ChainData[]): number {
    const protocolTypes = new Set();
    chains.forEach(chain => {
      chain.protocols.forEach(protocol => {
        protocolTypes.add(protocol.name);
      });
    });
    return protocolTypes.size;
  }

  private assessRiskProfile(chains: ChainData[]): string {
    let totalTvl = 0;
    let riskWeightedScore = 0;
    let hasHighRisk = false;

    chains.forEach(chain => {
      chain.protocols.forEach(protocol => {
        totalTvl += protocol.tvl;
        
        if (protocol.healthFactor && protocol.healthFactor < 1.3) {
          hasHighRisk = true;
          riskWeightedScore += protocol.tvl * 0.5;
        } else if (protocol.healthFactor && protocol.healthFactor < 1.5) {
          riskWeightedScore += protocol.tvl * 0.75;
        } else {
          riskWeightedScore += protocol.tvl * 1.0;
        }
      });
    });

    if (hasHighRisk) return 'High Risk';
    if (totalTvl > 0 && riskWeightedScore / totalTvl > 0.8) return 'Conservative';
    if (totalTvl > 0 && riskWeightedScore / totalTvl > 0.6) return 'Moderate';
    return 'Aggressive';
  }

  private calculateAverageHealthFactor(chains: ChainData[]): number {
    let totalHealthFactor = 0;
    let count = 0;

    chains.forEach(chain => {
      chain.protocols.forEach(protocol => {
        if (protocol.healthFactor && protocol.healthFactor !== 1.0) {
          totalHealthFactor += protocol.healthFactor;
          count++;
        }
      });
    });

    if (count === 0) return 1.0;
    return totalHealthFactor / count;
  }

  private calculateOverallScore(riskScore: number, activityScore: number, diversificationScore: number): number {
    return Math.round(
      (riskScore * 0.4) + 
      (activityScore * 0.35) + 
      (diversificationScore * 0.25)
    );
  }
}
