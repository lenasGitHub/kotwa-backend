import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createTeamSchema } from '../schemas';
import { TeamService, TeamError } from '../services';

const router = Router();

// POST /api/teams - Create a new team
router.post('/', authenticate, validate(createTeamSchema), async (req: AuthRequest, res, next) => {
    try {
        const team = await TeamService.createTeam({
            creatorId: req.userId!,
            ...req.body,
        });
        res.status(201).json({ success: true, data: team });
    } catch (error) {
        if (error instanceof TeamError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message,
            });
        }
        next(error);
    }
});

// GET /api/teams - List user's teams
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const teams = await TeamService.listUserTeams(req.userId!);
        res.json({ success: true, data: teams });
    } catch (error) {
        next(error);
    }
});

// GET /api/teams/:id - Get team details
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const team = await TeamService.getTeamDetails(req.params.id);
        res.json({ success: true, data: team });
    } catch (error) {
        if (error instanceof TeamError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message,
            });
        }
        next(error);
    }
});

// POST /api/teams/join/:inviteCode - Join via invite code
router.post('/join/:inviteCode', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const result = await TeamService.joinTeam(req.userId!, req.params.inviteCode);
        res.json({ success: true, message: 'Joined team', data: result });
    } catch (error) {
        if (error instanceof TeamError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message,
            });
        }
        next(error);
    }
});

// DELETE /api/teams/:id/leave - Leave a team
router.delete('/:id/leave', authenticate, async (req: AuthRequest, res, next) => {
    try {
        await TeamService.leaveTeam(req.userId!, req.params.id);
        res.json({ success: true, message: 'Left team' });
    } catch (error) {
        next(error);
    }
});

export default router;
