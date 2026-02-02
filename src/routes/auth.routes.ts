import { Router } from 'express';
import { validate } from '../middleware/validate.middleware';
import { registerSchema, loginSchema } from '../schemas';
import { AuthService, AuthError } from '../services';

const router = Router();

// POST /api/auth/register
router.post('/register', validate(registerSchema), async (req, res, next) => {
    try {
        const result = await AuthService.register(req.body);
        res.status(201).json({ success: true, data: result });
    } catch (error) {
        if (error instanceof AuthError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message,
            });
        }
        next(error);
    }
});

// POST /api/auth/login
router.post('/login', validate(loginSchema), async (req, res, next) => {
    try {
        const result = await AuthService.login(req.body);
        res.json({ success: true, data: result });
    } catch (error) {
        if (error instanceof AuthError) {
            return res.status(error.statusCode).json({
                success: false,
                error: error.message,
            });
        }
        next(error);
    }
});

export default router;
