"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlchemyService = void 0;
const axios_1 = __importDefault(require("axios"));
const ethers_1 = require("ethers");
class AlchemyService {
    constructor() {
        this.apiKey = process.env.ALCHEMY_API_KEY || '';
        // Enhanced logging for debugging
        console.log('🔑 Alchemy API Key loaded:', !!this.apiKey);
        if (this.apiKey) {
            console.log('🔑 API Key preview:', this.apiKey.slice(0, 8) + '...');
        }
        // Default to testnet for hackathon
        this.networkConfig = this.getNetworkConfig(false);
        this.initializeConnections();
        if (!this.apiKey) {
            console.warn('⚠️  ALCHEMY_API_KEY not found. Using mock data for demonstration.');
        }
        else {
            console.log('✅ AlchemyService initialized with real API key');
        }
    }
    getNetworkConfig(isMainnet) {
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
        }
        else {
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
    initializeConnections() {
        if (this.networkConfig.isMainnet) {
            this.baseUrls = {
                ethereum: `https://eth-mainnet.g.alchemy.com/v2/${this.apiKey}`,
                polygon: `https://polygon-mainnet.g.alchemy.com/v2/${this.apiKey}`
            };
            this.providers = {
                ethereum: new ethers_1.ethers.JsonRpcProvider(this.baseUrls.ethereum),
                polygon: new ethers_1.ethers.JsonRpcProvider(this.baseUrls.polygon)
            };
        }
        else {
            this.baseUrls = {
                sepolia: `https://eth-sepolia.g.alchemy.com/v2/${this.apiKey}`,
                amoy: `https://polygon-amoy.g.alchemy.com/v2/${this.apiKey}`
            };
            this.providers = {
                sepolia: new ethers_1.ethers.JsonRpcProvider(this.baseUrls.sepolia),
                amoy: new ethers_1.ethers.JsonRpcProvider(this.baseUrls.amoy)
            };
        }
    }
    // Method to update network configuration (fixes the missing updateNetworkConfig error)
    updateNetworkConfig(networkConfig) {
        this.networkConfig = networkConfig;
        this.initializeConnections();
        console.log(`🔄 Network configuration updated to ${networkConfig.isMainnet ? 'Mainnet' : 'Testnet'}`);
    }
    // Switch network method
    switchNetwork(isMainnet) {
        this.networkConfig = this.getNetworkConfig(isMainnet);
        this.initializeConnections();
        console.log(`🔄 Switched to ${isMainnet ? 'Mainnet' : 'Testnet'}`);
    }
    // Ethereum balance methods (fixes missing getEthereumBalance error)
    async getEthereumBalance(address) {
        if (this.networkConfig.isMainnet) {
            return this.getMainnetBalance(address);
        }
        else {
            return this.getSepoliaBalance(address);
        }
    }
    async getMainnetBalance(address) {
        try {
            if (!this.apiKey) {
                console.log('⚠️ No ALCHEMY_API_KEY found, using mock Mainnet data');
                return this.getMockEthBalance(address);
            }
            console.log(`🔍 Fetching REAL Ethereum Mainnet balance for ${address}`);
            const balance = await this.providers.ethereum.getBalance(address);
            const balanceInEth = parseFloat(ethers_1.ethers.formatEther(balance));
            console.log(`💰 REAL Ethereum Mainnet balance: ${balanceInEth} ETH`);
            return balanceInEth;
        }
        catch (error) {
            console.error('❌ Error fetching Ethereum Mainnet balance:', error);
            console.log('⚠️ Falling back to MOCK Mainnet data');
            return this.getMockEthBalance(address);
        }
    }
    async getSepoliaBalance(address) {
        try {
            if (!this.apiKey) {
                console.log('⚠️ No ALCHEMY_API_KEY found, using mock Sepolia data');
                return this.getMockEthBalance(address);
            }
            console.log(`🔍 Fetching REAL Sepolia balance for ${address}`);
            const balance = await this.providers.sepolia.getBalance(address);
            const balanceInEth = parseFloat(ethers_1.ethers.formatEther(balance));
            console.log(`💰 REAL Sepolia balance: ${balanceInEth} ETH`);
            return balanceInEth;
        }
        catch (error) {
            console.error('❌ Error fetching Sepolia balance:', error);
            console.log('⚠️ Falling back to MOCK Sepolia data');
            return this.getMockEthBalance(address);
        }
    }
    // Polygon balance methods (fixes missing getPolygonBalance error)
    async getPolygonBalance(address) {
        if (this.networkConfig.isMainnet) {
            return this.getPolygonMainnetBalance(address);
        }
        else {
            return this.getAmoyBalance(address);
        }
    }
    async getPolygonMainnetBalance(address) {
        try {
            if (!this.apiKey) {
                console.log('⚠️ No ALCHEMY_API_KEY found, using mock Polygon Mainnet data');
                return this.getMockMaticBalance(address);
            }
            console.log(`🔍 Fetching REAL Polygon Mainnet balance for ${address}`);
            const balance = await this.providers.polygon.getBalance(address);
            const balanceInMatic = parseFloat(ethers_1.ethers.formatEther(balance));
            console.log(`💰 REAL Polygon Mainnet balance: ${balanceInMatic} MATIC`);
            return balanceInMatic;
        }
        catch (error) {
            console.error('❌ Error fetching Polygon Mainnet balance:', error);
            console.log('⚠️ Falling back to MOCK Polygon Mainnet data');
            return this.getMockMaticBalance(address);
        }
    }
    async getAmoyBalance(address) {
        try {
            if (!this.apiKey) {
                console.log('⚠️ No ALCHEMY_API_KEY found, using mock Amoy data');
                return this.getMockMaticBalance(address);
            }
            console.log(`🔍 Fetching REAL Amoy balance for ${address}`);
            const balance = await this.providers.amoy.getBalance(address);
            const balanceInMatic = parseFloat(ethers_1.ethers.formatEther(balance));
            console.log(`💰 REAL Amoy balance: ${balanceInMatic} MATIC`);
            return balanceInMatic;
        }
        catch (error) {
            console.error('❌ Error fetching Amoy balance:', error);
            console.log('⚠️ Falling back to MOCK Amoy data');
            return this.getMockMaticBalance(address);
        }
    }
    // First transaction method (fixes missing getFirstTransaction error)
    async getFirstTransaction(address) {
        try {
            if (!this.apiKey) {
                console.log('⚠️ No API key, cannot fetch first transaction');
                return null;
            }
            const providerKey = this.networkConfig.isMainnet ? 'ethereum' : 'sepolia';
            const provider = this.providers[providerKey];
            // Get transaction history (this is a simplified approach)
            // In a real implementation, you'd use alchemy_getAssetTransfers with pagination
            console.log(`🔍 Attempting to fetch first transaction for ${address}`);
            // For now, return null to trigger fallback wallet age calculation
            // TODO: Implement proper first transaction fetching using Alchemy's APIs
            return null;
        }
        catch (error) {
            console.error('❌ Error fetching first transaction:', error);
            return null;
        }
    }
    async getTokenBalances(address, chainId) {
        try {
            if (!this.apiKey) {
                console.log(`⚠️ No API key, using mock token balances for chain ${chainId}`);
                return this.getMockTokenBalances(address, chainId);
            }
            console.log(`🔍 Fetching REAL token balances for ${address} on chain ${chainId}`);
            let baseUrl;
            if (chainId === 1) {
                baseUrl = this.baseUrls.ethereum;
            }
            else if (chainId === 137) {
                baseUrl = this.baseUrls.polygon;
            }
            else if (chainId === 11155111) {
                baseUrl = this.baseUrls.sepolia;
            }
            else if (chainId === 80002) {
                baseUrl = this.baseUrls.amoy;
            }
            else {
                console.warn(`⚠️ Unsupported chain ID: ${chainId}`);
                return this.getMockTokenBalances(address, chainId);
            }
            const response = await axios_1.default.post(baseUrl, {
                jsonrpc: '2.0',
                id: 1,
                method: 'alchemy_getTokenBalances',
                params: [address]
            });
            const tokenBalances = response.data.result?.tokenBalances || [];
            console.log(`💰 Found ${tokenBalances.length} REAL token balances`);
            return tokenBalances;
        }
        catch (error) {
            console.error('❌ Error fetching token balances:', error);
            console.log('⚠️ Falling back to MOCK token balances');
            return this.getMockTokenBalances(address, chainId);
        }
    }
    // Updated for Aave V3 on Sepolia
    async getAaveLendingData(address) {
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
        }
        catch (error) {
            console.error('❌ Error fetching Aave data:', error);
            console.log('⚠️ Falling back to MOCK Aave data');
            return this.getMockAaveData(address);
        }
    }
    // Updated for Aave V3 on Amoy (Polygon testnet)
    async getAmoyLendingData(address) {
        try {
            if (!this.apiKey) {
                console.log('⚠️ No API key, using MOCK Aave Amoy data');
                return this.getMockAmoyData(address);
            }
            // NOTE: This still uses mock data because Aave contract integration isn't implemented yet
            // In a real implementation, you would call Aave V3 contracts on Amoy
            console.log('⚠️ Aave Amoy contract integration not implemented yet, using MOCK data');
            return this.getMockAmoyData(address);
        }
        catch (error) {
            console.error('❌ Error fetching Amoy lending data:', error);
            console.log('⚠️ Falling back to MOCK Amoy lending data');
            return this.getMockAmoyData(address);
        }
    }
    // Get current network info
    getCurrentNetwork() {
        return this.networkConfig;
    }
    // Mock data methods for reliable demo - updated for testnets
    getMockEthBalance(address) {
        const seed = this.addressToSeed(address);
        const mockBalance = this.networkConfig.isMainnet
            ? 0.5 + (seed % 10) // 0.5 to 10.5 ETH for mainnet
            : 0.1 + (seed % 2); // 0.1 to 2.1 ETH for testnet
        console.log(`📊 Generated MOCK ${this.networkConfig.ethereum.name} balance: ${mockBalance} ETH`);
        return mockBalance;
    }
    getMockMaticBalance(address) {
        const seed = this.addressToSeed(address);
        const mockBalance = this.networkConfig.isMainnet
            ? 10 + (seed % 100) // 10 to 110 MATIC for mainnet
            : 1 + (seed % 10); // 1 to 11 MATIC for testnet
        console.log(`📊 Generated MOCK ${this.networkConfig.polygon.name} balance: ${mockBalance} MATIC`);
        return mockBalance;
    }
    getMockTokenBalances(address, chainId) {
        const seed = this.addressToSeed(address);
        let tokens;
        if (chainId === 1) { // Ethereum Mainnet
            tokens = [
                { contractAddress: '0xA0b86a33E6C48a53C2a9Cbb0B8B0c1C5e5b5b5b5', tokenBalance: '0x' + (1000 + seed % 10000).toString(16), symbol: 'USDC' },
                { contractAddress: '0xdAC17F958D2ee523a2206206994597C13D831ec7', tokenBalance: '0x' + (500 + seed % 5000).toString(16), symbol: 'USDT' },
                { contractAddress: '0x6B175474E89094C44Da98b954EedeAC495271d0F', tokenBalance: '0x' + (300 + seed % 3000).toString(16), symbol: 'DAI' }
            ];
        }
        else if (chainId === 137) { // Polygon Mainnet
            tokens = [
                { contractAddress: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', tokenBalance: '0x' + (2000 + seed % 20000).toString(16), symbol: 'USDC' },
                { contractAddress: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', tokenBalance: '0x' + (1000 + seed % 10000).toString(16), symbol: 'USDT' }
            ];
        }
        else if (chainId === 11155111) { // Sepolia
            tokens = [
                { contractAddress: '0x94a9D9AC8a22534E3FaCa9F4e7F2E2cf85d5E4C8', tokenBalance: '0x' + (100 + seed % 1000).toString(16), symbol: 'USDC' },
                { contractAddress: '0xFF34B3d4Aee8ddCd6F9AFFFB6Fe49bD371b8a357', tokenBalance: '0x' + (50 + seed % 500).toString(16), symbol: 'DAI' }
            ];
        }
        else if (chainId === 80002) { // Amoy
            tokens = [
                { contractAddress: '0x41E94Eb019C0762f9Bfcf9Fb1E58725BfB0e7582', tokenBalance: '0x' + (200 + seed % 2000).toString(16), symbol: 'USDC' }
            ];
        }
        else {
            tokens = [];
        }
        console.log(`📊 Generated ${tokens.length} MOCK token balances for chain ${chainId}`);
        return tokens;
    }
    getMockAaveData(address) {
        const seed = this.addressToSeed(address);
        const mockData = {
            protocol: 'Aave V3',
            chain: this.networkConfig.ethereum.name,
            totalSupplied: this.networkConfig.isMainnet ? 5000 + (seed % 50000) : 1000 + (seed % 5000),
            totalBorrowed: this.networkConfig.isMainnet ? 1500 + (seed % 15000) : 300 + (seed % 1500),
            healthFactor: 1.5 + (seed % 100) / 100,
            positions: [
                {
                    asset: 'USDC',
                    supplied: this.networkConfig.isMainnet ? 2500 + (seed % 10000) : 500 + (seed % 1000),
                    borrowed: this.networkConfig.isMainnet ? 500 + (seed % 3000) : 100 + (seed % 300),
                    apy: 3.2 + (seed % 200) / 100
                },
                {
                    asset: 'ETH',
                    supplied: this.networkConfig.isMainnet ? 1.5 + (seed % 5) : 0.3 + (seed % 1),
                    borrowed: this.networkConfig.isMainnet ? 0.5 + (seed % 1.5) : 0.1 + (seed % 0.3),
                    apy: 2.8 + (seed % 150) / 100
                }
            ]
        };
        console.log(`📊 Generated MOCK Aave ${this.networkConfig.ethereum.name} data: TVL $${mockData.totalSupplied}`);
        return mockData;
    }
    getMockAmoyData(address) {
        const seed = this.addressToSeed(address);
        const mockData = {
            protocol: 'Aave V3',
            chain: this.networkConfig.polygon.name,
            totalSupplied: this.networkConfig.isMainnet ? 2500 + (seed % 25000) : 500 + (seed % 2500),
            totalBorrowed: this.networkConfig.isMainnet ? 750 + (seed % 8000) : 150 + (seed % 800),
            healthFactor: 1.8 + (seed % 120) / 100,
            positions: [
                {
                    asset: 'MATIC',
                    supplied: this.networkConfig.isMainnet ? 100 + (seed % 500) : 20 + (seed % 50),
                    borrowed: this.networkConfig.isMainnet ? 25 + (seed % 150) : 5 + (seed % 15),
                    apy: 4.1 + (seed % 180) / 100
                },
                {
                    asset: 'USDC',
                    supplied: this.networkConfig.isMainnet ? 1000 + (seed % 8000) : 200 + (seed % 800),
                    borrowed: this.networkConfig.isMainnet ? 250 + (seed % 2000) : 50 + (seed % 200),
                    apy: 3.8 + (seed % 160) / 100
                }
            ]
        };
        console.log(`📊 Generated MOCK Aave ${this.networkConfig.polygon.name} data: TVL $${mockData.totalSupplied}`);
        return mockData;
    }
    addressToSeed(address) {
        return parseInt(address.slice(-6), 16);
    }
    // Helper method to get supported chains
    static getSupportedChains() {
        return [
            {
                name: 'Ethereum Mainnet',
                chainId: 1,
                protocols: ['Aave V3', 'Compound V3', 'Uniswap V3'],
                explorer: 'https://etherscan.io'
            },
            {
                name: 'Polygon Mainnet',
                chainId: 137,
                protocols: ['Aave V3', 'Uniswap V3'],
                explorer: 'https://polygonscan.com'
            },
            {
                name: 'Sepolia Testnet',
                chainId: 11155111,
                protocols: ['Aave V3'],
                faucet: 'https://sepoliafaucet.com/',
                explorer: 'https://sepolia.etherscan.io'
            },
            {
                name: 'Polygon Amoy Testnet',
                chainId: 80002,
                protocols: ['Aave V3'],
                faucet: 'https://faucet.polygon.technology/',
                explorer: 'https://amoy.polygonscan.com'
            }
        ];
    }
}
exports.AlchemyService = AlchemyService;
