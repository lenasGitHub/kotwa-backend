"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const socket_1 = require("../socket");
const router = (0, express_1.Router)();
// POST /api/progress - Log progress for a challenge
router.post('/', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const { challengeId, value, isSuccess, note, date } = req.body;
        if (!challengeId || value === undefined) {
            throw new error_middleware_1.AppError('challengeId and value are required', 400);
        }
        const valueNum = parseFloat(value);
        const logDate = date ? new Date(date) : new Date();
        // Normalize to start of day
        logDate.setHours(0, 0, 0, 0);
        // Check if user is a participant
        const participant = await prisma_1.default.challengeParticipant.findUnique({
            where: {
                userId_challengeId: { userId: req.userId, challengeId },
            },
            include: { challenge: true },
        });
        if (!participant) {
            throw new error_middleware_1.AppError('You are not a participant in this challenge', 403);
        }
        if (participant.isEliminated) {
            throw new error_middleware_1.AppError('You have been eliminated from this challenge', 403);
        }
        // Upsert progress log (one per day per challenge)
        const progressLog = await prisma_1.default.progressLog.upsert({
            where: {
                userId_challengeId_date: {
                    userId: req.userId,
                    challengeId,
                    date: logDate,
                },
            },
            create: {
                userId: req.userId,
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
        const totalLogs = await prisma_1.default.progressLog.aggregate({
            where: { userId: req.userId, challengeId },
            _sum: { value: true },
        });
        const newTotalValue = totalLogs._sum.value || 0;
        await prisma_1.default.challengeParticipant.update({
            where: {
                userId_challengeId: { userId: req.userId, challengeId },
            },
            data: { currentValue: newTotalValue },
        });
        // Update user XP (1 XP per unit of value, simplified)
        const xpGained = Math.floor(valueNum / 100); // e.g., 100 steps = 1 XP
        if (xpGained > 0) {
            await prisma_1.default.user.update({
                where: { id: req.userId },
                data: {
                    xp: { increment: xpGained },
                    lastActive: new Date(),
                },
            });
        }
        // Emit real-time update
        try {
            const io = (0, socket_1.getIO)();
            io.to(`challenge:${challengeId}`).emit('challenge:progress', {
                challengeId,
                userId: req.userId,
                value: valueNum,
                totalValue: newTotalValue,
            });
        }
        catch (e) {
            // Socket not critical
        }
        res.json({
            success: true,
            data: { progressLog, totalValue: newTotalValue, xpGained },
        });
    }
    catch (error) {
        next(error);
    }
});
// GET /api/progress/:challengeId - Get user's progress logs for a challenge
router.get('/:challengeId', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const { challengeId } = req.params;
        const logs = await prisma_1.default.progressLog.findMany({
            where: { userId: req.userId, challengeId },
            orderBy: { date: 'desc' },
        });
        const participant = await prisma_1.default.challengeParticipant.findUnique({
            where: {
                userId_challengeId: { userId: req.userId, challengeId },
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
    }
    catch (error) {
        next(error);
    }
});
// GET /api/progress/:challengeId/calendar - Get calendar view data
router.get('/:challengeId/calendar', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const { challengeId } = req.params;
        const logs = await prisma_1.default.progressLog.findMany({
            where: { userId: req.userId, challengeId },
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
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=progress.routes.js.map