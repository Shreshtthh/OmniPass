import express from 'express';
import { AnalysisEngine } from '../services/AnalysisEngine';
import { AnalysisRequest, AnalysisResponse } from '../types';

const router = express.Router();
const analysisEngine = new AnalysisEngine();

// Analyze user's cross-chain activity
router.post('/user', async (req: express.Request, res: express.Response) => {
  const startTime = Date.now();
  
  try {
    const { address, chains }: AnalysisRequest = req.body;

    if (!address) {
      return res.status(400).json({
        success: false,
        error: 'Address is required',
        processingTime: Date.now() - startTime
      });
    }

    // Validate Ethereum address format
    if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid Ethereum address format',
        processingTime: Date.now() - startTime
      });
    }

    console.log(`📊 Processing analysis request for: ${address}`);

    const analysis = await analysisEngine.performCrossChainAnalysis(address);
    
    const response: AnalysisResponse = {
      success: true,
      data: analysis,
      processingTime: Date.now() - startTime
    };

    console.log(`✅ Analysis completed in ${response.processingTime}ms`);
    res.json(response);

  } catch (error) {
    console.error('Analysis error:', error);
    
    const response: AnalysisResponse = {
      success: false,
      error: error instanceof Error ? error.message : 'Analysis failed',
      processingTime: Date.now() - startTime
    };

    res.status(500).json(response);
  }
});

// Get supported chains
router.get('/chains', (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    data: [
      {
        name: 'Ethereum',
        chainId: 1,
        protocols: ['Aave V3', 'Compound V3'],
        status: 'active'
      },
      {
        name: 'BSC',
        chainId: 56,
        protocols: ['Venus Protocol', 'PancakeSwap'],
        status: 'active'
      },
      {
        name: 'Polygon',
        chainId: 137,
        protocols: ['Aave V3'],
        status: 'coming_soon'
      }
    ]
  });
});

// Health check for analysis service
router.get('/health', (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    status: 'Analysis service operational',
    timestamp: new Date().toISOString(),
    services: {
      alchemy: !!process.env.ALCHEMY_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY
    }
  });
});

export default router;