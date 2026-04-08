/**
 * IPFS Service
 * Handles file upload and retrieval from IPFS
 */

const axios = require('axios');
const FormData = require('form-data');

class IPFSService {
  constructor() {
    this.host = process.env.IPFS_HOST || 'ipfs.infura.io';
    this.port = process.env.IPFS_PORT || 5001;
    this.protocol = process.env.IPFS_PROTOCOL || 'https';
    this.auth = this.getAuthHeader();
  }

  /**
   * Get Infura IPFS auth header
   */
  getAuthHeader() {
    const projectId = process.env.INFURA_IPFS_PROJECT_ID;
    const projectSecret = process.env.INFURA_IPFS_PROJECT_SECRET;

    if (!projectId || !projectSecret) {
      console.warn('IPFS auth credentials not configured');
      return null;
    }

    return {
      'Authorization': 'Basic ' + Buffer.from(`${projectId}:${projectSecret}`).toString('base64'),
    };
  }

  /**
   * Get API URL
   */
  getApiUrl() {
    return `${this.protocol}://${this.host}:${this.port}/api/v0`;
  }

  /**
   * Upload file to IPFS
   */
  async uploadFile(fileContent, filename = 'log.json') {
    try {
      const form = new FormData();
      form.append('file', fileContent, filename);

      const headers = this.auth || {};
      const response = await axios.post(`${this.getApiUrl()}/add`, form, {
        headers: {
          ...headers,
          ...form.getHeaders(),
        },
      });

      const hash = response.data.Hash;
      console.log(`[IPFS] File uploaded: ${hash}`);
      return hash;
    } catch (error) {
      console.error('[IPFS] Upload failed:', error.message);
      throw new Error(`IPFS upload failed: ${error.message}`);
    }
  }

  /**
   * Retrieve file from IPFS
   */
  async retrieveFile(ipfsHash) {
    try {
      const headers = this.auth || {};
      const response = await axios.get(
        `${this.protocol}://${this.host}:${this.port}/ipfs/${ipfsHash}`,
        { headers }
      );

      console.log(`[IPFS] File retrieved: ${ipfsHash}`);
      return response.data;
    } catch (error) {
      console.error('[IPFS] Retrieval failed:', error.message);
      throw new Error(`IPFS retrieval failed: ${error.message}`);
    }
  }

  /**
   * Pin file to IPFS (ensure persistence)
   */
  async pinFile(ipfsHash) {
    try {
      const headers = this.auth || {};
      await axios.post(
        `${this.getApiUrl()}/pin/add?arg=${ipfsHash}`,
        {},
        { headers }
      );

      console.log(`[IPFS] File pinned: ${ipfsHash}`);
      return true;
    } catch (error) {
      console.error('[IPFS] Pin failed:', error.message);
      return false;
    }
  }

  /**
   * Check if file exists on IPFS
   */
  async fileExists(ipfsHash) {
    try {
      const headers = this.auth || {};
      const response = await axios.get(
        `${this.getApiUrl()}/dag/get?arg=${ipfsHash}`,
        { headers }
      );
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }

  /**
   * Get file stats from IPFS
   */
  async getFileStats(ipfsHash) {
    try {
      const headers = this.auth || {};
      const response = await axios.get(
        `${this.getApiUrl()}/files/stat?arg=/ipfs/${ipfsHash}`,
        { headers }
      );
      return response.data;
    } catch (error) {
      console.error('[IPFS] Stats retrieval failed:', error.message);
      throw error;
    }
  }
}

module.exports = new IPFSService();
