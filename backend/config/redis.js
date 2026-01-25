
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const redisUrl = process.env.REDIS_URI || 'redis://localhost:6379';

const redis = new Redis(redisUrl, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    // Don't crash the app if Redis fails
    reconnectOnError: (err) => {
        const targetError = 'READONLY';
        if (err.message.includes(targetError)) {
            // Only reconnect when the error starts with "READONLY"
            return true;
        }
    }
});

redis.on('connect', () => {
    console.log('✅ Redis bağlantısı başarılı');
});

redis.on('error', (err) => {
    // Suppress heavy connection error logs in dev without redis
    if (process.env.NODE_ENV === 'development' && err.code === 'ECONNREFUSED') {
        // console.warn('⚠️ Redis bağlantısı başarısız (Yerel Cache kullanılacak)');
    } else {
        console.error('❌ Redis Hatası:', err.message);
    }
});

export default redis;
