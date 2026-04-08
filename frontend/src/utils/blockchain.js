/**
 * Blockchain Utility Functions
 */

import { ethers } from 'ethers';

const NETWORK = process.env.REACT_APP_NETWORK || 'sepolia';

export const getProvider = () => {
  return new ethers.BrowserProvider(window.ethereum);
};

export const getSigner = async () => {
  const provider = getProvider();
  return provider.getSigner();
};

export const connectWallet = async () => {
  try {
    if (!window.ethereum) {
      throw new Error('MetaMask not detected');
    }

    const accounts = await window.ethereum.request({
      method: 'eth_requestAccounts',
    });

    return accounts[0];
  } catch (error) {
    console.error('Wallet connection failed:', error);
    throw error;
  }
};

export const switchNetwork = async () => {
  try {
    const chainId = NETWORK === 'mainnet' ? '0x1' : '0xaa36a7'; // Sepolia

    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId }],
    });
  } catch (error) {
    if (error.code === 4902) {
      console.error('Network not added to MetaMask');
    }
    throw error;
  }
};

export const formatAddress = (address) => {
  return `${address.substring(0, 6)}...${address.substring(38)}`;
};

export const formatHash = (hash) => {
  return `${hash.substring(0, 10)}...${hash.substring(58)}`;
};
