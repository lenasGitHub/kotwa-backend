import prisma from '../utils/prisma';
import { redis, isRedisConnected } from '../config/redis';

// ============================================
// TYPES
// ============================================

export interface QueuedMessage {
    id: string;
    userId: string;
    event: string;
    data: any;
    createdAt: Date;
    expiresAt: Date;
}

// ============================================
// MESSAGE QUEUE SERVICE
// ============================================

const QUEUE_PREFIX = 'msgqueue:';
const DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

export class MessageQueueService {
    /**
     * Queue a message for an offline user
     * Messages are stored in Redis and delivered when user reconnects
     */
    static async queueMessage(
        userId: string,
        event: string,
        data: any,
        ttlSeconds: number = DEFAULT_TTL_SECONDS
    ): Promise<string | null> {
        if (!isRedisConnected()) {
            console.warn('📬 Message queue unavailable: Redis not connected');
            return null;
        }

        const message: QueuedMessage = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            userId,
            event,
            data,
            createdAt: new Date(),
            expiresAt: new Date(Date.now() + ttlSeconds * 1000),
        };

        const key = `${QUEUE_PREFIX}${userId}`;

        try {
            await redis.rpush(key, JSON.stringify(message));
            await redis.expire(key, ttlSeconds);
            return message.id;
        } catch (error) {
            console.error('Failed to queue message:', error);
            return null;
        }
    }

    /**
     * Get all pending messages for a user
     */
    static async getPendingMessages(userId: string): Promise<QueuedMessage[]> {
        if (!isRedisConnected()) {
            return [];
        }

        const key = `${QUEUE_PREFIX}${userId}`;

        try {
            const messages = await redis.lrange(key, 0, -1);
            return messages
                .map((m) => JSON.parse(m))
                .filter((m) => new Date(m.expiresAt) > new Date());
        } catch (error) {
            console.error('Failed to get pending messages:', error);
            return [];
        }
    }

    /**
     * Clear all pending messages for a user (called after delivery)
     */
    static async clearMessages(userId: string): Promise<void> {
        if (!isRedisConnected()) {
            return;
        }

        const key = `${QUEUE_PREFIX}${userId}`;

        try {
            await redis.del(key);
        } catch (error) {
            console.error('Failed to clear messages:', error);
        }
    }

    /**
     * Remove a specific message by ID
     */
    static async removeMessage(userId: string, messageId: string): Promise<void> {
        if (!isRedisConnected()) {
            return;
        }

        const key = `${QUEUE_PREFIX}${userId}`;

        try {
            const messages = await redis.lrange(key, 0, -1);
            const filtered = messages.filter((m) => {
                const parsed = JSON.parse(m);
                return parsed.id !== messageId;
            });

            if (filtered.length !== messages.length) {
                await redis.del(key);
                if (filtered.length > 0) {
                    await redis.rpush(key, ...filtered);
                }
            }
        } catch (error) {
            console.error('Failed to remove message:', error);
        }
    }

    /**
     * Get queue statistics (for monitoring)
     */
    static async getStats(): Promise<{ totalQueued: number; usersWithMessages: number }> {
        if (!isRedisConnected()) {
            return { totalQueued: 0, usersWithMessages: 0 };
        }

        try {
            const keys = await redis.keys(`${QUEUE_PREFIX}*`);
            let totalQueued = 0;

            for (const key of keys) {
                const length = await redis.llen(key);
                totalQueued += length;
            }

            return {
                totalQueued,
                usersWithMessages: keys.length,
            };
        } catch (error) {
            console.error('Failed to get queue stats:', error);
            return { totalQueued: 0, usersWithMessages: 0 };
        }
    }
}
