import { NextFunction, Request, Response } from 'express';
export declare const createInvite: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const acceptInvite: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const syncContacts: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getFriends: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const toggleFollow: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getFollowers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getFollowing: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const removeFriend: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=socialController.d.ts.map