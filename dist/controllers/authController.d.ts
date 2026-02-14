import { NextFunction, Request, Response } from 'express';
export declare const register: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const passwordLogin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const verify: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const checkUsername: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const forgotPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const resetPassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteAccount: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const changePassword: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=authController.d.ts.map