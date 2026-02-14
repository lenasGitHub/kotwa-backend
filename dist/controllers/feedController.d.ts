import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getMainFeed: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const reactToProof: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=feedController.d.ts.map