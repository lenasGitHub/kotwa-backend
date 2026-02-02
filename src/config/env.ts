import dotenv from 'dotenv';
dotenv.config();

export const config = {
    nodeEnv: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT || '3000', 10),

    database: {
        url: process.env.DATABASE_URL || 'file:./dev.db',
    },

    jwt: {
        secret: process.env.JWT_SECRET || 'fallback-secret-change-me',
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    },

    cors: {
        origin: process.env.CORS_ORIGIN || '*',
    },

    redis: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
    },

    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10), // 1 minute
        max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10), // 100 requests per window
    },
};
