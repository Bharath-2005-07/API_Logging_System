require("@nomicfoundation/hardhat-toolbox");
require("@nomicfoundation/hardhat-ethers");
require("hardhat-gas-reporter");
require("solidity-coverage");

const dotenv = require('dotenv');
dotenv.config({ path: '../.env' });

// Helper function to get valid private key
const getPrivateKey = () => {
  const rawPk = (process.env.PRIVATE_KEY || '').trim();
  const pk = rawPk.startsWith('0x') ? rawPk.slice(2) : rawPk;

  // Use only if it's a valid 64-character hex string (32 bytes).
  if (pk && pk.length === 64 && /^[0-9a-fA-F]{64}$/.test(pk)) {
    return pk;
  }
  return undefined;
};

const privateKey = getPrivateKey();
const accounts = privateKey ? [privateKey] : [];

module.exports = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    sepolia: {
      url: process.env.ETHEREUM_RPC_URL || "",
      accounts: accounts,
      chainId: 11155111,
    },
    mainnet: {
      url: process.env.ETHEREUM_MAINNET_RPC_URL || "",
      accounts: accounts,
      chainId: 1,
    },
    hardhat: {
      chainId: 1337,
    },
    localhost: {
      url: "http://127.0.0.1:8545",
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD",
    coinmarketcap: process.env.COINMARKETCAP_API_KEY,
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || "",
  },
  paths: {
    sources: "./src",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts",
  },
};
