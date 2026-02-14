import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const getProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const updateProfile: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getUserStats: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const getAllUsers: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=userController.d.ts.map