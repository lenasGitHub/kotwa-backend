"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedService = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const prisma_1 = __importDefault(require("../utils/prisma"));
class FeedService {
    /**
     * Get Main Feed for a user
     * Aggregates:
     * 1. Habit Proofs from friends and followed users
     * 2. New Challenge creations by friends
     * 3. (Optional) Badge earnings
     */
    static async getMainFeed(userId, page = 1, limit = 10) {
        const skip = (page - 1) * limit;
        // 1. Get List of User IDs to fetch feed from (Friends & Following)
        const following = await prisma_1.default.follow.findMany({
            where: { followerId: userId },
            select: { followingId: true },
        });
        const friends = await prisma_1.default.friendship.findMany({
            where: {
                OR: [{ userId }, { friendId: userId }],
                status: 'ACCEPTED'
            },
        });
        const friendIds = friends.map(f => f.userId === userId ? f.friendId : f.userId);
        const followingIds = following.map(f => f.followingId);
        const targetUserIds = [...new Set([...friendIds, ...followingIds, userId])]; // Include self? Maybe not. Let's include self for testing.
        // 2. Fetch Activities (HabitProofs for now, can expand to Challenges)
        // Prisma doesn't support Union queries easily, so we fetch Proofs primarily as they are the main "content"
        const proofs = await prisma_1.default.habitProof.findMany({
            where: {
                userId: { in: targetUserIds },
                status: 'APPROVED', // Only show approved proofs? or PENDING too? Let's show all for now or Approved. Socially, pending might be fun to vote on.
                // Let's show PENDING too so friends can vote.
            },
            include: {
                user: { select: { id: true, username: true, avatarUrl: true, level: true } },
                habit: { select: { id: true, title: true, category: { select: { mountainIcon: true } } } },
                _count: { select: { votes: true, reactions: true } },
                reactions: {
                    where: { userId },
                    select: { type: true }
                }
            },
            orderBy: { createdAt: 'desc' },
            skip,
            take: limit,
        });
        // Transform for Feed Response
        const feedItems = proofs.map(proof => ({
            type: 'PROOF',
            id: proof.id,
            user: proof.user,
            title: `completed a session of ${proof.habit.title}`,
            habitIcon: proof.habit.category.mountainIcon,
            imageUrl: proof.imageUrl,
            createdAt: proof.createdAt,
            stats: {
                votes: proof._count.votes,
                reactions: proof._count.reactions,
            },
            userReaction: proof.reactions[0]?.type || null, // Did current user react?
        }));
        return {
            data: feedItems,
            pagination: {
                page,
                limit,
                hasMore: feedItems.length === limit,
            }
        };
    }
    /**
     * React to an activity (Proof)
     */
    static async reactToProof(userId, proofId, type) {
        // Validate type
        const validTypes = ['HEART', 'FIRE', 'MUSCLE', 'CLAP'];
        if (!validTypes.includes(type)) {
            throw new error_middleware_1.AppError('Invalid reaction type', 400);
        }
        // Toggle logic: If exists with same type, remove it. If different, update it.
        const existing = await prisma_1.default.reaction.findUnique({
            where: {
                userId_proofId: { userId, proofId }
            }
        });
        if (existing) {
            if (existing.type === type) {
                // Remove (Toggle OFF)
                await prisma_1.default.reaction.delete({
                    where: { id: existing.id }
                });
                return { action: 'REMOVED' };
            }
            else {
                // Update
                const updated = await prisma_1.default.reaction.update({
                    where: { id: existing.id },
                    data: { type }
                });
                return { action: 'UPDATED', reaction: updated };
            }
        }
        // Create
        const newReaction = await prisma_1.default.reaction.create({
            data: {
                userId,
                proofId,
                type
            }
        });
        return { action: 'CREATED', reaction: newReaction };
    }
}
exports.FeedService = FeedService;
//# sourceMappingURL=feed.service.js.map