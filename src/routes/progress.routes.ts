import { Router } from 'express';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { getIO } from '../socket';

const router = Router();

// POST /api/progress - Log progress for a challenge
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { challengeId, value, isSuccess, note, date } = req.body;

        if (!challengeId || value === undefined) {
            throw new AppError('challengeId and value are required', 400);
        }

        const valueNum = parseFloat(value);
        const logDate = date ? new Date(date) : new Date();
        // Normalize to start of day
        logDate.setHours(0, 0, 0, 0);

        // Check if user is a participant
        const participant = await prisma.challengeParticipant.findUnique({
            where: {
                userId_challengeId: { userId: req.userId!, challengeId },
            },
            include: { challenge: true },
        });

        if (!participant) {
            throw new AppError('You are not a participant in this challenge', 403);
        }

        if (participant.isEliminated) {
            throw new AppError('You have been eliminated from this challenge', 403);
        }

        // Upsert progress log (one per day per challenge)
        const progressLog = await prisma.progressLog.upsert({
            where: {
                userId_challengeId_date: {
                    userId: req.userId!,
                    challengeId,
                    date: logDate,
                },
            },
            create: {
                userId: req.userId!,
                challengeId,
                value: valueNum,
                isSuccess: isSuccess !== false,
                note,
                date: logDate,
            },
            update: {
                value: valueNum,
                isSuccess: isSuccess !== false,
                note,
            },
        });

        // Update participant's total value
        const totalLogs = await prisma.progressLog.aggregate({
            where: { userId: req.userId!, challengeId },
            _sum: { value: true },
        });

        const newTotalValue = totalLogs._sum.value || 0;

        await prisma.challengeParticipant.update({
            where: {
                userId_challengeId: { userId: req.userId!, challengeId },
            },
            data: { currentValue: newTotalValue },
        });

        // Update user XP (1 XP per unit of value, simplified)
        const xpGained = Math.floor(valueNum / 100); // e.g., 100 steps = 1 XP
        if (xpGained > 0) {
            await prisma.user.update({
                where: { id: req.userId },
                data: {
                    xp: { increment: xpGained },
                    lastActive: new Date(),
                },
            });
        }

        // Emit real-time update
        try {
            const io = getIO();
            io.to(`challenge:${challengeId}`).emit('challenge:progress', {
                challengeId,
                userId: req.userId,
                value: valueNum,
                totalValue: newTotalValue,
            });
        } catch (e) {
            // Socket not critical
        }

        res.json({
            success: true,
            data: { progressLog, totalValue: newTotalValue, xpGained },
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/progress/:challengeId - Get user's progress logs for a challenge
router.get('/:challengeId', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { challengeId } = req.params;

        const logs = await prisma.progressLog.findMany({
            where: { userId: req.userId!, challengeId },
            orderBy: { date: 'desc' },
        });

        const participant = await prisma.challengeParticipant.findUnique({
            where: {
                userId_challengeId: { userId: req.userId!, challengeId },
            },
        });

        res.json({
            success: true,
            data: {
                logs,
                totalValue: participant?.currentValue || 0,
                heartsLeft: participant?.heartsLeft,
                isEliminated: participant?.isEliminated,
            },
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/progress/:challengeId/calendar - Get calendar view data
router.get('/:challengeId/calendar', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { challengeId } = req.params;

        const logs = await prisma.progressLog.findMany({
            where: { userId: req.userId!, challengeId },
            select: { date: true, value: true, isSuccess: true },
            orderBy: { date: 'asc' },
        });

        // Format for calendar (date -> status)
        const calendar = logs.map((log) => ({
            date: log.date.toISOString().split('T')[0],
            value: log.value,
            isSuccess: log.isSuccess,
        }));

        res.json({ success: true, data: calendar });
    } catch (error) {
        next(error);
    }
});

export default router;
