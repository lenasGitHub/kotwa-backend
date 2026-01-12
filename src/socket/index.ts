import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';

let io: Server;

export const initializeSocket = (httpServer: HttpServer) => {
    io = new Server(httpServer, {
        cors: {
            origin: config.cors.origin,
            methods: ['GET', 'POST'],
        },
    });

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

    io.on('connection', (socket: Socket) => {
        console.log(`User connected: ${socket.data.userId}`);

        // Join user-specific room
        socket.join(`user:${socket.data.userId}`);

        // Join challenge room
        socket.on('challenge:subscribe', (challengeId: string) => {
            socket.join(`challenge:${challengeId}`);
            console.log(`User ${socket.data.userId} subscribed to challenge ${challengeId}`);
        });

        socket.on('challenge:unsubscribe', (challengeId: string) => {
            socket.leave(`challenge:${challengeId}`);
        });

        // Join team room
        socket.on('team:subscribe', (teamId: string) => {
            socket.join(`team:${teamId}`);
        });

        socket.on('team:unsubscribe', (teamId: string) => {
            socket.leave(`team:${teamId}`);
        });

        socket.on('disconnect', () => {
            console.log(`User disconnected: ${socket.data.userId}`);
        });
    });

    return io;
};

export const getIO = (): Server => {
    if (!io) {
        throw new Error('Socket.io not initialized');
    }
    return io;
};

// Helper functions to emit events
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

export const emitUserLevelUp = (userId: string, newLevel: number) => {
    io?.to(`user:${userId}`).emit('user:levelup', { newLevel });
};
