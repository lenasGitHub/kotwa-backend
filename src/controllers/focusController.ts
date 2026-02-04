import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { FocusService } from '../services/focus.service';

export const startFocusSession = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { habitId, challengeId } = req.body;
        const session = await FocusService.startSession(req.userId!, habitId, challengeId);
        res.status(201).json({ success: true, data: session });
    } catch (error) {
        next(error);
    }
};

export const pauseFocusSession = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;
        const session = await FocusService.pauseSession(req.userId!, id);
        res.json({ success: true, data: session });
    } catch (error) {
        next(error);
    }
};

export const resumeFocusSession = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;
        const session = await FocusService.resumeSession(req.userId!, id);
        res.json({ success: true, data: session });
    } catch (error) {
        next(error);
    }
};

export const endFocusSession = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params;
        const { duration } = req.body; // actual duration in seconds
        const session = await FocusService.endSession(req.userId!, id, duration);
        res.json({ success: true, data: session });
    } catch (error) {
        next(error);
    }
};
