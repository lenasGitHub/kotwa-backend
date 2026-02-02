import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';
import { redis, isRedisConnected } from '../config/redis';
import { config } from '../config/env';

/**
 * Create rate limiter with Redis store (if available) or fallback to in-memory
 */
const createRateLimiter = (options?: {
    windowMs?: number;
    max?: number;
    message?: string;
}) => {
    const windowMs = options?.windowMs || config.rateLimit.windowMs;
    const max = options?.max || config.rateLimit.max;
    const message = options?.message || 'Too many requests, please try again later';

    // Base configuration
    const baseConfig = {
        windowMs,
        max,
        message: { success: false, error: message },
        standardHeaders: true,
        legacyHeaders: false,
    };

    // If Redis is connected, use Redis store
    if (isRedisConnected()) {
        return rateLimit({
            ...baseConfig,
            store: new RedisStore({
                // @ts-expect-error - RedisStore types are not fully compatible
                sendCommand: (...args: string[]) => redis.call(...args),
            }),
        });
    }

    // Fallback to in-memory store
    console.warn('⚠️ Rate limiter using in-memory store (Redis not available)');
    return rateLimit(baseConfig);
};

// ============================================
// PRE-CONFIGURED RATE LIMITERS
// ============================================

/**
 * General API rate limiter
 * 100 requests per minute (default)
 */
export const apiLimiter = createRateLimiter();

/**
 * Strict rate limiter for auth endpoints
 * 5 attempts per 15 minutes
 */
export const authLimiter = createRateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many login attempts, please try again after 15 minutes',
});

/**
 * Moderate rate limiter for creating resources
 * 20 requests per minute
 */
export const createLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    message: 'Too many requests, please slow down',
});

/**
 * Progress logging rate limiter
 * 60 logs per minute (once per second)
 */
export const progressLimiter = createRateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 60,
    message: 'Too many progress updates, please slow down',
});
