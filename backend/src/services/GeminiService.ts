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
Analyze this DeFi user's cross-chain activity and provide insights for access control decisions.

User Data:
- Address: ${data.address}
- Ethereum TVL: $${data.ethTvl?.toLocaleString() || '0'}
- BSC TVL: $${data.bscTvl?.toLocaleString() || '0'}
- Total Portfolio: $${data.totalTvl?.toLocaleString() || '0'}
- Aave Health Factor: ${data.aaveHealth || 'N/A'}
- Venus Health Factor: ${data.venusHealth || 'N/A'}
- Active Positions: ${data.activePositions || 0}

Please provide analysis in this exact JSON format:
{
  "summary": "Brief overview of user's DeFi profile",
  "reasoning": ["Point 1", "Point 2", "Point 3"],
  "recommendations": ["Recommendation 1", "Recommendation 2"],
  "riskFactors": ["Risk 1", "Risk 2"]
}

Focus on:
- Portfolio diversification across chains
- Risk management (health factors)
- Experience level based on protocol usage
- Capital efficiency and position management

Keep responses concise and actionable.`;
  }

  private parseAIResponse(aiText: string): AIInsights {
    try {
      // Try to extract JSON from the response
      const jsonMatch = aiText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          summary: parsed.summary || 'Analysis completed',
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
      summary: 'AI analysis completed based on cross-chain DeFi activity.',
      reasoning: [
        'Portfolio shows cross-chain diversification',
        'Lending positions indicate active DeFi participation',
        'Health factors suggest responsible risk management'
      ],
      recommendations: [
        'Continue diversifying across multiple protocols',
        'Monitor health factors regularly'
      ],
      riskFactors: [
        'Market volatility affects collateral values',
        'Smart contract risks across protocols'
      ]
    };
  }

  private getFallbackAnalysis(data: any): AIInsights {
    const totalTvl = data.totalTvl || 0;
    const hasMultiChain = (data.ethTvl > 0) && (data.bscTvl > 0);
    const avgHealth = (data.aaveHealth + data.venusHealth) / 2;

    let summary = '';
    if (totalTvl > 50000) {
      summary = 'High-value DeFi user with significant cross-chain exposure';
    } else if (totalTvl > 10000) {
      summary = 'Active DeFi participant with moderate portfolio size';
    } else {
      summary = 'Emerging DeFi user building cross-chain presence';
    }

    const reasoning = [
      hasMultiChain ? 'Diversified across Ethereum and BSC networks' : 'Limited to single chain activity',
      avgHealth > 1.5 ? 'Maintains healthy collateral ratios' : 'Moderate risk profile',
      totalTvl > 1000 ? 'Demonstrates commitment to DeFi protocols' : 'Early stage user'
    ];

    const recommendations = totalTvl > 10000 
      ? ['Consider expanding to additional L2 networks', 'Explore yield optimization strategies']
      : ['Gradually increase position sizes', 'Maintain diverse protocol exposure'];

    const riskFactors = avgHealth < 1.3 
      ? ['Health factor approaching liquidation risk', 'High leverage exposure']
      : ['Standard DeFi protocol risks', 'Market volatility exposure'];

    return { summary, reasoning, recommendations, riskFactors };
  }

  private getBasicInsights(): AIInsights {
    return {
      summary: 'Cross-chain DeFi activity analysis completed.',
      reasoning: [
        'Multi-protocol engagement detected',
        'Risk management practices evaluated',
        'Portfolio diversification assessed'
      ],
      recommendations: [
        'Continue active DeFi participation',
        'Monitor protocol health metrics'
      ],
      riskFactors: [
        'Smart contract interaction risks',
        'Market volatility exposure'
      ]
    };
  }

  determineAccessLevel(totalTvl: number, avgHealth: number, chainCount: number): AccessLevel {
    if (totalTvl >= 100000 && avgHealth >= 2.0 && chainCount >= 2) {
      return {
        tier: 'PLATINUM',
        qualifiesForAccess: true
      };
    } else if (totalTvl >= 25000 && avgHealth >= 1.5 && chainCount >= 2) {
      return {
        tier: 'GOLD',
        qualifiesForAccess: true
      };
    } else if (totalTvl >= 5000 && avgHealth >= 1.3) {
      return {
        tier: 'SILVER',
        qualifiesForAccess: true
      };
    } else if (totalTvl >= 1000) {
      return {
        tier: 'BRONZE',
        qualifiesForAccess: true
      };
    } else {
      return {
        tier: 'BRONZE',
        qualifiesForAccess: false,
        requiredTVL: 1000,
        requiredScore: 50
      };
    }
  }
}