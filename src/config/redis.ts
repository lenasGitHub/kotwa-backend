import Redis from 'ioredis';
import { config } from './env';

// Create Redis client for general use
export const redis = new Redis(config.redis.url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    lazyConnect: true,
});

// Redis client for pub/sub (Socket.IO adapter)
export const redisPub = redis.duplicate();
export const redisSub = redis.duplicate();

// Event handlers
redis.on('connect', () => {
    console.log('📦 Redis connected');
});

redis.on('error', (err) => {
    console.error('📦 Redis error:', err.message);
});

// Helper function to check Redis connection
export const connectRedis = async (): Promise<boolean> => {
    try {
        await redis.connect();
        await redis.ping();
        console.log('📦 Redis connection verified');
        return true;
    } catch (error) {
        console.warn('📦 Redis not available, falling back to in-memory stores');
        return false;
    }
};

// Helper to check if Redis is connected
export const isRedisConnected = (): boolean => {
    return redis.status === 'ready';
};
