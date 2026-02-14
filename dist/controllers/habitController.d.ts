import { NextFunction, Request, Response } from 'express';
export declare const getCategories: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getSubHabits: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getHabit: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const toggleFavorite: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const toggleNotification: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const rateHabit: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getHabitMembers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const joinHabit: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const unjoinHabit: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=habitController.d.ts.map