/**
 * IPFS Configuration
 */

module.exports = {
  // Connection Settings
  host: process.env.IPFS_HOST || 'ipfs.infura.io',
  port: parseInt(process.env.IPFS_PORT) || 5001,
  protocol: process.env.IPFS_PROTOCOL || 'https',

  // Infura Settings
  infura: {
    projectId: process.env.INFURA_IPFS_PROJECT_ID || '',
    projectSecret: process.env.INFURA_IPFS_PROJECT_SECRET || '',
  },

  // API Configuration
  api: {
    timeout: 30000,
    maxRetries: 3,
  },

  // Pinning Configuration
  pinning: {
    enabled: process.env.ENABLE_IPFS_PINNING !== 'false',
    service: 'infura', // 'infura' or 'pinata'
    retention: 90, // days
  },

  // File Settings
  files: {
    maxSize: 10 * 1024 * 1024, // 10MB
    defaultEncoding: 'utf-8',
  },
};
