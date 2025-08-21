import axios from 'axios';
import { ethers } from 'ethers';
import { LendingData, LendingPosition } from '../types';

export class AlchemyService {
  private apiKey: string;
  private providers: Record<string, ethers.JsonRpcProvider>;
  private baseUrls: Record<string, string>;

  constructor() {
    this.apiKey = process.env.ALCHEMY_API_KEY || '';
    
    // Enhanced logging for debugging
    console.log('🔑 Alchemy API Key loaded:', !!this.apiKey);
    if (this.apiKey) {
      console.log('🔑 API Key preview:', this.apiKey.slice(0, 8) + '...');
    }
    
    // Updated for testnets - Sepolia and Amoy only
    this.baseUrls = {
      sepolia: `https://eth-sepolia.g.alchemy.com/v2/${this.apiKey}`,
      amoy: `https://polygon-amoy.g.alchemy.com/v2/${this.apiKey}`
    };

    // Initialize ethers providers for live blockchain calls
    this.providers = {
      sepolia: new ethers.JsonRpcProvider(this.baseUrls.sepolia),
      amoy: new ethers.JsonRpcProvider(this.baseUrls.amoy)
    };

    if (!this.apiKey) {
      console.warn('⚠️  ALCHEMY_API_KEY not found. Using mock data for demonstration.');
    } else {
      console.log('✅ AlchemyService initialized with real API key');
    }
  }

  async getSepoliaBalance(address: string): Promise<number> {
    try {
      if (!this.apiKey) {
        console.log('⚠️ No ALCHEMY_API_KEY found, using mock Sepolia data');
        return this.getMockEthBalance(address);
      }

      console.log(`🔍 Fetching REAL Sepolia balance for ${address}`);
      const balance = await this.providers.sepolia.getBalance(address);
      const balanceInEth = parseFloat(ethers.formatEther(balance));
      console.log(`💰 REAL Sepolia balance: ${balanceInEth} ETH`);
      
      return balanceInEth;
    } catch (error) {
      console.error('❌ Error fetching Sepolia balance:', error);
      console.log('⚠️ Falling back to MOCK Sepolia data');
      return this.getMockEthBalance(address);
    }
  }

  async getAmoyBalance(address: string): Promise<number> {
    try {
      if (!this.apiKey) {
        console.log('⚠️ No ALCHEMY_API_KEY found, using mock Amoy data');
        return this.getMockMaticBalance(address);
      }

      console.log(`🔍 Fetching REAL Amoy balance for ${address}`);
      const balance = await this.providers.amoy.getBalance(address);
      const balanceInMatic = parseFloat(ethers.formatEther(balance));
      console.log(`💰 REAL Amoy balance: ${balanceInMatic} MATIC`);
      
      return balanceInMatic;
    } catch (error) {
      console.error('❌ Error fetching Amoy balance:', error);
      console.log('⚠️ Falling back to MOCK Amoy data');
      return this.getMockMaticBalance(address);
    }
  }

  async getTokenBalances(address: string, chainId: number): Promise<any[]> {
    try {
      if (!this.apiKey) {
        console.log(`⚠️ No API key, using mock token balances for chain ${chainId}`);
        return this.getMockTokenBalances(address, chainId);
      }

      console.log(`🔍 Fetching REAL token balances for ${address} on chain ${chainId}`);
      const baseUrl = chainId === 11155111 ? this.baseUrls.sepolia : this.baseUrls.amoy;
      
      const response = await axios.post(baseUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'alchemy_getTokenBalances',
        params: [address]
      });

      const tokenBalances = response.data.result?.tokenBalances || [];
      console.log(`💰 Found ${tokenBalances.length} REAL token balances`);
      return tokenBalances;
    } catch (error) {
      console.error('❌ Error fetching token balances:', error);
      console.log('⚠️ Falling back to MOCK token balances');
      return this.getMockTokenBalances(address, chainId);
    }
  }

  // Updated for Aave V3 on Sepolia
  async getAaveLendingData(address: string): Promise<LendingData> {
    try {
      if (!this.apiKey) {
        console.log('⚠️ No API key, using MOCK Aave Sepolia data');
        return this.getMockAaveData(address);
      }

      // NOTE: This still uses mock data because Aave contract integration isn't implemented yet
      // In a real implementation, you would call Aave V3 contracts on Sepolia
      // Aave V3 Sepolia Pool: 0x6Ae43d3271ff6888e7Fc43Fd7321a503ff738951
      console.log('⚠️ Aave contract integration not implemented yet, using MOCK data');
      return this.getMockAaveData(address);
    } catch (error) {
      console.error('❌ Error fetching Aave data:', error);
      console.log('⚠️ Falling back to MOCK Aave data');
      return this.getMockAaveData(address);
    }
  }

  // Updated for Aave V3 on Amoy (Polygon testnet)
  async getAmoyLendingData(address: string): Promise<LendingData> {
    try {
      if (!this.apiKey) {
        console.log('⚠️ No API key, using MOCK Aave Amoy data');
        return this.getMockAmoyData(address);
      }

      // NOTE: This still uses mock data because Aave contract integration isn't implemented yet
      // In a real implementation, you would call Aave V3 contracts on Amoy
      console.log('⚠️ Aave Amoy contract integration not implemented yet, using MOCK data');
      return this.getMockAmoyData(address);
    } catch (error) {
      console.error('❌ Error fetching Amoy lending data:', error);
      console.log('⚠️ Falling back to MOCK Amoy lending data');
      return this.getMockAmoyData(address);
    }
  }

  // Mock data methods for reliable demo - updated for testnets
  private getMockEthBalance(address: string): number {
    const seed = this.addressToSeed(address);
    const mockBalance = 0.1 + (seed % 2); // 0.1 to 2.1 ETH (realistic testnet amounts)
    console.log(`📊 Generated MOCK Sepolia balance: ${mockBalance} ETH`);
    return mockBalance;
  }

  private getMockMaticBalance(address: string): number {
    const seed = this.addressToSeed(address);
    const mockBalance = 1 + (seed % 10); // 1 to 11 MATIC (realistic testnet amounts)
    console.log(`📊 Generated MOCK Amoy balance: ${mockBalance} MATIC`);
    return mockBalance;
  }

  private getMockTokenBalances(address: string, chainId: number): any[] {
    const seed = this.addressToSeed(address);
    
    const tokens = chainId === 11155111 // Sepolia
      ? [
          // USDC on Sepolia
          { contractAddress: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8', tokenBalance: '0x' + (100 + seed % 1000).toString(16) },
          // DAI on Sepolia  
          { contractAddress: '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357', tokenBalance: '0x' + (50 + seed % 500).toString(16) }
        ]
      : [
          // USDC on Amoy
          { contractAddress: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', tokenBalance: '0x' + (200 + seed % 2000).toString(16) }
        ];
    
    console.log(`📊 Generated ${tokens.length} MOCK token balances for chain ${chainId}`);
    return tokens;
  }

  private getMockAaveData(address: string): LendingData {
    const seed = this.addressToSeed(address);
    
    const mockData = {
      protocol: 'Aave V3',
      chain: 'Sepolia',
      totalSupplied: 1000 + (seed % 5000), // Smaller amounts for testnet
      totalBorrowed: 300 + (seed % 1500),
      healthFactor: 1.5 + (seed % 100) / 100,
      positions: [
        {
          asset: 'USDC',
          supplied: 500 + (seed % 1000),
          borrowed: 100 + (seed % 300),
          apy: 3.2 + (seed % 200) / 100
        },
        {
          asset: 'ETH',
          supplied: 0.3 + (seed % 1),
          borrowed: 0.1 + (seed % 0.3),
          apy: 2.8 + (seed % 150) / 100
        }
      ]
    };
    
    console.log(`📊 Generated MOCK Aave Sepolia data: TVL $${mockData.totalSupplied}`);
    return mockData;
  }

  private getMockAmoyData(address: string): LendingData {
    const seed = this.addressToSeed(address);
    
    const mockData = {
      protocol: 'Aave V3',
      chain: 'Polygon Amoy',
      totalSupplied: 500 + (seed % 2500), // Smaller amounts for testnet
      totalBorrowed: 150 + (seed % 800),
      healthFactor: 1.8 + (seed % 120) / 100,
      positions: [
        {
          asset: 'MATIC',
          supplied: 20 + (seed % 50),
          borrowed: 5 + (seed % 15),
          apy: 4.1 + (seed % 180) / 100
        },
        {
          asset: 'USDC',
          supplied: 200 + (seed % 800),
          borrowed: 50 + (seed % 200),
          apy: 3.8 + (seed % 160) / 100
        }
      ]
    };
    
    console.log(`📊 Generated MOCK Aave Amoy data: TVL $${mockData.totalSupplied}`);
    return mockData;
  }

  private addressToSeed(address: string): number {
    return parseInt(address.slice(-6), 16);
  }

  // Helper method to get supported chains
  static getSupportedChains() {
    return [
      {
        name: 'Sepolia',
        chainId: 11155111,
        protocols: ['Aave V3'],
        faucet: 'https://sepoliafaucet.com/',
        explorer: 'https://sepolia.etherscan.io'
      },
      {
        name: 'Polygon Amoy',
        chainId: 80002,
        protocols: ['Aave V3'],
        faucet: 'https://faucet.polygon.technology/',
        explorer: 'https://amoy.polygonscan.com'
      }
    ];
  }
}
