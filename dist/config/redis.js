"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isRedisConnected = exports.connectRedis = exports.redisSub = exports.redisPub = exports.redis = void 0;
const ioredis_1 = __importDefault(require("ioredis"));
const env_1 = require("./env");
// Create Redis client for general use
exports.redis = new ioredis_1.default(env_1.config.redis.url, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
        const delay = Math.min(times * 50, 2000);
        return delay;
    },
    lazyConnect: true,
});
// Redis client for pub/sub (Socket.IO adapter)
exports.redisPub = exports.redis.duplicate();
exports.redisSub = exports.redis.duplicate();
// Event handlers
exports.redis.on('connect', () => {
    console.log('📦 Redis connected');
});
exports.redis.on('error', err => {
    // Only log errors if not in development or if specifically debugging
    if (process.env.NODE_ENV !== 'production') {
        // Suppress connection refused errors in dev as we have fallback
        if (err.code === 'ECONNREFUSED')
            return;
    }
    console.error('📦 Redis error:', err.message);
});
// Helper function to check Redis connection
const connectRedis = async () => {
    try {
        await exports.redis.connect();
        await exports.redis.ping();
        console.log('📦 Redis connection verified');
        return true;
    }
    catch (error) {
        console.warn('📦 Redis not available, falling back to in-memory stores');
        return false;
    }
};
exports.connectRedis = connectRedis;
// Helper to check if Redis is connected
const isRedisConnected = () => {
    return exports.redis.status === 'ready';
};
exports.isRedisConnected = isRedisConnected;
//# sourceMappingURL=redis.js.map