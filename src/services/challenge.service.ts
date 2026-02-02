import prisma from '../utils/prisma';

// ============================================
// TYPES
// ============================================

export interface CreateChallengeInput {
    creatorId: string;
    title: string;
    description?: string;
    type: 'COOP' | 'THRESHOLD' | 'SURVIVOR' | 'RELAY' | 'BLIND';
    category: 'HEALTH' | 'SPIRITUAL' | 'PRODUCTIVITY' | 'MENTAL' | 'FINANCE' | 'SOCIAL';
    targetGoal: number;
    thresholdPct?: number;
    maxHearts?: number;
    startDate: Date;
    endDate: Date;
    teamId?: string;
    isPublic?: boolean;
}

export interface ChallengeFilters {
    category?: string;
    type?: string;
    teamId?: string;
    userId: string;
}

export interface ChallengeWithDetails {
    challenge: any;
    teamProgress?: number;
}

export interface LeaderboardEntry {
    rank: number;
    userId: string;
    name: string;
    avatarUrl: string | null;
    level: number;
    value: number;
    isEliminated: boolean;
    heartsLeft: number | null;
}

// ============================================
// CHALLENGE SERVICE
// ============================================

export class ChallengeService {
    /**
     * Create a new challenge
     */
    static async createChallenge(input: CreateChallengeInput): Promise<any> {
        const {
            creatorId,
            title,
            description,
            type,
            category,
            targetGoal,
            thresholdPct,
            maxHearts,
            startDate,
            endDate,
            teamId,
            isPublic,
        } = input;

        const challenge = await prisma.challenge.create({
            data: {
                title,
                description: description || '',
                type,
                category,
                targetGoal,
                thresholdPct: thresholdPct ?? null,
                maxHearts: maxHearts ?? null,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                creatorId,
                teamId: teamId || null,
                isPublic: isPublic || false,
            },
        });

        // Auto-join creator as first participant
        await prisma.challengeParticipant.create({
            data: {
                userId: creatorId,
                challengeId: challenge.id,
                heartsLeft: maxHearts || null,
            },
        });

        return challenge;
    }

    /**
     * List challenges based on filters
     */
    static async listChallenges(filters: ChallengeFilters): Promise<any[]> {
        const { category, type, teamId, userId } = filters;

        return prisma.challenge.findMany({
            where: {
                OR: [
                    { isPublic: true },
                    { creatorId: userId },
                    { teamId: teamId },
                ],
                ...(category && { category: category as any }),
                ...(type && { type: type as any }),
            },
            include: {
                creator: { select: { id: true, name: true, avatarUrl: true } },
                participants: {
                    select: {
                        userId: true,
                        currentValue: true,
                        user: { select: { name: true, avatarUrl: true } },
                    },
                },
                _count: { select: { participants: true } },
            },
            orderBy: { startDate: 'desc' },
        });
    }

    /**
     * Get challenge details with team progress
     */
    static async getChallengeDetails(challengeId: string): Promise<ChallengeWithDetails> {
        const challenge = await prisma.challenge.findUnique({
            where: { id: challengeId },
            include: {
                creator: { select: { id: true, name: true, avatarUrl: true } },
                team: { select: { id: true, name: true } },
                participants: {
                    include: {
                        user: { select: { id: true, name: true, avatarUrl: true } },
                    },
                    orderBy: { currentValue: 'desc' },
                },
            },
        });

        if (!challenge) {
            throw new ChallengeError('Challenge not found', 404);
        }

        // Calculate team progress for COOP challenges
        let teamProgress = 0;
        if (challenge.type === 'COOP') {
            const totalValue = challenge.participants.reduce(
                (sum, p) => sum + p.currentValue,
                0
            );
            teamProgress = Math.min(totalValue / challenge.targetGoal, 1);
        }

        return { challenge, teamProgress };
    }

    /**
     * Join a challenge
     */
    static async joinChallenge(userId: string, challengeId: string): Promise<any> {
        const challenge = await prisma.challenge.findUnique({
            where: { id: challengeId },
            select: { maxHearts: true },
        });

        if (!challenge) {
            throw new ChallengeError('Challenge not found', 404);
        }

        // Check if already joined
        const existing = await prisma.challengeParticipant.findUnique({
            where: {
                userId_challengeId: { userId, challengeId },
            },
        });

        if (existing) {
            throw new ChallengeError('Already joined this challenge', 400);
        }

        return prisma.challengeParticipant.create({
            data: {
                userId,
                challengeId,
                heartsLeft: challenge.maxHearts || null,
            },
        });
    }

    /**
     * Leave a challenge
     */
    static async leaveChallenge(userId: string, challengeId: string): Promise<void> {
        await prisma.challengeParticipant.delete({
            where: {
                userId_challengeId: { userId, challengeId },
            },
        });
    }

    /**
     * Get challenge leaderboard
     */
    static async getLeaderboard(challengeId: string): Promise<LeaderboardEntry[]> {
        const participants = await prisma.challengeParticipant.findMany({
            where: { challengeId },
            include: {
                user: { select: { id: true, name: true, avatarUrl: true, currentLevel: true } },
            },
            orderBy: { currentValue: 'desc' },
        });

        return participants.map((p, index) => ({
            rank: index + 1,
            userId: p.userId,
            name: p.user.name,
            avatarUrl: p.user.avatarUrl,
            level: p.user.currentLevel,
            value: p.currentValue,
            isEliminated: p.isEliminated,
            heartsLeft: p.heartsLeft,
        }));
    }
}

// ============================================
// ERROR CLASS
// ============================================

export class ChallengeError extends Error {
    constructor(
        message: string,
        public statusCode: number = 400
    ) {
        super(message);
        this.name = 'ChallengeError';
    }
}
