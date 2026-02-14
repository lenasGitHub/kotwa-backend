"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChallengeError = exports.ChallengeService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
// ============================================
// CHALLENGE SERVICE
// ============================================
class ChallengeService {
    /**
     * Create a new challenge
     */
    static async createChallenge(input) {
        const { creatorId, title, description, type, category, targetGoal, thresholdPct, maxHearts, startDate, endDate, teamId, isPublic, } = input;
        const challenge = await prisma_1.default.challenge.create({
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
        await prisma_1.default.challengeParticipant.create({
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
    static async listChallenges(filters) {
        const { category, type, teamId, userId } = filters;
        return prisma_1.default.challenge.findMany({
            where: {
                OR: [
                    { isPublic: true },
                    { creatorId: userId },
                    { teamId: teamId },
                ],
                ...(category && { category: category }),
                ...(type && { type: type }),
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
    static async getChallengeDetails(challengeId) {
        const challenge = await prisma_1.default.challenge.findUnique({
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
            const totalValue = challenge.participants.reduce((sum, p) => sum + p.currentValue, 0);
            teamProgress = Math.min(totalValue / challenge.targetGoal, 1);
        }
        return { challenge, teamProgress };
    }
    /**
     * Join a challenge
     */
    static async joinChallenge(userId, challengeId) {
        const challenge = await prisma_1.default.challenge.findUnique({
            where: { id: challengeId },
            select: { maxHearts: true },
        });
        if (!challenge) {
            throw new ChallengeError('Challenge not found', 404);
        }
        // Check if already joined
        const existing = await prisma_1.default.challengeParticipant.findUnique({
            where: {
                userId_challengeId: { userId, challengeId },
            },
        });
        if (existing) {
            throw new ChallengeError('Already joined this challenge', 400);
        }
        return prisma_1.default.challengeParticipant.create({
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
    static async leaveChallenge(userId, challengeId) {
        await prisma_1.default.challengeParticipant.delete({
            where: {
                userId_challengeId: { userId, challengeId },
            },
        });
    }
    /**
     * Get challenge leaderboard
     */
    static async getLeaderboard(challengeId) {
        const participants = await prisma_1.default.challengeParticipant.findMany({
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
exports.ChallengeService = ChallengeService;
// ============================================
// ERROR CLASS
// ============================================
class ChallengeError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'ChallengeError';
    }
}
exports.ChallengeError = ChallengeError;
//# sourceMappingURL=challenge.service.js.map