import { z } from 'zod';

// ============================================
// AUTH SCHEMAS
// ============================================

export const registerSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email format'),
        password: z
            .string()
            .min(6, 'Password must be at least 6 characters')
            .max(100, 'Password too long'),
        name: z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name too long'),
    }),
});

export const loginSchema = z.object({
    body: z.object({
        email: z.string().email('Invalid email format'),
        password: z.string().min(1, 'Password is required'),
    }),
});

// ============================================
// CHALLENGE SCHEMAS
// ============================================

const ChallengeTypeEnum = z.enum([
    'COOP',
    'THRESHOLD',
    'SURVIVOR',
    'RELAY',
    'BLIND',
]);

const ChallengeCategoryEnum = z.enum([
    'HEALTH',
    'SPIRITUAL',
    'PRODUCTIVITY',
    'MENTAL',
    'FINANCE',
    'SOCIAL',
]);

export const createChallengeSchema = z.object({
    body: z.object({
        title: z.string().min(3, 'Title must be at least 3 characters').max(200),
        description: z.string().max(2000).optional(),
        type: ChallengeTypeEnum,
        category: ChallengeCategoryEnum,
        targetGoal: z.coerce.number().positive('Target goal must be positive'),
        thresholdPct: z.coerce.number().min(0).max(1).optional(),
        maxHearts: z.coerce.number().int().positive().optional(),
        startDate: z.coerce.date(),
        endDate: z.coerce.date(),
        teamId: z.string().cuid().optional(),
        isPublic: z.boolean().default(false),
    }).refine(
        (data) => data.endDate > data.startDate,
        { message: 'End date must be after start date', path: ['endDate'] }
    ),
});

export const challengeQuerySchema = z.object({
    query: z.object({
        category: ChallengeCategoryEnum.optional(),
        type: ChallengeTypeEnum.optional(),
        teamId: z.string().cuid().optional(),
    }),
});

export const challengeIdParamSchema = z.object({
    params: z.object({
        id: z.string().cuid('Invalid challenge ID'),
    }),
});

// ============================================
// TEAM SCHEMAS
// ============================================

export const createTeamSchema = z.object({
    body: z.object({
        name: z.string().min(2, 'Name must be at least 2 characters').max(100),
        description: z.string().max(500).optional(),
        avatarUrl: z.string().url().optional(),
    }),
});

export const teamIdParamSchema = z.object({
    params: z.object({
        id: z.string().cuid('Invalid team ID'),
    }),
});

export const joinTeamSchema = z.object({
    params: z.object({
        inviteCode: z.string().cuid('Invalid invite code'),
    }),
});

// ============================================
// PROGRESS SCHEMAS
// ============================================

export const logProgressSchema = z.object({
    body: z.object({
        challengeId: z.string().cuid('Invalid challenge ID'),
        value: z.coerce.number().nonnegative('Value cannot be negative'),
        isSuccess: z.boolean().default(true),
        note: z.string().max(500).optional(),
        date: z.coerce.date().optional(),
    }),
});

export const progressParamSchema = z.object({
    params: z.object({
        challengeId: z.string().cuid('Invalid challenge ID'),
    }),
});

// ============================================
// USER SCHEMAS
// ============================================

export const updateUserSchema = z.object({
    body: z.object({
        name: z.string().min(2).max(100).optional(),
        avatarUrl: z.string().url().optional().nullable(),
    }).refine(
        (data) => data.name !== undefined || data.avatarUrl !== undefined,
        { message: 'At least one field must be provided' }
    ),
});

export const userIdParamSchema = z.object({
    params: z.object({
        id: z.string().cuid('Invalid user ID'),
    }),
});

// Re-export types for use in route handlers
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type LogProgressInput = z.infer<typeof logProgressSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
