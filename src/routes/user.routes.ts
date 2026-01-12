import { Router } from 'express';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// GET /api/users/me - Get current user profile
router.get('/me', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.userId },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                totalXp: true,
                currentLevel: true,
                currentStreak: true,
                lastActiveAt: true,
                createdAt: true,
                badges: {
                    include: { badge: true },
                },
                participations: {
                    include: {
                        challenge: {
                            select: { id: true, title: true, type: true, category: true },
                        },
                    },
                },
            },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
});

// GET /api/users/:id/stats - Get another user's stats (for benchmarking)
router.get('/:id/stats', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                name: true,
                avatarUrl: true,
                totalXp: true,
                currentLevel: true,
                currentStreak: true,
                participations: {
                    where: { isEliminated: false },
                    select: {
                        currentValue: true,
                        challenge: { select: { title: true, type: true } },
                    },
                },
                badges: {
                    include: { badge: true },
                },
            },
        });

        if (!user) {
            throw new AppError('User not found', 404);
        }

        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
});

// PUT /api/users/me - Update profile
router.put('/me', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { name, avatarUrl } = req.body;

        const user = await prisma.user.update({
            where: { id: req.userId },
            data: {
                ...(name && { name }),
                ...(avatarUrl && { avatarUrl }),
            },
            select: {
                id: true,
                email: true,
                name: true,
                avatarUrl: true,
                totalXp: true,
                currentLevel: true,
            },
        });

        res.json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
});

export default router;
