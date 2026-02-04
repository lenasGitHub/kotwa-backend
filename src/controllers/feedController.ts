import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { FeedService } from '../services/feed.service';

export const getMainFeed = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const page = parseInt(req.query.page as string) || 1;
        const limit = parseInt(req.query.limit as string) || 10;

        const result = await FeedService.getMainFeed(req.userId!, page, limit);

        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const reactToProof = async (
    req: AuthRequest,
    res: Response,
    next: NextFunction,
) => {
    try {
        const { id } = req.params; // proofId
        const { type } = req.body; // reaction type

        const result = await FeedService.reactToProof(req.userId!, id, type);

        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};
