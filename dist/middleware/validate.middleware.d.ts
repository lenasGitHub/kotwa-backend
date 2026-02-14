import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
/**
 * Validation middleware factory using Zod schemas
 * Validates request body, params, and query against the provided schema
 */
export declare const validate: (schema: ZodSchema) => (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=validate.middleware.d.ts.map