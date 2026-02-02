import { Router } from 'express';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { validate } from '../middleware/validate.middleware';
import { logProgressSchema } from '../schemas';
import { ProgressService, ProgressError } from '../services';

const router = Router();

// POST /api/progress - Log progress for a challenge
router.post('/', authenticate, validate(logProgressSchema), async (req: AuthRequest, res, next) => {
    try {
        const result = await ProgressService.logProgress({
            userId: req.userId!,
            ...req.body,
        });
        res.json({ success: true, data: result });
    } catch (error) {
        if (error instanceof ProgressError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message,
            });
        }
        next(error);
    }
});

// GET /api/progress/:challengeId - Get user's progress logs for a challenge
router.get('/:challengeId', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const progress = await ProgressService.getUserProgress(
            req.userId!,
            req.params.challengeId
        );
        res.json({ success: true, data: progress });
    } catch (error) {
        next(error);
    }
});

// GET /api/progress/:challengeId/calendar - Get calendar view data
router.get('/:challengeId/calendar', authenticate, async (req: AuthRequest, res, next) => {
    try {
        const calendar = await ProgressService.getCalendarData(
            req.userId!,
            req.params.challengeId
        );
        res.json({ success: true, data: calendar });
    } catch (error) {
        next(error);
    }
});

export default router;
