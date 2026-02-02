import prisma from '../utils/prisma';

// ============================================
// TYPES
// ============================================

export type AnalyticsEventType =
    | 'user_registered'
    | 'user_login'
    | 'challenge_created'
    | 'challenge_joined'
    | 'challenge_left'
    | 'progress_logged'
    | 'team_created'
    | 'team_joined'
    | 'team_left'
    | 'level_up'
    | 'milestone_reached'
    | 'app_open'
    | 'screen_view';

export interface AnalyticsEvent {
    type: AnalyticsEventType;
    userId?: string;
    properties?: Record<string, any>;
    timestamp?: Date;
}

export interface AnalyticsStats {
    totalUsers: number;
    activeUsersToday: number;
    activeUsersWeek: number;
    totalChallenges: number;
    activeChallenges: number;
    totalProgressLogs: number;
    progressLogsToday: number;
}

// ============================================
// ANALYTICS SERVICE
// ============================================

export class AnalyticsService {
    /**
     * Track an analytics event
     */
    static async track(event: AnalyticsEvent): Promise<void> {
        try {
            await prisma.analyticsEvent.create({
                data: {
                    type: event.type,
                    userId: event.userId,
                    properties: event.properties || {},
                    timestamp: event.timestamp || new Date(),
                },
            });
        } catch (error) {
            // Don't fail the request if analytics fails
            console.error('Analytics tracking error:', error);
        }
    }

    /**
     * Track multiple events in batch
     */
    static async trackBatch(events: AnalyticsEvent[]): Promise<void> {
        try {
            await prisma.analyticsEvent.createMany({
                data: events.map((e) => ({
                    type: e.type,
                    userId: e.userId,
                    properties: e.properties || {},
                    timestamp: e.timestamp || new Date(),
                })),
            });
        } catch (error) {
            console.error('Analytics batch tracking error:', error);
        }
    }

    /**
     * Get dashboard statistics
     */
    static async getStats(): Promise<AnalyticsStats> {
        const now = new Date();
        const todayStart = new Date(now.setHours(0, 0, 0, 0));
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            activeUsersToday,
            activeUsersWeek,
            totalChallenges,
            activeChallenges,
            totalProgressLogs,
            progressLogsToday,
        ] = await Promise.all([
            prisma.user.count(),
            prisma.user.count({
                where: { lastActiveAt: { gte: todayStart } },
            }),
            prisma.user.count({
                where: { lastActiveAt: { gte: weekAgo } },
            }),
            prisma.challenge.count(),
            prisma.challenge.count({
                where: {
                    startDate: { lte: now },
                    endDate: { gte: now },
                },
            }),
            prisma.progressLog.count(),
            prisma.progressLog.count({
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
    static async getEventCounts(
        startDate: Date,
        endDate: Date,
        eventTypes?: AnalyticsEventType[]
    ): Promise<Record<string, number>> {
        const events = await prisma.analyticsEvent.groupBy({
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

        return events.reduce((acc: Record<string, number>, e: { type: string; _count: number }) => {
            acc[e.type] = e._count;
            return acc;
        }, {} as Record<string, number>);
    }

    /**
     * Get user activity timeline
     */
    static async getUserActivity(
        userId: string,
        days: number = 30
    ): Promise<{ date: string; count: number }[]> {
        const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

        const events = await prisma.analyticsEvent.findMany({
            where: {
                userId,
                timestamp: { gte: startDate },
            },
            select: { timestamp: true },
        });

        // Group by date
        const grouped = events.reduce((acc: Record<string, number>, e: { timestamp: Date }) => {
            const date = e.timestamp.toISOString().split('T')[0];
            acc[date] = (acc[date] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        return Object.entries(grouped).map(([date, count]) => ({ date, count: count as number }));
    }

    /**
     * Get challenge engagement metrics
     */
    static async getChallengeEngagement(challengeId: string): Promise<{
        totalParticipants: number;
        activeParticipants: number;
        totalProgressLogs: number;
        averageProgressPerUser: number;
        completionRate: number;
    }> {
        const [participants, progressLogs, challenge] = await Promise.all([
            prisma.challengeParticipant.findMany({
                where: { challengeId },
                select: {
                    userId: true,
                    currentValue: true,
                    isEliminated: true,
                },
            }),
            prisma.progressLog.count({ where: { challengeId } }),
            prisma.challenge.findUnique({
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
