import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const createChallenge: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getChallenges: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getChallengeById: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const joinChallenge: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const leaveChallenge: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getChallengeLeaderboard: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserChallenges: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=challengeController.d.ts.map