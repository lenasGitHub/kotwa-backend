"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnalyticsService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
// ============================================
// ANALYTICS SERVICE
// ============================================
class AnalyticsService {
    /**
     * Track an analytics event
     */
    static async track(event) {
        try {
            await prisma_1.default.analyticsEvent.create({
                data: {
                    type: event.type,
                    userId: event.userId,
                    properties: event.properties || {},
                    timestamp: event.timestamp || new Date(),
                },
            });
        }
        catch (error) {
            // Don't fail the request if analytics fails
            console.error('Analytics tracking error:', error);
        }
    }
    /**
     * Track multiple events in batch
     */
    static async trackBatch(events) {
        try {
            await prisma_1.default.analyticsEvent.createMany({
                data: events.map((e) => ({
                    type: e.type,
                    userId: e.userId,
                    properties: e.properties || {},
                    timestamp: e.timestamp || new Date(),
                })),
            });
        }
        catch (error) {
            console.error('Analytics batch tracking error:', error);
        }
    }
    /**
     * Get dashboard statistics
     */
    static async getStats() {
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const [totalUsers, activeUsersToday, activeUsersWeek, totalChallenges, activeChallenges, totalProgressLogs, progressLogsToday,] = await Promise.all([
            prisma_1.default.user.count(),
            prisma_1.default.user.count({
                where: { lastActiveAt: { gte: todayStart } },
            }),
            prisma_1.default.user.count({
                where: { lastActiveAt: { gte: weekAgo } },
            }),
            prisma_1.default.challenge.count(),
            prisma_1.default.challenge.count({
                where: {
                    startDate: { lte: now },
                    endDate: { gte: now },
                },
            }),
            prisma_1.default.progressLog.count(),
            prisma_1.default.progressLog.count({
                where: { createdAt: { gte: todayStart } },
            }),
        ]);
        return {
            totalUsers,
            activeUsersToday,
            activeUsersWeek,
            totalChallenges,
            activeChallenges,
            totalProgressLogs,
            progressLogsToday,
        };
    }
    /**
     * Get event counts by type for a date range
     */
    static async getEventCounts(startDate, endDate, eventTypes) {
        const events = await prisma_1.default.analyticsEvent.groupBy({
            by: ['type'],
            where: {
                timestamp: {
                    gte: startDate,
                    lte: endDate,
                },
                ...(eventTypes && { type: { in: eventTypes } }),
            },
            _count: true,
        });
        return events.reduce((acc, e) => {
            acc[e.type] = e._count;
            return acc;
        }, {});
    }
    /**
     * Get user activity timeline
     */
    static async getUserActivity(userId, days = 30) {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
        const events = await prisma_1.default.analyticsEvent.findMany({
            where: {
                userId,
                timestamp: { gte: startDate },
            },
            select: { timestamp: true },
        });
        // Group by date
        const grouped = events.reduce((acc, e) => {
            const date = e.timestamp.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {});
        return Object.entries(grouped).map(([date, count]) => ({ date, count: count }));
    }
    /**
     * Get challenge engagement metrics
     */
    static async getChallengeEngagement(challengeId) {
        const [participants, progressLogs, challenge] = await Promise.all([
            prisma_1.default.challengeParticipant.findMany({
                where: { challengeId },
                select: {
                    userId: true,
                    currentValue: true,
                    isEliminated: true,
                },
            }),
            prisma_1.default.progressLog.count({ where: { challengeId } }),
            prisma_1.default.challenge.findUnique({
                where: { id: challengeId },
                select: { targetGoal: true },
            }),
        ]);
        const totalParticipants = participants.length;
        const activeParticipants = participants.filter((p) => !p.isEliminated).length;
        const totalProgress = participants.reduce((sum, p) => sum + p.currentValue, 0);
        const averageProgressPerUser = totalParticipants > 0 ? totalProgress / totalParticipants : 0;
        const completedCount = challenge
            ? participants.filter((p) => p.currentValue >= challenge.targetGoal).length
            : 0;
        const completionRate = totalParticipants > 0 ? completedCount / totalParticipants : 0;
        return {
            totalParticipants,
            activeParticipants,
            totalProgressLogs: progressLogs,
            averageProgressPerUser,
            completionRate,
        };
    }
}
exports.AnalyticsService = AnalyticsService;
//# sourceMappingURL=analytics.service.js.map