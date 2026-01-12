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
};
