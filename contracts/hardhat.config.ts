// contracts/hardhat.config.ts
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.7",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.19", 
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    // ZetaChain Athens Testnet - Primary RPC
    "zetachain-testnet": {
      url: `https://zetachain-testnet.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      chainId: 7001,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 40000000000, // 20 gwei
      timeout: 120000, // 2 minutes
    },
    
    // ZetaChain Athens Testnet - Alternative RPC (Official)
    "zetachain-testnet-alt": {
      url: "https://zetachain-athens-evm.blockpi.network/v1/rpc/public",
      chainId: 7001,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 40000000000, // 20 gwei
      timeout: 120000, // 2 minutes
    },
    
    // ZetaChain Athens Testnet - Another Alternative
    "zetachain-testnet-alt2": {
      url: "https://rpc.ankr.com/zetachain_evm_athens_testnet",
      chainId: 7001,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
      timeout: 120000, // 2 minutes
    },
    
    // Ethereum Sepolia Testnet (using your existing Alchemy key)
    sepolia: {
      url: `https://eth-sepolia.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      chainId: 11155111,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 20000000000, // 20 gwei
    },
    
    // Polygon Amoy Testnet (using your existing Alchemy key)  
    amoy: {
      url: `https://polygon-amoy.g.alchemy.com/v2/${process.env.ALCHEMY_API_KEY}`,
      chainId: 80002,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
      gasPrice: 30000000000, // 30 gwei
    },
    
    // For local testing
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "dummy-key",
      polygonAmoy: process.env.POLYGONSCAN_API_KEY || "dummy-key",
      zetachain_testnet: "not-needed",
    },
    customChains: [
      {
        network: "polygonAmoy",
        chainId: 80002,
        urls: {
          apiURL: "https://api-amoy.polygonscan.com/api",
          browserURL: "https://amoy.polygonscan.com"
        }
      },
      {
        network: "zetachain-testnet",
        chainId: 7001,
        urls: {
          apiURL: "https://athens3.explorer.zetachain.com/api",
          browserURL: "https://athens3.explorer.zetachain.com",
        },
      },
    ],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
  mocha: {
    timeout: 120000, // 2 minutes
  },
};

export default config;