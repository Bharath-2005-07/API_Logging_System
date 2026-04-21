/**
 * Blockchain Service
 * Handles smart contract interaction
 */

const { ethers } = require('ethers');
const APILoggerABI = require('../utils/APILoggerABI.json');

class BlockchainService {
  constructor() {
    try {
      this.provider = process.env.ETHEREUM_RPC_URL 
        ? new ethers.JsonRpcProvider(process.env.ETHEREUM_RPC_URL)
        : null;

      const rawPrivateKey = (process.env.PRIVATE_KEY || '').trim();
      const normalizedPrivateKey = rawPrivateKey.startsWith('0x') ? rawPrivateKey : `0x${rawPrivateKey}`;
      const isValidPrivateKey = /^0x[a-fA-F0-9]{64}$/.test(normalizedPrivateKey);

      // Initialize wallet only if a valid private key is provided.
      if (isValidPrivateKey) {
        this.signer = this.provider 
          ? new ethers.Wallet(normalizedPrivateKey, this.provider)
          : null;
      } else {
        this.signer = null;
        console.warn('⚠️  BlockchainService: No valid private key configured. Blockchain features disabled.');
      }
      
      this.contractAddress = process.env.CONTRACT_ADDRESS || '';
      
      if (this.signer && this.contractAddress !== '0x0000000000000000000000000000000000000000') {
        this.contract = new ethers.Contract(
          this.contractAddress,
          APILoggerABI,
          this.signer
        );
        this.registrationChecked = false;
      } else {
        this.contract = null;
        this.registrationChecked = false;
      }
    } catch (error) {
      console.warn('⚠️  BlockchainService initialization error:', error.message);
      this.provider = null;
      this.signer = null;
      this.contract = null;
    }
  }

  /**
   * Convert app-level IPFS CID/string to on-chain bytes32 key.
   * If already bytes32 hex, keep it as-is.
   */
  toOnChainIpfsKey(ipfsHash) {
    if (typeof ipfsHash === 'string' && /^0x[a-fA-F0-9]{64}$/.test(ipfsHash)) {
      return ipfsHash;
    }
    return ethers.keccak256(ethers.toUtf8Bytes(String(ipfsHash)));
  }

  /**
   * Ensure contract signer wallet is registered once.
   */
  async ensureSignerRegistered() {
    if (!this.contract || !this.signer || this.registrationChecked) {
      return;
    }

    try {
      const exists = await this.contract.userExists(this.signer.address);
      if (!exists) {
        const serviceUserId = process.env.BLOCKCHAIN_SERVICE_USER_ID || 'backend_service';
        const tx = await this.contract.registerUser(serviceUserId);
        await tx.wait();
        console.log(`[Blockchain] Service wallet registered as user: ${serviceUserId}`);
      }
      this.registrationChecked = true;
    } catch (error) {
      console.warn('[Blockchain] Could not ensure signer registration:', error.message);
    }
  }

  /**
   * Store log on blockchain
   */
  async storeLog(ipfsHash, signature, userId, endpoint, statusCode, requestSize, responseSize) {
    try {
      if (!this.contract) {
        console.warn('[Blockchain] Contract not initialized. Skipping blockchain storage.');
        return null;
      }

      await this.ensureSignerRegistered();
      const onChainIpfsKey = this.toOnChainIpfsKey(ipfsHash);
      
      const tx = await this.contract.storeLog(
        onChainIpfsKey,
        signature,
        userId,
        endpoint,
        statusCode,
        requestSize,
        responseSize
      );

      const receipt = await tx.wait();
      console.log('[Blockchain] Log stored:', receipt.hash);
      return receipt.hash;
    } catch (error) {
      console.error('[Blockchain] Error storing log:', error.message);
      // Continue without blockchain if optional
      return null;
    }
  }

  /**
   * Get log from blockchain
   */
  async getLog(ipfsHash) {
    try {
      if (!this.contract) {
        return null;
      }
      const onChainIpfsKey = this.toOnChainIpfsKey(ipfsHash);
      
      const log = await this.contract.getLog(onChainIpfsKey);
      return log;
    } catch (error) {
      console.error('[Blockchain] Error retrieving log:', error.message);
      return null;
    }
  }

  /**
   * Verify log on blockchain
   */
  async verifyLog(ipfsHash) {
    try {
      if (!this.contract) {
        return null;
      }
      const onChainIpfsKey = this.toOnChainIpfsKey(ipfsHash);
      
      const tx = await this.contract.verifyLog(onChainIpfsKey);
      const receipt = await tx.wait();
      console.log('[Blockchain] Log verified:', receipt.hash);
      return receipt.hash;
    } catch (error) {
      console.error('[Blockchain] Error verifying log:', error.message);
      return null;
    }
  }

  /**
   * Register user on blockchain
   */
  async registerUser(userId) {
    try {
      if (!this.contract) {
        return null;
      }
      
      const tx = await this.contract.registerUser(userId);
      const receipt = await tx.wait();
      console.log('[Blockchain] User registered:', receipt.hash);
      return receipt.hash;
    } catch (error) {
      console.error('[Blockchain] Error registering user:', error.message);
      return null;
    }
  }

  /**
   * Get user stats
   */
  async getUserStats(address) {
    try {
      if (!this.contract) {
        return null;
      }
      
      const stats = await this.contract.getUserStats(address);
      return {
        userId: stats[0],
        totalRequests: stats[1].toString(),
        totalCost: stats[2].toString(),
        isActive: stats[3],
      };
    } catch (error) {
      console.error('[Blockchain] Error retrieving user stats:', error.message);
      return null;
    }
  }

  /**
   * Get user logs
   */
  async getUserLogs(userId) {
    try {
      if (!this.contract) {
        return [];
      }
      
      const logs = await this.contract.getUserLogs(userId);
      return logs;
    } catch (error) {
      console.error('[Blockchain] Error retrieving user logs:', error.message);
      return [];
    }
  }

  /**
   * Get log count
   */
  async getLogCount() {
    try {
      if (!this.contract) {
        return '0';
      }
      
      const count = await this.contract.getLogCount();
      return count.toString();
    } catch (error) {
      console.error('[Blockchain] Error retrieving log count:', error.message);
      return '0';
    }
  }
}

module.exports = new BlockchainService();
