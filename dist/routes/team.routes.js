"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../utils/prisma"));
const auth_middleware_1 = require("../middleware/auth.middleware");
const error_middleware_1 = require("../middleware/error.middleware");
const router = (0, express_1.Router)();
// POST /api/teams - Create a new team
router.post('/', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const { name, description, avatarUrl } = req.body;
        if (!name) {
            throw new error_middleware_1.AppError('Team name is required', 400);
        }
        const team = await prisma_1.default.team.create({
            data: {
                name,
                description,
                avatarUrl,
                members: {
                    create: {
                        userId: req.userId,
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
    }
    catch (error) {
        next(error);
    }
});
// GET /api/teams - List user's teams
router.get('/', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const teams = await prisma_1.default.team.findMany({
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
    }
    catch (error) {
        next(error);
    }
});
// GET /api/teams/:id - Get team details
router.get('/:id', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        const team = await prisma_1.default.team.findUnique({
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
            throw new error_middleware_1.AppError('Team not found', 404);
        }
        res.json({ success: true, data: team });
    }
    catch (error) {
        next(error);
    }
});
// POST /api/teams/:id/join - Join via invite code
router.post('/join/:inviteCode', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const { inviteCode } = req.params;
        const team = await prisma_1.default.team.findUnique({
            where: { inviteCode },
        });
        if (!team) {
            throw new error_middleware_1.AppError('Invalid invite code', 404);
        }
        // Check if already a member
        const existing = await prisma_1.default.teamMember.findUnique({
            where: {
                userId_teamId: { userId: req.userId, teamId: team.id },
            },
        });
        if (existing) {
            throw new error_middleware_1.AppError('Already a member of this team', 400);
        }
        await prisma_1.default.teamMember.create({
            data: {
                userId: req.userId,
                teamId: team.id,
                role: 'member',
            },
        });
        res.json({ success: true, message: 'Joined team', data: { teamId: team.id } });
    }
    catch (error) {
        next(error);
    }
});
// DELETE /api/teams/:id/leave - Leave a team
router.delete('/:id/leave', auth_middleware_1.authenticate, async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma_1.default.teamMember.delete({
            where: {
                userId_teamId: { userId: req.userId, teamId: id },
            },
        });
        res.json({ success: true, message: 'Left team' });
    }
    catch (error) {
        next(error);
    }
});
exports.default = router;
//# sourceMappingURL=team.routes.js.map