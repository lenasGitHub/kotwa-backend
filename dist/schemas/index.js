"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userIdParamSchema = exports.updateUserSchema = exports.progressParamSchema = exports.logProgressSchema = exports.joinTeamSchema = exports.teamIdParamSchema = exports.createTeamSchema = exports.challengeIdParamSchema = exports.challengeQuerySchema = exports.createChallengeSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
// ============================================
// AUTH SCHEMAS
// ============================================
exports.registerSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
        password: zod_1.z
            .string()
            .min(6, 'Password must be at least 6 characters')
            .max(100, 'Password too long'),
        name: zod_1.z
            .string()
            .min(2, 'Name must be at least 2 characters')
            .max(100, 'Name too long'),
    }),
});
exports.loginSchema = zod_1.z.object({
    body: zod_1.z.object({
        email: zod_1.z.string().email('Invalid email format'),
        password: zod_1.z.string().min(1, 'Password is required'),
    }),
});
// ============================================
// CHALLENGE SCHEMAS
// ============================================
const ChallengeTypeEnum = zod_1.z.enum([
    'COOP',
    'THRESHOLD',
    'SURVIVOR',
    'RELAY',
    'BLIND',
]);
const ChallengeCategoryEnum = zod_1.z.enum([
    'HEALTH',
    'SPIRITUAL',
    'PRODUCTIVITY',
    'MENTAL',
    'FINANCE',
    'SOCIAL',
]);
exports.createChallengeSchema = zod_1.z.object({
    body: zod_1.z.object({
        title: zod_1.z.string().min(3, 'Title must be at least 3 characters').max(200),
        description: zod_1.z.string().max(2000).optional(),
        type: ChallengeTypeEnum,
        category: ChallengeCategoryEnum,
        targetGoal: zod_1.z.coerce.number().positive('Target goal must be positive'),
        thresholdPct: zod_1.z.coerce.number().min(0).max(1).optional(),
        maxHearts: zod_1.z.coerce.number().int().positive().optional(),
        startDate: zod_1.z.coerce.date(),
        endDate: zod_1.z.coerce.date(),
        teamId: zod_1.z.string().cuid().optional(),
        isPublic: zod_1.z.boolean().default(false),
    }).refine((data) => data.endDate > data.startDate, { message: 'End date must be after start date', path: ['endDate'] }),
});
exports.challengeQuerySchema = zod_1.z.object({
    query: zod_1.z.object({
        category: ChallengeCategoryEnum.optional(),
        type: ChallengeTypeEnum.optional(),
        teamId: zod_1.z.string().cuid().optional(),
    }),
});
exports.challengeIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().cuid('Invalid challenge ID'),
    }),
});
// ============================================
// TEAM SCHEMAS
// ============================================
exports.createTeamSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2, 'Name must be at least 2 characters').max(100),
        description: zod_1.z.string().max(500).optional(),
        avatarUrl: zod_1.z.string().url().optional(),
    }),
});
exports.teamIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().cuid('Invalid team ID'),
    }),
});
exports.joinTeamSchema = zod_1.z.object({
    params: zod_1.z.object({
        inviteCode: zod_1.z.string().cuid('Invalid invite code'),
    }),
});
// ============================================
// PROGRESS SCHEMAS
// ============================================
exports.logProgressSchema = zod_1.z.object({
    body: zod_1.z.object({
        challengeId: zod_1.z.string().cuid('Invalid challenge ID'),
        value: zod_1.z.coerce.number().nonnegative('Value cannot be negative'),
        isSuccess: zod_1.z.boolean().default(true),
        note: zod_1.z.string().max(500).optional(),
        date: zod_1.z.coerce.date().optional(),
    }),
});
exports.progressParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        challengeId: zod_1.z.string().cuid('Invalid challenge ID'),
    }),
});
// ============================================
// USER SCHEMAS
// ============================================
exports.updateUserSchema = zod_1.z.object({
    body: zod_1.z.object({
        name: zod_1.z.string().min(2).max(100).optional(),
        avatarUrl: zod_1.z.string().url().optional().nullable(),
    }).refine((data) => data.name !== undefined || data.avatarUrl !== undefined, { message: 'At least one field must be provided' }),
});
exports.userIdParamSchema = zod_1.z.object({
    params: zod_1.z.object({
        id: zod_1.z.string().cuid('Invalid user ID'),
    }),
});
//# sourceMappingURL=index.js.map