import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { createChallengeSchema, challengeIdParamSchema } from '../schemas';
import { ChallengeService, ChallengeError } from '../services';

const router = Router();

// POST /api/challenges - Create a new challenge
router.post('/', authenticate, validate(createChallengeSchema), async (req: AuthRequest, res, next) => {
    try {
        const challenge = await ChallengeService.createChallenge({
            creatorId: req.userId!,
            ...req.body,
        });
        res.status(201).json({ success: true, data: challenge });
    } catch (error) {
        if (error instanceof ChallengeError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message,
            });
        }
        next(error);
    }
});

// GET /api/challenges - List available challenges
router.get('/', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { category, type, teamId } = req.query;
        const challenges = await ChallengeService.listChallenges({
            category: category as string,
            type: type as string,
            teamId: teamId as string,
            userId: req.userId!,
        });
        res.json({ success: true, data: challenges });
    } catch (error) {
        next(error);
    }
});

// GET /api/challenges/:id - Get challenge details
router.get('/:id', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const { challenge, teamProgress } = await ChallengeService.getChallengeDetails(req.params.id);
        res.json({
            success: true,
            data: { ...challenge, teamProgress },
        });
    } catch (error) {
        if (error instanceof ChallengeError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message,
            });
        }
        next(error);
    }
});

// POST /api/challenges/:id/join - Join a challenge
router.post('/:id/join', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const participant = await ChallengeService.joinChallenge(req.userId!, req.params.id);
        res.status(201).json({ success: true, data: participant });
    } catch (error) {
        if (error instanceof ChallengeError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message,
            });
        }
        next(error);
    }
});

// POST /api/challenges/:id/leave - Leave a challenge
router.post('/:id/leave', authenticate, async (req: AuthRequest, res, next) => {
    try {
        await ChallengeService.leaveChallenge(req.userId!, req.params.id);
        res.json({ success: true, message: 'Left challenge' });
    } catch (error) {
        next(error);
    }
});

// GET /api/challenges/:id/leaderboard - Get ranked participants
router.get('/:id/leaderboard', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const leaderboard = await ChallengeService.getLeaderboard(req.params.id);
        res.json({ success: true, data: leaderboard });
    } catch (error) {
        next(error);
    }
});

export default router;
