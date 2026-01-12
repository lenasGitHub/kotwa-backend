import { Router } from 'express';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// POST /api/challenges - Create a new challenge
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const {
            title,
            description,
            type,
            category,
            targetGoal,
            thresholdPct,
            maxHearts,
            startDate,
            endDate,
            teamId,
            isPublic,
        } = req.body;

        if (!title || !type || !category || !targetGoal || !startDate || !endDate) {
            throw new AppError('Missing required fields', 400);
        }

        const challenge = await prisma.challenge.create({
            data: {
                title,
                description: description || '',
                type,
                category,
                targetGoal: parseFloat(targetGoal),
                thresholdPct: thresholdPct ? parseFloat(thresholdPct) : null,
                maxHearts: maxHearts ? parseInt(maxHearts, 10) : null,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                creatorId: req.userId!,
                teamId: teamId || null,
                isPublic: isPublic || false,
            },
        });

        // Auto-join creator as first participant
        await prisma.challengeParticipant.create({
            data: {
                userId: req.userId!,
                challengeId: challenge.id,
                heartsLeft: maxHearts || null,
            },
        });

        res.status(201).json({ success: true, data: challenge });
    } catch (error) {
        next(error);
    }
});

// GET /api/challenges - List available challenges
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { category, type, teamId } = req.query;

        const challenges = await prisma.challenge.findMany({
            where: {
                OR: [
                    { isPublic: true },
                    { creatorId: req.userId },
                    { teamId: teamId as string | undefined },
                ],
                ...(category && { category: category as any }),
                ...(type && { type: type as any }),
            },
            include: {
                creator: { select: { id: true, name: true, avatarUrl: true } },
                participants: {
                    select: {
                        userId: true,
                        currentValue: true,
                        user: { select: { name: true, avatarUrl: true } },
                    },
                },
                _count: { select: { participants: true } },
            },
            orderBy: { startDate: 'desc' },
        });

        res.json({ success: true, data: challenges });
    } catch (error) {
        next(error);
    }
});

// GET /api/challenges/:id - Get challenge details
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { id } = req.params;

        const challenge = await prisma.challenge.findUnique({
            where: { id },
            include: {
                creator: { select: { id: true, name: true, avatarUrl: true } },
                team: { select: { id: true, name: true } },
                participants: {
                    include: {
                        user: { select: { id: true, name: true, avatarUrl: true } },
                    },
                    orderBy: { currentValue: 'desc' },
                },
            },
        });

        if (!challenge) {
            throw new AppError('Challenge not found', 404);
        }

        // Calculate team progress for COOP challenges
        let teamProgress = 0;
        if (challenge.type === 'COOP') {
            const totalValue = challenge.participants.reduce(
                (sum, p) => sum + p.currentValue,
                0
            );
            teamProgress = Math.min(totalValue / challenge.targetGoal, 1);
        }

        res.json({
            success: true,
            data: { ...challenge, teamProgress },
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/challenges/:id/join - Join a challenge
router.post('/:id/join', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { id } = req.params;

        const challenge = await prisma.challenge.findUnique({
            where: { id },
            select: { maxHearts: true },
        });

        if (!challenge) {
            throw new AppError('Challenge not found', 404);
        }

        // Check if already joined
        const existing = await prisma.challengeParticipant.findUnique({
            where: {
                userId_challengeId: { userId: req.userId!, challengeId: id },
            },
        });

        if (existing) {
            throw new AppError('Already joined this challenge', 400);
        }

        const participant = await prisma.challengeParticipant.create({
            data: {
                userId: req.userId!,
                challengeId: id,
                heartsLeft: challenge.maxHearts || null,
            },
        });

        res.status(201).json({ success: true, data: participant });
    } catch (error) {
        next(error);
    }
});

// POST /api/challenges/:id/leave - Leave a challenge
router.post('/:id/leave', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { id } = req.params;

        await prisma.challengeParticipant.delete({
            where: {
                userId_challengeId: { userId: req.userId!, challengeId: id },
            },
        });

        res.json({ success: true, message: 'Left challenge' });
    } catch (error) {
        next(error);
    }
});

// GET /api/challenges/:id/leaderboard - Get ranked participants
router.get('/:id/leaderboard', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { id } = req.params;

        const participants = await prisma.challengeParticipant.findMany({
            where: { challengeId: id },
            include: {
                user: { select: { id: true, name: true, avatarUrl: true, currentLevel: true } },
            },
            orderBy: { currentValue: 'desc' },
        });

        const leaderboard = participants.map((p, index) => ({
            rank: index + 1,
            userId: p.userId,
            name: p.user.name,
            avatarUrl: p.user.avatarUrl,
            level: p.user.currentLevel,
            value: p.currentValue,
            isEliminated: p.isEliminated,
            heartsLeft: p.heartsLeft,
        }));

        res.json({ success: true, data: leaderboard });
    } catch (error) {
        next(error);
    }
});

export default router;
