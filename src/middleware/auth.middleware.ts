import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from './error.middleware';

export interface AuthRequest extends Request {
    userId?: string;
}

export const authenticate = (
    req: AuthRequest,
    res: Response,
    next: NextFunction
) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new AppError('No token provided', 401);
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, config.jwt.secret) as { userId: string };

        req.userId = decoded.userId;
        next();
    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError) {
            return next(new AppError('Invalid token', 401));
        }
        next(error);
    }
};
