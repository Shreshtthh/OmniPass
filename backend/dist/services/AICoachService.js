"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AICoachService = void 0;
// backend/src/services/AICoachService.ts
const axios_1 = __importDefault(require("axios"));
class AICoachService {
    constructor() {
        this.responseCache = new Map();
        this.CACHE_TTL = 300000; // 5 minutes
        this.rateLimiter = new Map();
        this.RATE_LIMIT_WINDOW = 60000; // 1 minute
        this.MAX_REQUESTS_PER_WINDOW = 10;
        this.apiKey = process.env.GEMINI_API_KEY || '';
        this.apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    }
    getCachedResponse(cacheKey) {
        const cached = this.responseCache.get(cacheKey);
        if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
            return cached.response;
        }
        return null;
    }
    setCachedResponse(cacheKey, response) {
        this.responseCache.set(cacheKey, { response, timestamp: Date.now() });
    }
    checkRateLimit(identifier) {
        const now = Date.now();
        const windowStart = now - this.RATE_LIMIT_WINDOW;
        // Clean old entries
        for (const [key, timestamp] of this.rateLimiter.entries()) {
            if (timestamp < windowStart) {
                this.rateLimiter.delete(key);
            }
        }
        // Count requests in current window
        const recentRequests = Array.from(this.rateLimiter.values())
            .filter(timestamp => timestamp >= windowStart).length;
        if (recentRequests >= this.MAX_REQUESTS_PER_WINDOW) {
            return false;
        }
        this.rateLimiter.set(`${identifier}-${now}`, now);
        return true;
    }
    getAvailableQuestions(userAnalysis) {
        const baseQuestions = [
            { id: 'next-tier', question: 'How to reach the next tier?', category: 'tier', requiresAnalysis: true },
            { id: 'improve-risk', question: 'How to improve my risk score?', category: 'risk', requiresAnalysis: true },
            { id: 'explore-protocols', question: 'What protocols should I explore?', category: 'protocol', requiresAnalysis: false },
            { id: 'diversification', question: 'How can I diversify my portfolio better?', category: 'risk', requiresAnalysis: true },
            { id: 'cross-chain', question: 'Which chains should I expand to?', category: 'protocol', requiresAnalysis: true },
            { id: 'defi-basics', question: 'What are the safest DeFi strategies for beginners?', category: 'general', requiresAnalysis: false },
            { id: 'yield-optimization', question: 'How can I optimize my yield farming returns?', category: 'protocol', requiresAnalysis: true },
            { id: 'risk-management', question: 'What are the main risks in DeFi I should watch?', category: 'risk', requiresAnalysis: false }
        ];
        if (userAnalysis) {
            return this.filterQuestionsForUser(baseQuestions, userAnalysis);
        }
        return baseQuestions;
    }
    filterQuestionsForUser(questions, analysis) {
        const currentTier = analysis.accessLevel.tier;
        const hasMultiChain = analysis.chains.filter(c => c.tvl > 0).length > 1;
        let relevantQuestions = [...questions];
        if (currentTier === 'BRONZE') {
            relevantQuestions.push({
                id: 'bronze-upgrade',
                question: 'I\'m Bronze tier, what should I focus on first?',
                category: 'tier',
                requiresAnalysis: true
            });
        }
        if (!hasMultiChain) {
            relevantQuestions.push({
                id: 'multi-chain-start',
                question: 'How do I start using multiple chains?',
                category: 'protocol',
                requiresAnalysis: true
            });
        }
        return relevantQuestions;
    }
    async answerQuestion(questionId, customQuestion, userAnalysis) {
        try {
            if (!this.apiKey) {
                console.warn('🤖 No Gemini API key found, using fallback answers');
                return this.getFallbackAnswer(questionId, customQuestion);
            }
            // Check cache first
            const cacheKey = `${questionId}-${customQuestion || ''}-${userAnalysis?.accessLevel.tier || 'no-tier'}`;
            const cached = this.getCachedResponse(cacheKey);
            if (cached) {
                console.log('🤖 Returning cached response');
                return cached;
            }
            // Check rate limiting
            const rateLimitKey = userAnalysis?.accessLevel.tier ?? 'anonymous';
            if (!this.checkRateLimit(rateLimitKey)) {
                console.warn('🤖 Rate limit exceeded for:', rateLimitKey);
                return {
                    question: customQuestion || this.getQuestionText(questionId),
                    answer: 'You are making requests too quickly. Please wait a moment before asking more questions. This helps us provide quality responses to all users.',
                    actionItems: ['Wait 1 minute before asking another question', 'Consider browsing existing questions first'],
                    relatedQuestions: ['What protocols should I explore?', 'How to improve my risk score?']
                };
            }
            const prompt = this.buildCoachingPrompt(questionId, customQuestion, userAnalysis);
            console.log('🤖 Calling Gemini API for coaching response...');
            const response = await axios_1.default.post(`${this.apiUrl}?key=${this.apiKey}`, {
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: {
                    maxOutputTokens: parseInt(process.env.GEMINI_MAX_TOKENS || '1000'),
                    temperature: 0.7,
                    topP: 0.8,
                    topK: 40
                }
            }, {
                headers: { 'Content-Type': 'application/json' },
                timeout: parseInt(process.env.COACH_TIMEOUT || '15000')
            });
            if (!response.data?.candidates?.[0]?.content?.parts?.[0]?.text) {
                throw new Error('Invalid Gemini API response structure');
            }
            const aiText = response.data.candidates[0].content.parts[0].text;
            const coachResponse = this.parseCoachResponse(aiText, questionId, customQuestion);
            // Cache the response
            this.setCachedResponse(cacheKey, coachResponse);
            console.log('🤖 Gemini API response cached successfully');
            return coachResponse;
        }
        catch (error) {
            // Enhanced error logging
            if (error.code === 'ECONNABORTED') {
                console.error('🤖 AI Coach timeout:', error.message);
            }
            else if (error.response?.status === 401) {
                console.error('🤖 Invalid Gemini API key');
            }
            else if (error.response?.status === 429) {
                console.error('🤖 Gemini API rate limit exceeded');
            }
            else if (error.response?.status === 400) {
                console.error('🤖 Invalid request to Gemini API:', error.response?.data);
            }
            else {
                console.error('🤖 AI Coach error:', error.message || error);
            }
            return this.getFallbackAnswer(questionId, customQuestion);
        }
    }
    buildCoachingPrompt(questionId, customQuestion, userAnalysis) {
        const question = customQuestion || this.getQuestionText(questionId);
        let prompt = `You are OmniPass AI Coach, an expert DeFi advisor specializing in cross-chain portfolio optimization and risk management.

CONTEXT:
- User Question: "${question}"
- Focus on testnet-friendly advice since this is educational
- Provide actionable, specific guidance
- Consider multi-chain opportunities (Ethereum, Polygon, ZetaChain)`;
        if (userAnalysis) {
            const activeChains = userAnalysis.chains.filter(c => c.tvl > 0);
            prompt += `

USER PORTFOLIO ANALYSIS:
- Current Tier: ${userAnalysis.accessLevel.tier}
- Total Value Locked: $${userAnalysis.totalValueLocked.toLocaleString()}
- Risk Score: ${userAnalysis.riskScore}/100 ${userAnalysis.riskScore < 50 ? '(Needs Improvement)' : userAnalysis.riskScore > 80 ? '(Excellent)' : '(Good)'}
- Activity Score: ${userAnalysis.activityScore}/100
- Diversification Score: ${userAnalysis.diversificationScore}/100
- Active Chains: ${activeChains.length} - ${activeChains.map(c => `${c.name} ($${c.tvl.toLocaleString()})`).join(', ')}
- Risk Factors: ${userAnalysis.aiInsights.riskFactors.join(', ')}
- Current Strengths: ${userAnalysis.aiInsights.reasoning.slice(0, 2).join(', ')}`;
        }
        prompt += `

RESPONSE FORMAT (Must be valid JSON):
{
  "answer": "Provide 2-3 paragraph detailed response with specific protocols, strategies, and actionable advice",
  "actionItems": ["Step 1: Specific actionable step", "Step 2: Another specific action", "Step 3: Third concrete step"],
  "relatedQuestions": ["Related question 1", "Related question 2"]
}

GUIDELINES:
- Recommend testnet protocols for learning (Aave V3 Sepolia, Uniswap V3 on Polygon)
- Focus on established, audited protocols with good track records
- Include specific numbers/targets when possible (e.g., "maintain health factor above 2.0")
- Mention risk management practices and safety measures
- Keep advice beginner-friendly but comprehensive and actionable
- If user has low TVL, focus on educational testnet strategies first`;
        return prompt;
    }
    parseCoachResponse(aiText, questionId, customQuestion) {
        try {
            // Try to extract JSON from the response
            const jsonMatch = aiText.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                const parsed = JSON.parse(jsonMatch[0]);
                // Validate the response has required fields
                if (!parsed.answer) {
                    throw new Error('Missing answer field in AI response');
                }
                return {
                    question: customQuestion || this.getQuestionText(questionId),
                    answer: parsed.answer,
                    actionItems: Array.isArray(parsed.actionItems) ? parsed.actionItems : [],
                    relatedQuestions: Array.isArray(parsed.relatedQuestions) ? parsed.relatedQuestions : []
                };
            }
            else {
                throw new Error('No valid JSON found in AI response');
            }
        }
        catch (error) {
            console.error('Error parsing coach response:', error);
            console.log('Raw AI response:', aiText);
        }
        return this.getFallbackAnswer(questionId, customQuestion);
    }
    getFallbackAnswer(questionId, customQuestion) {
        const question = customQuestion || this.getQuestionText(questionId);
        const fallbackAnswers = {
            'next-tier': {
                question: 'How to reach the next tier?',
                answer: 'To advance to the next tier in OmniPass, focus on increasing your Total Value Locked (TVL) across multiple chains while maintaining good risk management practices. Start by expanding your holdings to at least 2-3 different blockchain networks like Ethereum, Polygon, and ZetaChain. Maintain healthy lending positions with health factors above 1.5 on platforms like Aave V3. Your activity score improves through diverse protocol interactions, so explore different DeFi protocols systematically. Remember to use testnets first to practice strategies before committing mainnet funds.',
                actionItems: [
                    'Increase TVL by gradually adding more funds across multiple chains',
                    'Expand to at least 2-3 different blockchain networks (Ethereum, Polygon, ZetaChain)',
                    'Maintain lending positions with health factors above 1.5 on Aave V3',
                    'Interact with 3+ different DeFi protocols to boost activity score'
                ],
                relatedQuestions: [
                    'What protocols should I explore?',
                    'How to improve my risk score?'
                ]
            },
            'improve-risk': {
                question: 'How to improve my risk score?',
                answer: 'Improving your risk score requires a combination of conservative position management and portfolio diversification. Focus on maintaining higher health factors in lending protocols (aim for 2.0+ on Aave), diversifying your holdings across multiple chains and protocols, and avoiding over-leveraged positions. Use established, audited protocols like Aave, Compound, and Uniswap rather than newer, unproven platforms. Consider dollar-cost averaging into positions rather than making large single investments, and always keep emergency reserves.',
                actionItems: [
                    'Keep health factors above 2.0 in all lending protocols',
                    'Diversify holdings across 3+ different protocols and chains',
                    'Use conservative leverage ratios (maximum 2:1 if any)',
                    'Maintain 10-20% of portfolio in stablecoins as emergency reserves'
                ],
                relatedQuestions: [
                    'What are the safest DeFi strategies for beginners?',
                    'How can I diversify my portfolio better?'
                ]
            },
            'explore-protocols': {
                question: 'What protocols should I explore?',
                answer: 'Start your DeFi journey with battle-tested lending protocols like Aave V3 on Ethereum and Polygon for earning stable yields on your assets. Next, explore decentralized exchanges like Uniswap V3 for liquidity provision, starting with stable pairs (USDC/USDT) before moving to more volatile pairs. Consider yield farming opportunities on Curve Finance for additional returns. Always start on testnets to understand the mechanics before committing real funds, and research each protocol thoroughly including recent audits and TVL trends.',
                actionItems: [
                    'Start with Aave V3 lending on Sepolia testnet, then mainnet',
                    'Try providing liquidity on Uniswap V3 with stablecoin pairs first',
                    'Explore Curve Finance for yield farming opportunities',
                    'Research protocol audits and community feedback before investing'
                ],
                relatedQuestions: [
                    'How to reach the next tier?',
                    'What are the main risks in DeFi I should watch?'
                ]
            }
        };
        return fallbackAnswers[questionId] || {
            question,
            answer: 'Thank you for your question about DeFi strategy. This is an important topic for building a successful cross-chain portfolio. Start by focusing on established, audited protocols and maintaining good risk management practices. Consider beginning with lending protocols like Aave for stable returns, then gradually exploring more complex strategies like liquidity provision and yield farming. Always research thoroughly and start with small amounts on testnets to learn the mechanics safely.',
            actionItems: [
                'Research the topic thoroughly using official documentation',
                'Start with small amounts on testnets to practice safely',
                'Join DeFi communities and forums for additional insights and support'
            ],
            relatedQuestions: [
                'What protocols should I explore?',
                'How to improve my risk score?'
            ]
        };
    }
    getQuestionText(questionId) {
        const questionMap = {
            'next-tier': 'How to reach the next tier?',
            'improve-risk': 'How to improve my risk score?',
            'explore-protocols': 'What protocols should I explore?',
            'diversification': 'How can I diversify my portfolio better?',
            'cross-chain': 'Which chains should I expand to?',
            'defi-basics': 'What are the safest DeFi strategies for beginners?',
            'yield-optimization': 'How can I optimize my yield farming returns?',
            'risk-management': 'What are the main risks in DeFi I should watch?'
        };
        return questionMap[questionId] || 'General DeFi question';
    }
    getSuggestedQuestions(userAnalysis) {
        const currentTier = userAnalysis.accessLevel.tier;
        const tvl = userAnalysis.totalValueLocked;
        const chainCount = userAnalysis.chains.filter(c => c.tvl > 0).length;
        const riskScore = userAnalysis.riskScore;
        let suggestions = [];
        if (currentTier === 'BRONZE' && tvl < 500) {
            suggestions.push('How can I increase my portfolio value efficiently on testnets?');
        }
        if (chainCount < 2) {
            suggestions.push('Which chain should I expand to next for better diversification?');
        }
        if (riskScore < 60) {
            suggestions.push('How can I improve my risk management and safety practices?');
        }
        if (userAnalysis.activityScore < 50) {
            suggestions.push('How can I increase my DeFi activity score safely?');
        }
        if (suggestions.length === 0) {
            suggestions = [
                'How can I optimize my yield farming strategy?',
                'What new protocols are worth exploring safely?',
                'How do I prepare my portfolio for market volatility?'
            ];
        }
        return suggestions;
    }
}
exports.AICoachService = AICoachService;
