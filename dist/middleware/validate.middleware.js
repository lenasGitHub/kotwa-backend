"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validate = void 0;
const zod_1 = require("zod");
/**
 * Validation middleware factory using Zod schemas
 * Validates request body, params, and query against the provided schema
 */
const validate = (schema) => {
    return async (req, res, next) => {
        try {
            await schema.parseAsync({
                body: req.body,
                query: req.query,
                params: req.params,
            });
            next();
        }
        catch (error) {
            if (error instanceof zod_1.ZodError) {
                const messages = error.issues.map((issue) => ({
                    field: issue.path.join('.'),
                    message: issue.message,
                }));
                return res.status(400).json({
                    success: false,
                    error: 'Validation failed',
                    details: messages,
                });
            }
            next(error);
        }
    };
};
exports.validate = validate;
//# sourceMappingURL=validate.middleware.js.map