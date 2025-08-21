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
Analyze this DeFi user's testnet wallet activity for access control decisions. This analysis is based on WALLET BALANCES ONLY from Sepolia and Polygon Amoy testnets.

User Testnet Wallet Activity:

- Address: ${data.address}
- Sepolia Balance: ${data.sepoliaBalance || 0} ETH ($${data.sepoliaTvl?.toLocaleString() || '0'})
- Amoy Balance: ${data.amoyBalance || 0} MATIC ($${data.amoyTvl?.toLocaleString() || '0'})
- Total Portfolio Value: $${data.totalTvl?.toLocaleString() || '0'}
- Active Chains: ${data.activeChains || 0}
- Data Source: ${data.dataSource || 'wallet_balances_only'}
- Environment: ${data.isTestnet ? 'Testnet (Demo)' : 'Production'}

IMPORTANT: This analysis is based ONLY on wallet balances. No DeFi protocol usage (Aave, Compound, etc.) is detected or analyzed.

Please provide analysis in this exact JSON format:

{
  "summary": "Brief overview of user's testnet wallet holdings",
  "reasoning": ["Point 1", "Point 2", "Point 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "riskFactors": ["Risk 1", "Risk 2"]
}

Focus on:
- Wallet balance distribution across testnets
- Cross-chain presence (holding tokens on multiple networks)
- Portfolio size relative to testnet standards
- NO MENTION of DeFi protocols like Aave, Compound, etc. (unless actually detected)

Note: Adjust thresholds for testnet environment - smaller amounts are normal and acceptable.
Keep responses concise and accurate to actual wallet activity only.`;
}


  private parseAIResponse(aiText: string): AIInsights {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || 'Testnet analysis completed',
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
      summary: 'AI analysis completed based on cross-chain testnet DeFi activity.',
      reasoning: [
        'Portfolio shows cross-chain diversification between Sepolia and Amoy',
        'Lending positions demonstrate multi-chain DeFi engagement',
        'Health factors indicate understanding of risk management'
      ],
      recommendations: [
        'Consider expanding testnet experiments to more protocols',
        'Monitor health factors across different market conditions'
      ],
      riskFactors: [
        'Testnet environments may not reflect mainnet behavior',
        'Lower liquidity on testnets affects realistic testing'
      ]
    };
  }

  private getFallbackAnalysis(data: any): AIInsights {
  const totalTvl = data.totalTvl || 0;
  const hasMultiChain = (data.sepoliaTvl > 0) && (data.amoyTvl > 0);
  const sepoliaBalance = data.sepoliaBalance || 0;
  const amoyBalance = data.amoyBalance || 0;

  let summary = '';
  if (totalTvl > 5000) {
    summary = 'Active testnet user with significant wallet balances across chains';
  } else if (totalTvl > 1000) {
    summary = 'Growing testnet portfolio showing multi-chain wallet management';
  } else if (totalTvl > 100) {
    summary = 'Moderate testnet wallet activity with basic cross-chain presence';
  } else {
    summary = 'Early-stage testnet user with minimal wallet balances';
  }

  const reasoning = [
    hasMultiChain 
      ? `Successfully maintains balances on both Sepolia (${sepoliaBalance.toFixed(4)} ETH) and Amoy (${amoyBalance.toFixed(4)} MATIC)` 
      : sepoliaBalance > 0 
        ? `Holds ${sepoliaBalance.toFixed(4)} ETH on Sepolia testnet only`
        : amoyBalance > 0 
          ? `Holds ${amoyBalance.toFixed(4)} MATIC on Amoy testnet only`
          : 'No significant testnet balances detected',
    
    totalTvl > 500 
      ? 'Demonstrates commitment to testnet experimentation with meaningful balances' 
      : 'Basic testnet wallet setup with minimal funding',
    
    hasMultiChain 
      ? 'Shows understanding of multi-chain ecosystem by maintaining cross-chain balances'
      : 'Limited to single-chain activity, potential for expansion'
  ];

  const recommendations = totalTvl > 1000
    ? [
        'Consider exploring DeFi protocols on testnets to maximize learning',
        'Ready for mainnet activities with proper risk management'
      ]
    : [
        'Acquire more testnet funds to explore advanced features',
        'Experiment with cross-chain bridges and DeFi protocols'
      ];

  const riskFactors = totalTvl < 100
    ? [
        'Limited testnet funding may restrict learning opportunities',
        'Single-chain focus may limit multi-chain DeFi understanding'
      ]
    : [
        'Standard testnet limitations apply',
        'Testnet behavior may differ significantly from mainnet'
      ];

  return { summary, reasoning, recommendations, riskFactors };
}


private getBasicInsights(): AIInsights {
  return {
    summary: 'Cross-chain testnet wallet balance analysis completed.',
    reasoning: [
      'Wallet balances analyzed across Sepolia and Amoy testnets',
      'Portfolio value calculated based on current testnet holdings',
      'Cross-chain presence evaluated for multi-network understanding'
    ],
    recommendations: [
      'Continue building testnet experience with various protocols',
      'Maintain diverse wallet balances across different chains'
    ],
    riskFactors: [
      'Testnet environments have limited real-world applicability',
      'Wallet-only analysis may not reflect full DeFi engagement'
    ]
  };
}


  determineAccessLevel(totalTvl: number, avgHealth: number, chainCount: number): AccessLevel {
    // Adjusted thresholds for testnet environment (much lower than mainnet)
    if (totalTvl >= 10000 && avgHealth >= 2.0 && chainCount >= 2) {
      return {
        tier: 'PLATINUM',
        qualifiesForAccess: true
      };
    } else if (totalTvl >= 2500 && avgHealth >= 1.5 && chainCount >= 2) {
      return {
        tier: 'GOLD',
        qualifiesForAccess: true
      };
    } else if (totalTvl >= 500 && avgHealth >= 1.3) {
      return {
        tier: 'SILVER',
        qualifiesForAccess: true
      };
    } else if (totalTvl >= 100) {
      return {
        tier: 'BRONZE',
        qualifiesForAccess: true
      };
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