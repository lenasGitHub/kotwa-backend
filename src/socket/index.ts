import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { createAdapter } from '@socket.io/redis-adapter';
import { redisPub, redisSub } from '../config/redis';
import { MessageQueueService } from '../services/messageQueue.service';

let io: Server;

// ============================================
// RATE LIMITING STATE (per-socket)
// ============================================

interface RateLimitState {
    count: number;
    resetAt: number;
}

const socketRateLimits = new Map<string, RateLimitState>();
const RATE_LIMIT_WINDOW_MS = 1000; // 1 second
const RATE_LIMIT_MAX_EVENTS = 10; // max 10 events per second

/**
 * Check if socket is rate limited
 */
const isRateLimited = (socketId: string): boolean => {
    const now = Date.now();
    const state = socketRateLimits.get(socketId);

    if (!state || now > state.resetAt) {
        socketRateLimits.set(socketId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
        return false;
    }

    state.count++;
    if (state.count > RATE_LIMIT_MAX_EVENTS) {
        return true;
    }

    return false;
};

// ============================================
// SOCKET INITIALIZATION
// ============================================

export const initializeSocket = (httpServer: HttpServer, useRedis: boolean = false) => {
    io = new Server(httpServer, {
        cors: {
            origin: config.cors.origin,
            methods: ['GET', 'POST'],
        },
        // Heartbeat/Ping configuration for faster disconnect detection
        pingInterval: 10000, // Send ping every 10 seconds
        pingTimeout: 5000,   // Disconnect if no pong within 5 seconds
        // Connection settings
        connectTimeout: 10000,
        // Upgrade settings
        transports: ['websocket', 'polling'],
    });

    // Use Redis adapter for horizontal scaling if Redis is available
    if (useRedis) {
        io.adapter(createAdapter(redisPub, redisSub));
        console.log('📡 Socket.IO using Redis adapter');
    }

    // Authentication middleware for socket connections
    io.use((socket, next) => {
        const token = socket.handshake.auth.token;
        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };
            socket.data.userId = decoded.userId;
            next();
        } catch (err) {
            next(new Error('Invalid token'));
        }
    });

    io.on('connection', async (socket: Socket) => {
        const userId = socket.data.userId;
        console.log(`🔌 User connected: ${userId}`);

        // Join user-specific room
        socket.join(`user:${userId}`);

        // Deliver queued messages (from when user was offline)
        await deliverQueuedMessages(socket, userId);

        // ============================================
        // EVENT HANDLERS WITH RATE LIMITING
        // ============================================

        // Join challenge room
        socket.on('challenge:subscribe', (challengeId: string) => {
            if (isRateLimited(socket.id)) {
                socket.emit('error', { message: 'Rate limited. Slow down.' });
                return;
            }
            socket.join(`challenge:${challengeId}`);
            console.log(`User ${userId} subscribed to challenge ${challengeId}`);
        });

        socket.on('challenge:unsubscribe', (challengeId: string) => {
            if (isRateLimited(socket.id)) return;
            socket.leave(`challenge:${challengeId}`);
        });

        // Join team room
        socket.on('team:subscribe', (teamId: string) => {
            if (isRateLimited(socket.id)) {
                socket.emit('error', { message: 'Rate limited. Slow down.' });
                return;
            }
            socket.join(`team:${teamId}`);
        });

        socket.on('team:unsubscribe', (teamId: string) => {
            if (isRateLimited(socket.id)) return;
            socket.leave(`team:${teamId}`);
        });

        // Ping handler (manual ping from client)
        socket.on('ping', () => {
            socket.emit('pong', { timestamp: Date.now() });
        });

        // Cleanup on disconnect
        socket.on('disconnect', (reason) => {
            console.log(`🔌 User disconnected: ${userId} (${reason})`);
            socketRateLimits.delete(socket.id);
        });
    });

    return io;
};

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Deliver queued messages to a reconnecting user
 */
async function deliverQueuedMessages(socket: Socket, userId: string): Promise<void> {
    try {
        const messages = await MessageQueueService.getPendingMessages(userId);

        if (messages.length > 0) {
            console.log(`📬 Delivering ${messages.length} queued messages to ${userId}`);

            for (const message of messages) {
                socket.emit(message.event, message.data);
            }

            // Clear delivered messages
            await MessageQueueService.clearMessages(userId);
        }
    } catch (error) {
        console.error('Failed to deliver queued messages:', error);
    }
}

export const getIO = (): Server => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

// ============================================
// EMIT HELPERS (with offline queuing)
// ============================================

/**
 * Emit to user, queue if offline
 */
export const emitToUser = async (
    userId: string,
    event: string,
    data: any,
    queueIfOffline: boolean = true
): Promise<boolean> => {
    const room = `user:${userId}`;
    const sockets = await io?.in(room).fetchSockets();

    if (sockets && sockets.length > 0) {
        io?.to(room).emit(event, data);
        return true;
    } else if (queueIfOffline) {
        // User is offline, queue the message
        await MessageQueueService.queueMessage(userId, event, data);
        return false;
    }
    return false;
};

export const emitChallengeProgress = (
    challengeId: string,
    data: { userId: string; value: number; totalValue: number }
) => {
    io?.to(`challenge:${challengeId}`).emit('challenge:progress', data);
};

export const emitChallengeMilestone = (
    challengeId: string,
    data: { milestone: string; teamProgress: number }
) => {
    io?.to(`challenge:${challengeId}`).emit('challenge:milestone', data);
};

export const emitUserLevelUp = async (userId: string, newLevel: number) => {
    await emitToUser(userId, 'user:levelup', { newLevel }, true);
};
