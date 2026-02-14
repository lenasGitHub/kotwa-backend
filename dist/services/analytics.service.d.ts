export type AnalyticsEventType = 'user_registered' | 'user_login' | 'challenge_created' | 'challenge_joined' | 'challenge_left' | 'progress_logged' | 'team_created' | 'team_joined' | 'team_left' | 'level_up' | 'milestone_reached' | 'app_open' | 'screen_view';
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
export declare class AnalyticsService {
    /**
     * Track an analytics event
     */
    static track(event: AnalyticsEvent): Promise<void>;
    /**
     * Track multiple events in batch
     */
    static trackBatch(events: AnalyticsEvent[]): Promise<void>;
    /**
     * Get dashboard statistics
     */
    static getStats(): Promise<AnalyticsStats>;
    /**
     * Get event counts by type for a date range
     */
    static getEventCounts(startDate: Date, endDate: Date, eventTypes?: AnalyticsEventType[]): Promise<Record<string, number>>;
    /**
     * Get user activity timeline
     */
    static getUserActivity(userId: string, days?: number): Promise<{
        date: string;
        count: number;
    }[]>;
    /**
     * Get challenge engagement metrics
     */
    static getChallengeEngagement(challengeId: string): Promise<{
        totalParticipants: number;
        activeParticipants: number;
        totalProgressLogs: number;
        averageProgressPerUser: number;
        completionRate: number;
    }>;
}
//# sourceMappingURL=analytics.service.d.ts.map