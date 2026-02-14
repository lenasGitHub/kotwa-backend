"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserChallenges = exports.getChallengeLeaderboard = exports.leaveChallenge = exports.joinChallenge = exports.getChallengeById = exports.getChallenges = exports.createChallenge = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const prisma_1 = __importDefault(require("../utils/prisma"));
const createChallenge = async (req, res, next) => {
    try {
        const { title, description, type, category, targetGoal, thresholdPct, maxHearts, startDate, endDate, teamId, isPublic, } = req.body;
        if (!title || !type || !category || !targetGoal || !startDate || !endDate) {
            throw new error_middleware_1.AppError('Missing required fields', 400);
        }
        const challenge = await prisma_1.default.challenge.create({
            data: {
                title,
                description: description || '',
                type,
                category,
                targetGoal: parseFloat(targetGoal),
                thresholdPct: thresholdPct ? parseFloat(thresholdPct) : null,
                maxHearts: maxHearts ? parseInt(maxHearts, 10) : null,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
                creatorId: req.userId,
                teamId: teamId || null,
                isPublic: isPublic || false,
            },
        });
        // Auto-join creator as first participant
        await prisma_1.default.challengeParticipant.create({
            data: {
                userId: req.userId,
                challengeId: challenge.id,
                heartsLeft: maxHearts || null,
            },
        });
        res.status(201).json({ success: true, data: challenge });
    }
    catch (error) {
        next(error);
    }
};
exports.createChallenge = createChallenge;
const getChallenges = async (req, res, next) => {
    try {
        const { category, type, teamId } = req.query;
        const normalizedCategory = category
            ? category.toUpperCase()
            : undefined;
        const normalizedType = type ? type.toUpperCase() : undefined;
        const challenges = await prisma_1.default.challenge.findMany({
            where: {
                OR: [
                    { isPublic: true },
                    { creatorId: req.userId },
                    { teamId: teamId },
                ],
                ...(normalizedCategory && { category: normalizedCategory }),
                ...(normalizedType && { type: normalizedType }),
            },
            include: {
                creator: { select: { id: true, username: true, avatarUrl: true } },
                participants: {
                    select: {
                        userId: true,
                        currentValue: true,
                        user: { select: { username: true, avatarUrl: true } },
                    },
                },
                _count: { select: { participants: true } },
            },
            orderBy: { startDate: 'desc' },
        });
        res.json({ success: true, data: challenges });
    }
    catch (error) {
        next(error);
    }
};
exports.getChallenges = getChallenges;
const getChallengeById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const challenge = await prisma_1.default.challenge.findUnique({
            where: { id },
            include: {
                creator: { select: { id: true, username: true, avatarUrl: true } },
                team: { select: { id: true, name: true } },
                participants: {
                    include: {
                        user: { select: { id: true, username: true, avatarUrl: true } },
                    },
                    orderBy: { currentValue: 'desc' },
                },
            },
        });
        if (!challenge) {
            throw new error_middleware_1.AppError('Challenge not found', 404);
        }
        // Calculate team progress for COOP challenges
        let teamProgress = 0;
        if (challenge.type === 'COOP') {
            const totalValue = challenge.participants.reduce((sum, p) => sum + p.currentValue, 0);
            teamProgress = Math.min(totalValue / challenge.targetGoal, 1);
        }
        res.json({
            success: true,
            data: { ...challenge, teamProgress },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getChallengeById = getChallengeById;
const joinChallenge = async (req, res, next) => {
    try {
        const { id } = req.params;
        const challenge = await prisma_1.default.challenge.findUnique({
            where: { id },
            select: { maxHearts: true },
        });
        if (!challenge) {
            throw new error_middleware_1.AppError('Challenge not found', 404);
        }
        // Check if already joined
        const existing = await prisma_1.default.challengeParticipant.findUnique({
            where: {
                userId_challengeId: { userId: req.userId, challengeId: id },
            },
        });
        if (existing) {
            throw new error_middleware_1.AppError('Already joined this challenge', 400);
        }
        const participant = await prisma_1.default.challengeParticipant.create({
            data: {
                userId: req.userId,
                challengeId: id,
                heartsLeft: challenge.maxHearts || null,
            },
        });
        res.status(201).json({ success: true, data: participant });
    }
    catch (error) {
        next(error);
    }
};
exports.joinChallenge = joinChallenge;
const leaveChallenge = async (req, res, next) => {
    try {
        const { id } = req.params;
        await prisma_1.default.challengeParticipant.delete({
            where: {
                userId_challengeId: { userId: req.userId, challengeId: id },
            },
        });
        res.json({ success: true, message: 'Left challenge' });
    }
    catch (error) {
        next(error);
    }
};
exports.leaveChallenge = leaveChallenge;
const getChallengeLeaderboard = async (req, res, next) => {
    try {
        const { id } = req.params;
        const participants = await prisma_1.default.challengeParticipant.findMany({
            where: { challengeId: id },
            include: {
                user: {
                    select: { id: true, username: true, avatarUrl: true, level: true },
                },
            },
            orderBy: { currentValue: 'desc' },
        });
        const leaderboard = participants.map((p, index) => ({
            rank: index + 1,
            userId: p.userId,
            name: p.user.username,
            avatarUrl: p.user.avatarUrl,
            level: p.user.level,
            value: p.currentValue,
            isEliminated: p.isEliminated,
            heartsLeft: p.heartsLeft,
        }));
        res.json({ success: true, data: leaderboard });
    }
    catch (error) {
        next(error);
    }
};
exports.getChallengeLeaderboard = getChallengeLeaderboard;
const getUserChallenges = async (req, res, next) => {
    try {
        const challenges = await prisma_1.default.challengeParticipant.findMany({
            where: { userId: req.userId },
            include: {
                challenge: {
                    include: {
                        creator: { select: { id: true, username: true, avatarUrl: true } },
                        team: { select: { id: true, name: true } },
                        participants: {
                            select: {
                                userId: true,
                                currentValue: true,
                                user: { select: { username: true, avatarUrl: true } },
                            },
                        },
                        _count: { select: { participants: true } },
                    },
                },
            },
            orderBy: { joinedAt: 'desc' },
        });
        // Transform the data to match the expected format
        const formattedChallenges = challenges.map((participant) => ({
            ...participant.challenge,
            userProgress: participant.currentValue,
            userHeartsLeft: participant.heartsLeft,
            userIsEliminated: participant.isEliminated,
            userJoinedAt: participant.joinedAt,
        }));
        res.json({ success: true, data: formattedChallenges });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserChallenges = getUserChallenges;
//# sourceMappingURL=challengeController.js.map