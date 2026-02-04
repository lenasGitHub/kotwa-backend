import { Router } from 'express';
import prisma from '../utils/prisma';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// POST /api/teams - Create a new team
router.post('/', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { name, description, avatarUrl } = req.body;

        if (!name) {
            throw new AppError('Team name is required', 400);
        }

        const team = await prisma.team.create({
            data: {
                name,
                description,
                avatarUrl,
                members: {
                    create: {
                        userId: req.userId!,
                        role: 'admin',
                    },
                },
            },
            include: {
                members: {
                    include: { user: { select: { id: true, username: true, avatarUrl: true } } },
                },
            },
        });

        res.status(201).json({ success: true, data: team });
    } catch (error) {
        next(error);
    }
});

// GET /api/teams - List user's teams
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const teams = await prisma.team.findMany({
            where: {
                members: { some: { userId: req.userId } },
            },
            include: {
                members: {
                    include: { user: { select: { id: true, username: true, avatarUrl: true } } },
                },
                _count: { select: { challenges: true } },
            },
        });

        res.json({ success: true, data: teams });
    } catch (error) {
        next(error);
    }
});

// GET /api/teams/:id - Get team details
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { id } = req.params;

        const team = await prisma.team.findUnique({
            where: { id },
            include: {
                members: {
                    include: { user: { select: { id: true, username: true, avatarUrl: true, level: true } } },
                },
                challenges: {
                    select: { id: true, title: true, type: true, startDate: true, endDate: true },
                },
            },
        });

        if (!team) {
            throw new AppError('Team not found', 404);
        }

        res.json({ success: true, data: team });
    } catch (error) {
        next(error);
    }
});

// POST /api/teams/:id/join - Join via invite code
router.post('/join/:inviteCode', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { inviteCode } = req.params;

        const team = await prisma.team.findUnique({
            where: { inviteCode },
        });

        if (!team) {
            throw new AppError('Invalid invite code', 404);
        }

        // Check if already a member
        const existing = await prisma.teamMember.findUnique({
            where: {
                userId_teamId: { userId: req.userId!, teamId: team.id },
            },
        });

        if (existing) {
            throw new AppError('Already a member of this team', 400);
        }

        await prisma.teamMember.create({
            data: {
                userId: req.userId!,
                teamId: team.id,
                role: 'member',
            },
        });

        res.json({ success: true, message: 'Joined team', data: { teamId: team.id } });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/teams/:id/leave - Leave a team
router.delete('/:id/leave', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { id } = req.params;

        await prisma.teamMember.delete({
            where: {
                userId_teamId: { userId: req.userId!, teamId: id },
            },
        });

        res.json({ success: true, message: 'Left team' });
    } catch (error) {
        next(error);
    }
});

export default router;
