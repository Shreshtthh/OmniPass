// backend/src/routes/coach.ts
import express from 'express';
import { AICoachService } from '../services/AICoachService';
import { AnalysisEngine } from '../services/AnalysisEngine';

const router = express.Router();
const aiCoach = new AICoachService();
const analysisEngine = new AnalysisEngine();

// Get available coaching questions
router.get('/questions/:address?', async (req: express.Request, res: express.Response) => {
  try {
    const { address } = req.params;
    let userAnalysis = undefined;
    
    // If address provided, get user analysis for personalized questions
    if (address && /^0x[a-fA-F0-9]{40}$/.test(address)) {
      try {
        userAnalysis = await analysisEngine.performCrossChainAnalysis(address);
        console.log(`📊 Got analysis for questions: ${userAnalysis.accessLevel.tier} tier`);
      } catch (error) {
        console.warn('Could not get analysis for personalized questions:', error);
      }
    }
    
    const questions = aiCoach.getAvailableQuestions(userAnalysis);
    
    res.json({
      success: true,
      questions: questions.map(q => ({
        id: q.id,
        question: q.question,
        category: q.category,
        requiresAnalysis: q.requiresAnalysis
      })),
      suggestedQuestions: userAnalysis ? aiCoach.getSuggestedQuestions(userAnalysis) : [],
      personalizedResponse: !!userAnalysis
    });
  } catch (error) {
    console.error('Error getting coach questions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get coaching questions'
    });
  }
});

// Answer a specific question
router.post('/ask', async (req: express.Request, res: express.Response) => {
  const startTime = Date.now();
  try {
    const { questionId, customQuestion, address } = req.body;
    
    if (!questionId && !customQuestion) {
      return res.status(400).json({
        success: false,
        error: 'Either questionId or customQuestion is required'
      });
    }

    let userAnalysis = undefined;
    
    // Get user analysis if address provided
    if (address && /^0x[a-fA-F0-9]{40}$/.test(address)) {
      try {
        userAnalysis = await analysisEngine.performCrossChainAnalysis(address);
        console.log(`📊 Got user analysis for coaching: ${userAnalysis.accessLevel.tier} tier, $${userAnalysis.totalValueLocked.toLocaleString()} TVL`);
      } catch (error) {
        console.warn('Could not get analysis for personalized coaching:', error);
      }
    }

    console.log(`🤖 AI Coach processing: ${customQuestion || questionId}`);
    
    const response = await aiCoach.answerQuestion(questionId, customQuestion, userAnalysis);
    const processingTime = Date.now() - startTime;
    
    res.json({
      success: true,
      data: response,
      processingTime,
      personalizedAdvice: !!userAnalysis,
      userTier: userAnalysis?.accessLevel.tier,
      cacheUsed: processingTime < 100 // Likely cached if very fast
    });
    
  } catch (error) {
    console.error('Error in AI coaching:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get coaching response',
      processingTime: Date.now() - startTime
    });
  }
});

// Get quick suggestions based on user's current state
router.get('/suggestions/:address', async (req: express.Request, res: express.Response) => {
  try {
    const { address } = req.params;
    
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: 'Valid Ethereum address is required'
      });
    }

    const userAnalysis = await analysisEngine.performCrossChainAnalysis(address);
    const suggestions = aiCoach.getSuggestedQuestions(userAnalysis);
    
    res.json({
      success: true,
      suggestions,
      userTier: userAnalysis.accessLevel.tier,
      tvl: userAnalysis.totalValueLocked,
      riskScore: userAnalysis.riskScore,
      recommendations: suggestions.length
    });
    
  } catch (error) {
    console.error('Error getting suggestions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get personalized suggestions'
    });
  }
});

// Health check for coaching service
router.get('/health', (req: express.Request, res: express.Response) => {
  const hasApiKey = !!process.env.GEMINI_API_KEY;
  
  res.json({
    success: true,
    status: 'AI Coach service operational',
    features: [
      'Personalized DeFi coaching with Gemini AI',
      'Tier advancement guidance', 
      'Risk management advice',
      'Protocol recommendations',
      'Caching and rate limiting'
    ],
    availableQuestions: aiCoach.getAvailableQuestions().length,
    geminiApiConfigured: hasApiKey,
    fallbackMode: !hasApiKey
  });
});

// Get coaching analytics (optional - for monitoring)
router.get('/analytics', (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    message: 'Coaching analytics endpoint - implement as needed',
    suggestedMetrics: [
      'Most asked questions',
      'User satisfaction ratings',
      'API response times',
      'Cache hit rates'
    ]
  });
});

export default router;
