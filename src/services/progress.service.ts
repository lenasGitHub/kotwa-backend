import prisma from '../utils/prisma';
import { getIO } from '../socket';

// ============================================
// TYPES
// ============================================

export interface LogProgressInput {
    userId: string;
    challengeId: string;
    value: number;
    isSuccess?: boolean;
    note?: string;
    date?: Date;
}

export interface ProgressResult {
    progressLog: any;
    totalValue: number;
    xpGained: number;
}

export interface UserProgress {
    logs: any[];
    totalValue: number;
    heartsLeft: number | null;
    isEliminated: boolean;
}

export interface CalendarEntry {
    date: string;
    value: number;
    isSuccess: boolean;
}

// ============================================
// PROGRESS SERVICE
// ============================================

export class ProgressService {
    /**
     * Log progress for a challenge
     */
    static async logProgress(input: LogProgressInput): Promise<ProgressResult> {
        const { userId, challengeId, value, isSuccess = true, note, date } = input;

        // Normalize date to start of day
        const logDate = date ? new Date(date) : new Date();
        logDate.setHours(0, 0, 0, 0);

        // Check if user is a participant
        const participant = await prisma.challengeParticipant.findUnique({
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
        const progressLog = await prisma.progressLog.upsert({
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
        const totalLogs = await prisma.progressLog.aggregate({
            where: { userId, challengeId },
            _sum: { value: true },
        });

        const newTotalValue = totalLogs._sum.value || 0;

        await prisma.challengeParticipant.update({
            where: {
                userId_challengeId: { userId, challengeId },
            },
            data: { currentValue: newTotalValue },
        });

        // Update user XP (1 XP per 100 units of value)
        const xpGained = Math.floor(value / 100);
        if (xpGained > 0) {
            await prisma.user.update({
                where: { id: userId },
                data: {
                    totalXp: { increment: xpGained },
                    lastActiveAt: new Date(),
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
    static async getUserProgress(userId: string, challengeId: string): Promise<UserProgress> {
        const logs = await prisma.progressLog.findMany({
            where: { userId, challengeId },
            orderBy: { date: 'desc' },
        });

        const participant = await prisma.challengeParticipant.findUnique({
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
    static async getCalendarData(userId: string, challengeId: string): Promise<CalendarEntry[]> {
        const logs = await prisma.progressLog.findMany({
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
    private static emitProgressUpdate(
        challengeId: string,
        userId: string,
        value: number,
        totalValue: number
    ): void {
        try {
            const io = getIO();
            io.to(`challenge:${challengeId}`).emit('challenge:progress', {
                challengeId,
                userId,
                value,
                totalValue,
            });
        } catch (e) {
            // Socket not critical, ignore errors
        }
    }
}

// ============================================
// ERROR CLASS
// ============================================

export class ProgressError extends Error {
    constructor(
        message: string,
        public statusCode: number = 400
    ) {
        super(message);
        this.name = 'ProgressError';
    }
}
