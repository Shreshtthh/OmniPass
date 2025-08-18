import axios from 'axios';
import { LendingData, LendingPosition } from '../types';

export class AlchemyService {
  private apiKey: string;
  private baseUrls: Record<string, string>;

  constructor() {
    this.apiKey = process.env.ALCHEMY_API_KEY || '';
    this.baseUrls = {
      ethereum: `https://eth-mainnet.g.alchemy.com/v2/${this.apiKey}`,
      polygon: `https://polygon-mainnet.g.alchemy.com/v2/${this.apiKey}`,
      bsc: 'https://bsc-dataseed.binance.org' // BSC public endpoint
    };

    if (!this.apiKey) {
      console.warn('⚠️  ALCHEMY_API_KEY not found. Using mock data for demonstration.');
    }
  }

  async getEthereumBalance(address: string): Promise<number> {
    try {
      if (!this.apiKey) {
        return this.getMockEthBalance(address);
      }

      const response = await axios.post(this.baseUrls.ethereum, {
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_getBalance',
        params: [address, 'latest']
      });

      const balanceWei = parseInt(response.data.result, 16);
      return balanceWei / Math.pow(10, 18); // Convert to ETH
    } catch (error) {
      console.error('Error fetching Ethereum balance:', error);
      return this.getMockEthBalance(address);
    }
  }

  async getTokenBalances(address: string, chainId: number): Promise<any[]> {
    try {
      if (!this.apiKey) {
        return this.getMockTokenBalances(address, chainId);
      }

      const baseUrl = chainId === 1 ? this.baseUrls.ethereum : this.baseUrls.polygon;
      
      const response = await axios.post(baseUrl, {
        jsonrpc: '2.0',
        id: 1,
        method: 'alchemy_getTokenBalances',
        params: [address]
      });

      return response.data.result.tokenBalances || [];
    } catch (error) {
      console.error('Error fetching token balances:', error);
      return this.getMockTokenBalances(address, chainId);
    }
  }

  async getAaveLendingData(address: string): Promise<LendingData> {
    try {
      if (!this.apiKey) {
        return this.getMockAaveData(address);
      }

      // In a real implementation, you would call Aave's contracts
      // For now, using mock data with realistic values
      return this.getMockAaveData(address);
    } catch (error) {
      console.error('Error fetching Aave data:', error);
      return this.getMockAaveData(address);
    }
  }

  async getVenusLendingData(address: string): Promise<LendingData> {
    try {
      // Venus protocol on BSC - using mock data for demo
      return this.getMockVenusData(address);
    } catch (error) {
      console.error('Error fetching Venus data:', error);
      return this.getMockVenusData(address);
    }
  }

  // Mock data methods for reliable demo
  private getMockEthBalance(address: string): number {
    const seed = this.addressToSeed(address);
    return 0.5 + (seed % 5); // 0.5 to 5.5 ETH
  }

  private getMockTokenBalances(address: string, chainId: number): any[] {
    const seed = this.addressToSeed(address);
    
    const tokens = chainId === 1 
      ? [
          { contractAddress: '0xA0b86a33E6417Bc29Ec6CD4965c2c83c4ddc1A3B', tokenBalance: '0x' + (1000 + seed % 5000).toString(16) },
          { contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', tokenBalance: '0x' + (500 + seed % 2000).toString(16) }
        ]
      : [
          { contractAddress: '0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d', tokenBalance: '0x' + (2000 + seed % 8000).toString(16) }
        ];
    
    return tokens;
  }

  private getMockAaveData(address: string): LendingData {
    const seed = this.addressToSeed(address);
    
    return {
      protocol: 'Aave V3',
      chain: 'Ethereum',
      totalSupplied: 10000 + (seed % 50000),
      totalBorrowed: 3000 + (seed % 15000),
      healthFactor: 1.5 + (seed % 100) / 100,
      positions: [
        {
          asset: 'USDC',
          supplied: 5000 + (seed % 10000),
          borrowed: 1000 + (seed % 3000),
          apy: 3.2 + (seed % 200) / 100
        },
        {
          asset: 'ETH',
          supplied: 3 + (seed % 10),
          borrowed: 1 + (seed % 3),
          apy: 2.8 + (seed % 150) / 100
        }
      ]
    };
  }

  private getMockVenusData(address: string): LendingData {
    const seed = this.addressToSeed(address);
    
    return {
      protocol: 'Venus Protocol',
      chain: 'BSC',
      totalSupplied: 5000 + (seed % 25000),
      totalBorrowed: 1500 + (seed % 8000),
      healthFactor: 1.8 + (seed % 120) / 100,
      positions: [
        {
          asset: 'BNB',
          supplied: 20 + (seed % 50),
          borrowed: 5 + (seed % 15),
          apy: 4.1 + (seed % 180) / 100
        },
        {
          asset: 'BUSD',
          supplied: 2000 + (seed % 8000),
          borrowed: 500 + (seed % 2000),
          apy: 3.8 + (seed % 160) / 100
        }
      ]
    };
  }

  private addressToSeed(address: string): number {
    return parseInt(address.slice(-6), 16);
  }
}