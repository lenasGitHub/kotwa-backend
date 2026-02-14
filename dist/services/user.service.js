"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserService = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const prisma_1 = __importDefault(require("../utils/prisma"));
class UserService {
    static async getProfile(userId, targetId) {
        const idToFetch = targetId || userId;
        const user = await prisma_1.default.user.findUnique({
            where: { id: idToFetch },
            include: {
                badges: true,
                _count: {
                    select: {
                        followers: true,
                        following: true,
                        friends: { where: { status: 'ACCEPTED' } }, // Connections
                    },
                },
            },
        });
        if (!user)
            throw new error_middleware_1.AppError('User not found', 404);
        // Privacy Check
        if (userId !== idToFetch && !user.isPublic) {
            // Check if they are friends, if not, throw error or limit fields
            // For now, adhering to "I can see only public profiles" strictly:
            throw new error_middleware_1.AppError('This profile is private', 403);
        }
        // Check if current user follows them
        const isFollowing = await prisma_1.default.follow.findUnique({
            where: {
                followerId_followingId: {
                    followerId: userId,
                    followingId: idToFetch,
                },
            },
        });
        const { password, ...userWithoutPassword } = user;
        return {
            ...userWithoutPassword,
            stats: {
                followers: user._count.followers,
                following: user._count.following,
                connections: user._count.friends,
            },
            isFollowing: !!isFollowing,
        };
    }
    static async getUserStats(userId) {
        // 1. Check if user is public (or friend/same user)
        // For now, assuming if I can get their profile via existing endpoints, I can get their stats.
        // The controller should handle checking permissions if strict.
        // Calculate aggregated stats
        const totalXP = await prisma_1.default.user.findUnique({
            where: { id: userId },
            select: { xp: true, level: true, totalAchievements: true },
        });
        if (!totalXP) {
            throw new error_middleware_1.AppError('User not found', 404);
        }
        const completedHabits = await prisma_1.default.habitProof.count({
            where: {
                userId,
                status: 'APPROVED',
            },
        });
        const joinedHabitsCount = await prisma_1.default.habit.count({
            where: {
                joinedUsers: {
                    some: { id: userId },
                },
            },
        });
        // Recent Activity (Approals)
        const recentActivity = await prisma_1.default.habitProof.findMany({
            where: {
                userId,
                status: 'APPROVED',
            },
            orderBy: { createdAt: 'desc' },
            take: 5,
            include: {
                habit: {
                    select: { title: true, category: { select: { mountainIcon: true } } },
                },
            },
        });
        return {
            userId,
            xp: totalXP?.xp || 0,
            level: totalXP?.level || 1,
            totalAchievements: totalXP?.totalAchievements || 0,
            completedProofs: completedHabits,
            activeHabits: joinedHabitsCount,
            recentActivity: recentActivity.map((a) => ({
                id: a.id,
                habitTitle: a.habit.title,
                icon: a.habit.category.mountainIcon,
                timestamp: a.createdAt,
            })),
        };
    }
    static async updateProfile(userId, data) {
        // Unique Check
        if (data.username) {
            const existing = await prisma_1.default.user.findUnique({
                where: { username: data.username },
            });
            if (existing && existing.id !== userId) {
                throw new error_middleware_1.AppError('Username already taken', 409);
            }
        }
        return await prisma_1.default.user.update({
            where: { id: userId },
            data,
        });
    }
    static async getAllUsers(filter, options) {
        const { page, limit } = options;
        const skip = (page - 1) * limit;
        const where = {};
        if (filter.username) {
            where.username = { contains: filter.username };
        }
        if (filter.email) {
            where.email = { contains: filter.email };
        }
        const [users, total] = await Promise.all([
            prisma_1.default.user.findMany({
                where,
                skip,
                take: limit,
                select: {
                    id: true,
                    username: true,
                    email: true,
                    avatarUrl: true,
                    isPublic: true,
                    level: true,
                    totalAchievements: true,
                },
            }),
            prisma_1.default.user.count({ where }),
        ]);
        return {
            users,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit),
            },
        };
    }
}
exports.UserService = UserService;
//# sourceMappingURL=user.service.js.map