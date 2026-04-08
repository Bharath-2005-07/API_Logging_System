/**
 * Blockchain Configuration
 */

module.exports = {
  // Network Configuration
  network: process.env.NETWORK || 'sepolia',
  
  // Ethereum RPC
  rpc: {
    sepolia: process.env.ETHEREUM_RPC_URL || 'https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY',
    mainnet: process.env.ETHEREUM_MAINNET_RPC_URL || 'https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY',
  },

  // Chain IDs
  chainId: {
    sepolia: 11155111,
    mainnet: 1,
  },

  // Smart Contract
  contract: {
    address: process.env.CONTRACT_ADDRESS || '0x0000000000000000000000000000000000000000',
    abi: require('../backend/src/utils/APILoggerABI.json'),
  },

  // Gas Configuration
  gas: {
    price: process.env.GAS_PRICE || '20000000000', // 20 Gwei
    limit: process.env.GAS_LIMIT || '3000000',
  },

  // Wallet
  wallet: {
    privateKey: process.env.PRIVATE_KEY || '',
    address: process.env.WALLET_ADDRESS || '',
  },

  // Timeouts
  timeout: 30000,
};
