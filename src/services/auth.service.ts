import bcrypt from 'bcryptjs';
import jwt, { SignOptions } from 'jsonwebtoken';
import prisma from '../utils/prisma';
import { config } from '../config/env';

// ============================================
// TYPES
// ============================================

export interface RegisterInput {
    email: string;
    password: string;
    name: string;
}

export interface LoginInput {
    email: string;
    password: string;
}

export interface AuthResult {
    user: {
        id: string;
        email: string;
        name: string;
        avatarUrl?: string | null;
        totalXp: number;
        currentLevel: number;
        currentStreak?: number;
    };
    token: string;
}

// ============================================
// AUTH SERVICE
// ============================================

export class AuthService {
    /**
     * Register a new user
     */
    static async register(input: RegisterInput): Promise<AuthResult> {
        const { email, password, name } = input;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            throw new AuthError('Email already registered', 409);
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
                avatarUrl: true,
                totalXp: true,
                currentLevel: true,
            },
        });

        // Generate JWT
        const token = this.generateToken(user.id);

        return { user, token };
    }

    /**
     * Login an existing user
     */
    static async login(input: LoginInput): Promise<AuthResult> {
        const { email, password } = input;

        // Find user
        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) {
            throw new AuthError('Invalid credentials', 401);
        }

        // Verify password
        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            throw new AuthError('Invalid credentials', 401);
        }

        // Update last active
        await prisma.user.update({
            where: { id: user.id },
            data: { lastActiveAt: new Date() },
        });

        // Generate JWT
        const token = this.generateToken(user.id);

        return {
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
        };
    }

    /**
     * Generate JWT token
     */
    private static generateToken(userId: string): string {
        const signOptions: SignOptions = { expiresIn: config.jwt.expiresIn as any };
        return jwt.sign({ userId }, config.jwt.secret, signOptions);
    }
}

// ============================================
// ERROR CLASS
// ============================================

export class AuthError extends Error {
    constructor(
        message: string,
        public statusCode: number = 400
    ) {
        super(message);
        this.name = 'AuthError';
    }
}
