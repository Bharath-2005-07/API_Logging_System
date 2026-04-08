/**
 * Logging Service
 * Handles log generation, hashing, and signing
 */

const crypto = require('crypto');
const fs = require('fs').promises;
const path = require('path');

class LoggingService {
  /**
   * Generate log hash (SHA-256)
   */
  static generateLogHash(logData) {
    const logString = JSON.stringify(logData);
    return crypto.createHash('sha256').update(logString).digest('hex');
  }

  /**
   * Create digital signature
   */
  static createSignature(logHash, privateKey) {
    const sign = crypto.createSign('RSA-SHA256');
    sign.update(logHash);
    return sign.sign(privateKey, 'hex');
  }

  /**
   * Verify signature
   */
  static verifySignature(logHash, signature, publicKey) {
    try {
      const verify = crypto.createVerify('RSA-SHA256');
      verify.update(logHash);
      return verify.verify(publicKey, signature, 'hex');
    } catch (error) {
      console.error('Signature verification failed:', error);
      return false;
    }
  }

  /**
   * Create API log object
   */
  static createLog(req, res, responseTime) {
    return {
      timestamp: new Date().toISOString(),
      method: req.method,
      endpoint: req.originalUrl,
      statusCode: res.statusCode,
      requestSize: JSON.stringify(req.body).length,
      responseSize: res.getHeader('content-length') || 0,
      responseTime,
      userAgent: req.get('user-agent'),
      ipAddress: req.ip,
      userId: req.user?.userId || 'anonymous',
    };
  }

  /**
   * Load key files
   */
  static async loadKeys() {
    try {
      const privateKeyPath = process.env.PRIVATE_KEY_PATH || './keys/private.key';
      const publicKeyPath = process.env.PUBLIC_KEY_PATH || './keys/public.key';

      const privateKey = await fs.readFile(privateKeyPath, 'utf8');
      const publicKey = await fs.readFile(publicKeyPath, 'utf8');

      return { privateKey, publicKey };
    } catch (error) {
      console.error('Failed to load keys:', error);
      throw new Error('Signing keys not available');
    }
  }

  /**
   * Generate RSA key pair (for initial setup)
   */
  static generateKeyPair() {
    const { generateKeyPairSync } = require('crypto');
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem',
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem',
      },
    });
    return { publicKey, privateKey };
  }
}

module.exports = LoggingService;
