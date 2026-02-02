import prisma from '../utils/prisma';
import { getFirebaseAdmin, isFirebaseInitialized } from '../config/firebase';

// ============================================
// TYPES
// ============================================

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

// ============================================
// NOTIFICATION SERVICE
// ============================================

export class NotificationService {
    /**
     * Register a device token for push notifications
     */
    static async registerDevice(
        userId: string,
        token: string,
        platform: 'ios' | 'android' | 'web'
    ): Promise<void> {
        await prisma.deviceToken.upsert({
            where: {
                token,
            },
            create: {
                userId,
                token,
                platform,
            },
            update: {
                userId,
                platform,
                updatedAt: new Date(),
            },
        });
    }

    /**
     * Remove a device token
     */
    static async unregisterDevice(token: string): Promise<void> {
        await prisma.deviceToken.delete({
            where: { token },
        }).catch(() => {
            // Ignore if token doesn't exist
        });
    }

    /**
     * Send push notification to a specific user
     */
    static async sendToUser(
        userId: string,
        payload: PushNotificationPayload
    ): Promise<SendResult> {
        if (!isFirebaseInitialized()) {
            console.warn('Push notifications disabled - Firebase not initialized');
            return { success: false, successCount: 0, failureCount: 0, errors: ['Firebase not initialized'] };
        }

        const tokens = await prisma.deviceToken.findMany({
            where: { userId },
            select: { token: true },
        });

        if (tokens.length === 0) {
            return { success: false, successCount: 0, failureCount: 0, errors: ['No registered devices'] };
        }

        return this.sendToTokens(
            tokens.map((t: { token: string }) => t.token),
            payload
        );
    }

    /**
     * Send push notification to multiple users
     */
    static async sendToUsers(
        userIds: string[],
        payload: PushNotificationPayload
    ): Promise<SendResult> {
        if (!isFirebaseInitialized()) {
            return { success: false, successCount: 0, failureCount: 0, errors: ['Firebase not initialized'] };
        }

        const tokens = await prisma.deviceToken.findMany({
            where: { userId: { in: userIds } },
            select: { token: true },
        });

        if (tokens.length === 0) {
            return { success: false, successCount: 0, failureCount: 0, errors: ['No registered devices'] };
        }

        return this.sendToTokens(
            tokens.map((t: { token: string }) => t.token),
            payload
        );
    }

    /**
     * Send push notification to all participants of a challenge
     */
    static async sendToChallengeParticipants(
        challengeId: string,
        payload: PushNotificationPayload,
        excludeUserId?: string
    ): Promise<SendResult> {
        const participants = await prisma.challengeParticipant.findMany({
            where: {
                challengeId,
                ...(excludeUserId && { userId: { not: excludeUserId } }),
            },
            select: { userId: true },
        });

        return this.sendToUsers(
            participants.map((p) => p.userId),
            payload
        );
    }

    /**
     * Send push notification to all team members
     */
    static async sendToTeamMembers(
        teamId: string,
        payload: PushNotificationPayload,
        excludeUserId?: string
    ): Promise<SendResult> {
        const members = await prisma.teamMember.findMany({
            where: {
                teamId,
                ...(excludeUserId && { userId: { not: excludeUserId } }),
            },
            select: { userId: true },
        });

        return this.sendToUsers(
            members.map((m) => m.userId),
            payload
        );
    }

    /**
     * Send notification to specific device tokens
     */
    private static async sendToTokens(
        tokens: string[],
        payload: PushNotificationPayload
    ): Promise<SendResult> {
        const admin = getFirebaseAdmin();
        const messaging = admin.messaging();

        const message = {
            notification: {
                title: payload.title,
                body: payload.body,
                ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
            },
            data: payload.data || {},
            tokens,
        };

        try {
            const response = await messaging.sendEachForMulticast(message);

            // Clean up invalid tokens
            const invalidTokens: string[] = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success && resp.error?.code === 'messaging/invalid-registration-token') {
                    invalidTokens.push(tokens[idx]);
                }
            });

            if (invalidTokens.length > 0) {
                await prisma.deviceToken.deleteMany({
                    where: { token: { in: invalidTokens } },
                });
            }

            return {
                success: response.successCount > 0,
                successCount: response.successCount,
                failureCount: response.failureCount,
            };
        } catch (error) {
            console.error('Failed to send push notification:', error);
            return {
                success: false,
                successCount: 0,
                failureCount: tokens.length,
                errors: [(error as Error).message],
            };
        }
    }
}

// ============================================
// PRE-BUILT NOTIFICATION TEMPLATES
// ============================================

export const NotificationTemplates = {
    challengeProgress: (challengeTitle: string, userName: string, value: number) => ({
        title: 'Challenge Update! 🎯',
        body: `${userName} logged ${value} progress on "${challengeTitle}"`,
        data: { type: 'challenge_progress' },
    }),

    challengeMilestone: (challengeTitle: string, milestone: string) => ({
        title: 'Milestone Reached! 🏆',
        body: `"${challengeTitle}" hit ${milestone}!`,
        data: { type: 'challenge_milestone' },
    }),

    teamJoined: (teamName: string, userName: string) => ({
        title: 'New Team Member! 👋',
        body: `${userName} joined "${teamName}"`,
        data: { type: 'team_joined' },
    }),

    levelUp: (newLevel: number) => ({
        title: 'Level Up! 🚀',
        body: `Congratulations! You've reached level ${newLevel}!`,
        data: { type: 'level_up', level: String(newLevel) },
    }),

    challengeReminder: (challengeTitle: string) => ({
        title: 'Don\'t forget! ⏰',
        body: `Log your progress for "${challengeTitle}" today`,
        data: { type: 'challenge_reminder' },
    }),
};
