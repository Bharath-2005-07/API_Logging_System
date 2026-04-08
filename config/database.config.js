/**
 * Database Configuration
 */

module.exports = {
  // MongoDB Connection
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/api-logging-db',
    username: process.env.MONGODB_USERNAME || '',
    password: process.env.MONGODB_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'api-logging-db',
  },

  // Connection Options
  options: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    maxPoolSize: 10,
    minPoolSize: 2,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  },

  // Collections
  collections: {
    users: 'users',
    logs: 'logs',
    billing: 'billing',
  },

  // Indexes
  indexes: {
    enabled: true,
    autoCreate: true,
  },

  // Caching
  caching: {
    enabled: process.env.ENABLE_MONGODB_CACHING !== 'false',
    ttl: 3600, // seconds
  },
};
