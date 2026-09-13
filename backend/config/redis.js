const Redis = require('ioredis');

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient = null;

try {
  redisClient = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    lazyConnect: true,
    retryStrategy(times) {
      if (times > 5) {
        console.warn('⚠️ [Redis] Reconnection attempts exceeded. Operating without cache.');
        return null;
      }
      return Math.min(times * 500, 2000);
    }
  });

  redisClient.on('connect', () => {
    console.log('✅ [Redis] Connected successfully');
  });

  redisClient.on('error', (err) => {
    console.warn('⚠️ [Redis] Connection warning:', err.message);
  });
} catch (error) {
  console.warn('⚠️ [Redis] Initialization skipped:', error.message);
}

module.exports = redisClient;
