import express from 'express';
import { AnalysisEngine } from '../services/AnalysisEngine';
import { AlchemyService } from '../services/AlchemyService';
import { AnalysisRequest, AnalysisResponse } from '../types';
import { ContractService } from '../services/ContractService';
import { ethers } from 'ethers';

const router = express.Router();
const analysisEngine = new AnalysisEngine();
const contractService = new ContractService();

// GET analysis by address (matches frontend expectation)
router.get('/:address', async (req: express.Request, res: express.Response) => {
  const startTime = Date.now();
  
  try {
    const { address } = req.params;
    
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

    console.log(`📊 Processing testnet analysis for: ${address}`);
    console.log(`🌐 Analyzing Sepolia and Amoy testnets`);
    
    const analysis = await analysisEngine.performCrossChainAnalysis(address);
    
    const response: AnalysisResponse = {
      success: true,
      data: analysis,
      processingTime: Date.now() - startTime
    };

    console.log(`✅ Testnet analysis completed in ${response.processingTime}ms`);
    console.log(`💰 TVL: $${analysis.totalValueLocked.toLocaleString()}, Tier: ${analysis.accessLevel.tier}`);
    
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

// ✅ NEW: Issue credential endpoint
router.post('/issue-credential', async (req: express.Request, res: express.Response) => {
  const startTime = Date.now();
  
  try {
    const { address } = req.body;
    
    if (!address || !/^0x[a-fA-F0-9]{40}$/.test(address)) {
      return res.status(400).json({
        success: false,
        error: 'Valid Ethereum address is required',
        processingTime: Date.now() - startTime
      });
    }

    // Get user's analysis to determine tier
    const analysis = await analysisEngine.performCrossChainAnalysis(address);
    
    console.log(`🏆 Issuing ${analysis.accessLevel.tier} credential for ${address}`);
    
    const crossChainData = analysis.chains.map(chain => ({
      chainId: chain.chainId,
      tvl: chain.tvl,
      positions: chain.protocols.length,
      dataHash: ethers.keccak256(ethers.toUtf8Bytes(JSON.stringify(chain)))
    }));

    // Create AI insights hash
    const aiInsightsHash = ethers.keccak256(
      ethers.toUtf8Bytes(JSON.stringify(analysis.aiInsights))
    );

    // ✅ CALL YOUR CONTRACT SERVICE
    const txHash = await contractService.issueCredential(
      address,
      crossChainData,
      aiInsightsHash
    );
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    res.json({
      success: true,
      transactionHash: txHash,
      tier: analysis.accessLevel.tier,
      processingTime: Date.now() - startTime,
      network: 'zetachain-athens-testnet',
      contractAddress: contractService.getContractAddress()
    });
    
  } catch (error) {
    console.error('Error issuing credential:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to issue credential on ZetaChain',
      processingTime: Date.now() - startTime
    });
  }
});

// Analyze user's cross-chain activity on testnets (Original POST route)
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

    console.log(`📊 Processing testnet analysis for: ${address}`);
    console.log(`🌐 Analyzing Sepolia and Amoy testnets`);

    const analysis = await analysisEngine.performCrossChainAnalysis(address);
    
    const response: AnalysisResponse = {
      success: true,
      data: analysis,
      processingTime: Date.now() - startTime
    };

    console.log(`✅ Testnet analysis completed in ${response.processingTime}ms`);
    console.log(`💰 TVL: $${analysis.totalValueLocked.toLocaleString()}, Tier: ${analysis.accessLevel.tier}`);
    
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

// Get supported chains (updated for testnets)
router.get('/chains', (req: express.Request, res: express.Response) => {
  const supportedChains = AlchemyService.getSupportedChains();
  
  res.json({
    success: true,
    data: supportedChains.map(chain => ({
      ...chain,
      status: 'active'
    })),
    note: 'These are testnets for development and demonstration purposes'
  });
});

// Health check for analysis service
router.get('/health', (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    status: 'Analysis service operational (Testnet Mode)',
    timestamp: new Date().toISOString(),
    services: {
      alchemy: !!process.env.ALCHEMY_API_KEY,
      gemini: !!process.env.GEMINI_API_KEY
    },
    supportedNetworks: ['Sepolia (11155111)', 'Polygon Amoy (80002)'],
    mode: 'testnet'
  });
});

// Get testnet faucet information
router.get('/faucets', (req: express.Request, res: express.Response) => {
  res.json({
    success: true,
    faucets: [
      {
        name: 'Sepolia ETH Faucet',
        url: 'https://sepoliafaucet.com/',
        asset: 'ETH',
        chain: 'Sepolia',
        note: 'Get free Sepolia ETH for testing'
      },
      {
        name: 'Polygon Amoy Faucet',
        url: 'https://faucet.polygon.technology/',
        asset: 'MATIC',
        chain: 'Polygon Amoy',
        note: 'Get free MATIC for testing on Amoy'
      }
    ],
    instructions: [
      '1. Connect your wallet to the respective testnet',
      '2. Visit the faucet URL',
      '3. Enter your wallet address', 
      '4. Request testnet tokens',
      '5. Wait for transaction confirmation'
    ]
  });
});

export default router;
