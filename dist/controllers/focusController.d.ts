import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
export declare const startFocusSession: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const pauseFocusSession: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const resumeFocusSession: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
export declare const endFocusSession: (req: AuthRequest, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=focusController.d.ts.map