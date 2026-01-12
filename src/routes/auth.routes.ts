import { Router } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { config } from '../config/env';
import { AppError } from '../middleware/error.middleware';

const router = Router();

// POST /api/auth/register
router.post('/register', async (req, res, next) => {
    try {
        const { email, password, name } = req.body;

        if (!email || !password || !name) {
            throw new AppError('Email, password, and name are required', 400);
        }

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new AppError('Email already registered', 409);
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
            select: {
                id: true,
                email: true,
                name: true,
                totalXp: true,
                currentLevel: true,
            },
        });

        // Generate JWT
        const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
        });

        res.status(201).json({
            success: true,
            data: { user, token },
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/auth/login
router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            throw new AppError('Email and password are required', 400);
        }

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new AppError('Invalid credentials', 401);
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new AppError('Invalid credentials', 401);
        }

        // Update last active
        await prisma.user.update({
            where: { id: user.id },
            data: { lastActiveAt: new Date() },
        });

        // Generate JWT
        const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
            expiresIn: config.jwt.expiresIn,
        });

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    name: user.name,
                    avatarUrl: user.avatarUrl,
                    totalXp: user.totalXp,
                    currentLevel: user.currentLevel,
                    currentStreak: user.currentStreak,
                },
                token,
            },
        });
    } catch (error) {
        next(error);
    }
});

export default router;
