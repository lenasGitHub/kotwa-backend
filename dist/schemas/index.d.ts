import { z } from 'zod';
export declare const registerSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
        name: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const loginSchema: z.ZodObject<{
    body: z.ZodObject<{
        email: z.ZodString;
        password: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createChallengeSchema: z.ZodObject<{
    body: z.ZodObject<{
        title: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        type: z.ZodEnum<{
            COOP: "COOP";
            THRESHOLD: "THRESHOLD";
            SURVIVOR: "SURVIVOR";
            RELAY: "RELAY";
            BLIND: "BLIND";
        }>;
        category: z.ZodEnum<{
            HEALTH: "HEALTH";
            SPIRITUAL: "SPIRITUAL";
            PRODUCTIVITY: "PRODUCTIVITY";
            MENTAL: "MENTAL";
            FINANCE: "FINANCE";
            SOCIAL: "SOCIAL";
        }>;
        targetGoal: z.ZodCoercedNumber<unknown>;
        thresholdPct: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        maxHearts: z.ZodOptional<z.ZodCoercedNumber<unknown>>;
        startDate: z.ZodCoercedDate<unknown>;
        endDate: z.ZodCoercedDate<unknown>;
        teamId: z.ZodOptional<z.ZodString>;
        isPublic: z.ZodDefault<z.ZodBoolean>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const challengeQuerySchema: z.ZodObject<{
    query: z.ZodObject<{
        category: z.ZodOptional<z.ZodEnum<{
            HEALTH: "HEALTH";
            SPIRITUAL: "SPIRITUAL";
            PRODUCTIVITY: "PRODUCTIVITY";
            MENTAL: "MENTAL";
            FINANCE: "FINANCE";
            SOCIAL: "SOCIAL";
        }>>;
        type: z.ZodOptional<z.ZodEnum<{
            COOP: "COOP";
            THRESHOLD: "THRESHOLD";
            SURVIVOR: "SURVIVOR";
            RELAY: "RELAY";
            BLIND: "BLIND";
        }>>;
        teamId: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const challengeIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const createTeamSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodString;
        description: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const teamIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const joinTeamSchema: z.ZodObject<{
    params: z.ZodObject<{
        inviteCode: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const logProgressSchema: z.ZodObject<{
    body: z.ZodObject<{
        challengeId: z.ZodString;
        value: z.ZodCoercedNumber<unknown>;
        isSuccess: z.ZodDefault<z.ZodBoolean>;
        note: z.ZodOptional<z.ZodString>;
        date: z.ZodOptional<z.ZodCoercedDate<unknown>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const progressParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        challengeId: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const updateUserSchema: z.ZodObject<{
    body: z.ZodObject<{
        name: z.ZodOptional<z.ZodString>;
        avatarUrl: z.ZodNullable<z.ZodOptional<z.ZodString>>;
    }, z.core.$strip>;
}, z.core.$strip>;
export declare const userIdParamSchema: z.ZodObject<{
    params: z.ZodObject<{
        id: z.ZodString;
    }, z.core.$strip>;
}, z.core.$strip>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type CreateChallengeInput = z.infer<typeof createChallengeSchema>;
export type CreateTeamInput = z.infer<typeof createTeamSchema>;
export type LogProgressInput = z.infer<typeof logProgressSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
//# sourceMappingURL=index.d.ts.map