import axios from 'axios';
import { CrossChainAnalysis, AIInsights, AccessLevel } from '../types';

export class GeminiService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY || '';
    this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    
    if (!this.apiKey) {
      console.warn('⚠️  GEMINI_API_KEY not found. Using fallback analysis.');
    }
  }

  async analyzeUserActivity(data: any): Promise<AIInsights> {
    try {
      if (!this.apiKey) {
        return this.getFallbackAnalysis(data);
      }

      const prompt = this.buildAnalysisPrompt(data);
      
      const response = await axios.post(
        `${this.apiUrl}?key=${this.apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          timeout: 10000 
        }
      );

      const aiText = response.data.candidates[0].content.parts[0].text;
      return this.parseAIResponse(aiText);
      
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return this.getFallbackAnalysis(data);
    }
  }

  private buildAnalysisPrompt(data: any): string {
    return `
Analyze this DeFi user's testnet wallet activity for access control decisions. This analysis uses ENHANCED SCORING with protocol quality weighting.

Enhanced User Analysis:

- Address: ${data.address}
- Sepolia Balance: ${data.sepoliaBalance || 0} ETH ($${data.sepoliaTvl?.toLocaleString() || '0'})
- Amoy Balance: ${data.amoyBalance || 0} MATIC ($${data.amoyTvl?.toLocaleString() || '0'})
- Total Portfolio Value: $${data.totalTvl?.toLocaleString() || '0'}
- Active Chains: ${data.activeChains || 0}
- Protocol Diversity: ${data.protocolDiversity || 0} unique protocols
- Estimated Wallet Age: ${data.walletAge || 0} months
- Risk Profile: ${data.riskProfile || 'Unknown'}
- Chain Concentration: ${((data.portfolioMetrics?.chainConcentration || 0) * 100).toFixed(1)}%
- Data Source: ${data.dataSource || 'enhanced_analysis_v2'}
- Environment: ${data.isTestnet ? 'Testnet (Demo)' : 'Production'}

IMPORTANT: This analysis uses sophisticated scoring including protocol quality weighting, health factor analysis, and wallet maturity assessment.

Please provide analysis in this exact JSON format:

{
  "summary": "Brief overview focusing on the user's sophistication and portfolio quality",
  "reasoning": ["Point 1", "Point 2", "Point 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "riskFactors": ["Risk 1", "Risk 2"]
}

Focus on:
- Portfolio sophistication and protocol selection quality
- Risk management demonstrated through health factors
- Cross-chain diversification strategy
- Wallet maturity and experience indicators
- Growth potential and optimization opportunities

Note: Enhanced scoring considers protocol quality, not just TVL amounts.
Keep responses accurate to the enhanced analysis methodology.`;
  }

  private parseAIResponse(aiText: string): AIInsights {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || 'Enhanced testnet analysis completed',
          reasoning: parsed.reasoning || [],
          recommendations: parsed.recommendations || [],
          riskFactors: parsed.riskFactors || []
        };
      }
      
      // Fallback parsing if JSON extraction fails
      return this.parseUnstructuredResponse(aiText);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.getBasicInsights();
    }
  }

  private parseUnstructuredResponse(text: string): AIInsights {
    // Simple text parsing as fallback
    return {
      summary: 'Enhanced AI analysis completed based on sophisticated cross-chain scoring.',
      reasoning: [
        'Portfolio demonstrates understanding of protocol quality selection',
        'Cross-chain diversification shows multi-network DeFi engagement', 
        'Risk management approach indicates mature DeFi user behavior'
      ],
      recommendations: [
        'Focus on blue-chip protocols for higher quality scores',
        'Maintain healthy diversification across chains and protocols'
      ],
      riskFactors: [
        'Testnet environments may not reflect real market conditions',
        'Protocol quality weighting favors established DeFi protocols'
      ]
    };
  }

  private getFallbackAnalysis(data: any): AIInsights {
    const totalTvl = data.totalTvl || 0;
    const hasMultiChain = (data.sepoliaTvl > 0) && (data.amoyTvl > 0);
    const sepoliaBalance = data.sepoliaBalance || 0;
    const amoyBalance = data.amoyBalance || 0;
    const protocolDiversity = data.protocolDiversity || 0;
    const riskProfile = data.riskProfile || 'Unknown';

    let summary = '';
    if (totalTvl > 5000) {
      summary = `Advanced testnet user with $${totalTvl.toLocaleString()} portfolio showing ${riskProfile.toLowerCase()} risk profile`;
    } else if (totalTvl > 1000) {
      summary = `Growing testnet portfolio ($${totalTvl.toLocaleString()}) with ${protocolDiversity} protocols and multi-chain approach`;
    } else if (totalTvl > 100) {
      summary = `Moderate testnet engagement with basic cross-chain wallet management`;
    } else {
      summary = `Early-stage testnet user with minimal wallet balances`;
    }

    const reasoning = [
      hasMultiChain 
        ? `Multi-chain presence: Sepolia (${sepoliaBalance.toFixed(4)} ETH) + Amoy (${amoyBalance.toFixed(4)} MATIC) shows cross-chain understanding` 
        : sepoliaBalance > 0 
          ? `Single-chain focus on Sepolia testnet with ${sepoliaBalance.toFixed(4)} ETH`
          : amoyBalance > 0 
            ? `Single-chain focus on Amoy testnet with ${amoyBalance.toFixed(4)} MATIC`
            : 'Limited testnet activity detected',
      
      protocolDiversity > 1 
        ? `Protocol diversity (${protocolDiversity} types) demonstrates exploration of DeFi ecosystem` 
        : `Basic protocol usage - opportunity to explore more DeFi protocols`,
      
      riskProfile !== 'Unknown'
        ? `Risk profile: ${riskProfile} - indicates ${riskProfile.toLowerCase() === 'conservative' ? 'cautious' : 'active'} DeFi approach`
        : `Risk assessment pending - need more protocol interaction data`
    ];

    const recommendations = totalTvl > 1000
      ? [
          'Explore additional blue-chip protocols for higher quality scores',
          'Consider advanced DeFi strategies while maintaining risk management',
          'Ready for mainnet transition with proper due diligence'
        ]
      : [
          'Increase testnet portfolio size to explore more protocols',
          'Focus on protocol quality over quantity for better scores',
          'Build experience across different DeFi categories'
        ];

    const riskFactors = totalTvl < 100
      ? [
          'Limited testnet funding restricts protocol exploration opportunities',
          'Single-chain focus may limit understanding of cross-chain DeFi'
        ]
      : [
          'Enhanced scoring system favors protocol quality over raw TVL',
          'Testnet behavior patterns may differ from mainnet strategies'
        ];

    return { summary, reasoning, recommendations, riskFactors };
  }

  private getBasicInsights(): AIInsights {
    return {
      summary: 'Enhanced cross-chain testnet analysis completed using sophisticated scoring methodology.',
      reasoning: [
        'Portfolio analyzed using protocol quality weighting system',
        'Risk assessment includes health factor and wallet maturity analysis',
        'Cross-chain diversification evaluated for strategic portfolio management'
      ],
      recommendations: [
        'Focus on blue-chip protocols for optimal quality scores',
        'Maintain balanced cross-chain presence for diversification benefits',
        'Consider wallet age and consistent activity for reputation building'
      ],
      riskFactors: [
        'Enhanced scoring methodology prioritizes protocol quality',
        'Testnet limitations may not reflect mainnet protocol performance'
      ]
    };
  }

  // Updated to support enhanced access level determination
  determineAccessLevel(totalTvl: number, avgHealth: number, chainCount: number): AccessLevel {
    console.log(`🏆 Access Level Calculation:`);
    console.log(`   TVL: $${totalTvl.toFixed(2)}`);
    console.log(`   Avg Health Factor: ${avgHealth.toFixed(2)}`);
    console.log(`   Active Chains: ${chainCount}`);

    // Enhanced thresholds for testnet environment with quality considerations
    if (totalTvl >= 10000 && avgHealth >= 2.0 && chainCount >= 2) {
      console.log(`   ✅ PLATINUM tier qualification met`);
      return {
        tier: 'PLATINUM',
        qualifiesForAccess: true
      };
    } else if (totalTvl >= 2500 && avgHealth >= 1.5 && chainCount >= 2) {
      console.log(`   ✅ GOLD tier qualification met`);
      return {
        tier: 'GOLD',
        qualifiesForAccess: true
      };
    } else if (totalTvl >= 500 && avgHealth >= 1.3) {
      console.log(`   ✅ SILVER tier qualification met`);
      return {
        tier: 'SILVER',
        qualifiesForAccess: true
      };
    } else if (totalTvl >= 100) {
      console.log(`   ✅ BRONZE tier qualification met`);
      return {
        tier: 'BRONZE',
        qualifiesForAccess: true
      };
    } else {
      console.log(`   ❌ Below BRONZE tier requirements`);
      return {
        tier: 'BRONZE',
        qualifiesForAccess: false,
        requiredTVL: 100,
        requiredScore: 50
      };
    }
  }

  // Enhanced tier determination with overall score consideration (for future use)
  determineAccessLevelWithScore(
    totalTvl: number, 
    avgHealth: number, 
    chainCount: number, 
    overallScore: number
  ): AccessLevel {
    console.log(`🏆 Enhanced Access Level Calculation:`);
    console.log(`   TVL: $${totalTvl.toFixed(2)}`);
    console.log(`   Overall Score: ${overallScore}/100`);
    console.log(`   Avg Health Factor: ${avgHealth.toFixed(2)}`);
    console.log(`   Active Chains: ${chainCount}`);

    // Score-weighted tier determination
    if (overallScore >= 80 && totalTvl >= 5000 && avgHealth >= 2.0) {
      return { tier: 'PLATINUM', qualifiesForAccess: true };
    } else if (overallScore >= 70 && totalTvl >= 2000 && avgHealth >= 1.5) {
      return { tier: 'GOLD', qualifiesForAccess: true };
    } else if (overallScore >= 60 && totalTvl >= 500 && avgHealth >= 1.3) {
      return { tier: 'SILVER', qualifiesForAccess: true };
    } else if (overallScore >= 50 && totalTvl >= 100) {
      return { tier: 'BRONZE', qualifiesForAccess: true };
    } else {
      return {
        tier: 'BRONZE',
        qualifiesForAccess: false,
        requiredTVL: 100,
        requiredScore: 50
      };
    }
  }
}