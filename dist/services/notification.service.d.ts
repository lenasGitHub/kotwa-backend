export interface PushNotificationPayload {
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
}
export interface SendResult {
    success: boolean;
    successCount: number;
    failureCount: number;
    errors?: string[];
}
export declare class NotificationService {
    /**
     * Register a device token for push notifications
     */
    static registerDevice(userId: string, token: string, platform: 'ios' | 'android' | 'web'): Promise<void>;
    /**
     * Remove a device token
     */
    static unregisterDevice(token: string): Promise<void>;
    /**
     * Send push notification to a specific user
     */
    static sendToUser(userId: string, payload: PushNotificationPayload): Promise<SendResult>;
    /**
     * Send push notification to multiple users
     */
    static sendToUsers(userIds: string[], payload: PushNotificationPayload): Promise<SendResult>;
    /**
     * Send push notification to all participants of a challenge
     */
    static sendToChallengeParticipants(challengeId: string, payload: PushNotificationPayload, excludeUserId?: string): Promise<SendResult>;
    /**
     * Send push notification to all team members
     */
    static sendToTeamMembers(teamId: string, payload: PushNotificationPayload, excludeUserId?: string): Promise<SendResult>;
    /**
     * Send notification to specific device tokens
     */
    private static sendToTokens;
}
export declare const NotificationTemplates: {
    challengeProgress: (challengeTitle: string, userName: string, value: number) => {
        title: string;
        body: string;
        data: {
            type: string;
        };
    };
    challengeMilestone: (challengeTitle: string, milestone: string) => {
        title: string;
        body: string;
        data: {
            type: string;
        };
    };
    teamJoined: (teamName: string, userName: string) => {
        title: string;
        body: string;
        data: {
            type: string;
        };
    };
    levelUp: (newLevel: number) => {
        title: string;
        body: string;
        data: {
            type: string;
            level: string;
        };
    };
    challengeReminder: (challengeTitle: string) => {
        title: string;
        body: string;
        data: {
            type: string;
        };
    };
};
//# sourceMappingURL=notification.service.d.ts.map