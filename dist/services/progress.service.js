"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressError = exports.ProgressService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const socket_1 = require("../socket");
// ============================================
// PROGRESS SERVICE
// ============================================
class ProgressService {
    /**
     * Log progress for a challenge
     */
    static async logProgress(input) {
        const { userId, challengeId, value, isSuccess = true, note, date } = input;
        // Normalize date to start of day
        const logDate = date ? new Date(date) : new Date();
        logDate.setHours(0, 0, 0, 0);
        // Check if user is a participant
        const participant = await prisma_1.default.challengeParticipant.findUnique({
            where: {
                userId_challengeId: { userId, challengeId },
            },
            include: { challenge: true },
        });
        if (!participant) {
            throw new ProgressError('You are not a participant in this challenge', 403);
        }
        if (participant.isEliminated) {
            throw new ProgressError('You have been eliminated from this challenge', 403);
        }
        // Upsert progress log (one per day per challenge)
        const progressLog = await prisma_1.default.progressLog.upsert({
            where: {
                userId_challengeId_date: {
                    userId,
                    challengeId,
                    date: logDate,
                },
            },
            create: {
                userId,
                challengeId,
                value,
                isSuccess,
                note,
                date: logDate,
            },
            update: {
                value,
                isSuccess,
                note,
            },
        });
        // Update participant's total value
        const totalLogs = await prisma_1.default.progressLog.aggregate({
            where: { userId, challengeId },
            _sum: { value: true },
        });
        const newTotalValue = totalLogs._sum.value || 0;
        await prisma_1.default.challengeParticipant.update({
            where: {
                userId_challengeId: { userId, challengeId },
            },
            data: { currentValue: newTotalValue },
        });
        // Update user XP (1 XP per 100 units of value)
        const xpGained = Math.floor(value / 100);
        if (xpGained > 0) {
            await prisma_1.default.user.update({
                where: { id: userId },
                data: {
                    xp: { increment: xpGained },
                    lastActive: new Date(),
                },
            });
        }
        // Emit real-time update
        this.emitProgressUpdate(challengeId, userId, value, newTotalValue);
        return { progressLog, totalValue: newTotalValue, xpGained };
    }
    /**
     * Get user's progress logs for a challenge
     */
    static async getUserProgress(userId, challengeId) {
        const logs = await prisma_1.default.progressLog.findMany({
            where: { userId, challengeId },
            orderBy: { date: 'desc' },
        });
        const participant = await prisma_1.default.challengeParticipant.findUnique({
            where: {
                userId_challengeId: { userId, challengeId },
            },
        });
        return {
            logs,
            totalValue: participant?.currentValue || 0,
            heartsLeft: participant?.heartsLeft ?? null,
            isEliminated: participant?.isEliminated ?? false,
        };
    }
    /**
     * Get calendar view data for a challenge
     */
    static async getCalendarData(userId, challengeId) {
        const logs = await prisma_1.default.progressLog.findMany({
            where: { userId, challengeId },
            select: { date: true, value: true, isSuccess: true },
            orderBy: { date: 'asc' },
        });
        return logs.map((log) => ({
            date: log.date.toISOString().split('T')[0],
            value: log.value,
            isSuccess: log.isSuccess,
        }));
    }
    /**
     * Emit real-time progress update via Socket.IO
     */
    static emitProgressUpdate(challengeId, userId, value, totalValue) {
        try {
            const io = (0, socket_1.getIO)();
            io.to(`challenge:${challengeId}`).emit('challenge:progress', {
                challengeId,
                userId,
                value,
                totalValue,
            });
        }
        catch (e) {
            // Socket not critical, ignore errors
        }
    }
}
exports.ProgressService = ProgressService;
// ============================================
// ERROR CLASS
// ============================================
class ProgressError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ProgressError';
    }
}
exports.ProgressError = ProgressError;
//# sourceMappingURL=progress.service.js.map