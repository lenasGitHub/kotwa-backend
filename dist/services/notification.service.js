"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationTemplates = exports.NotificationService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
const firebase_1 = require("../config/firebase");
// ============================================
// NOTIFICATION SERVICE
// ============================================
class NotificationService {
    /**
     * Register a device token for push notifications
     */
    static async registerDevice(userId, token, platform) {
        await prisma_1.default.deviceToken.upsert({
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
    static async unregisterDevice(token) {
        await prisma_1.default.deviceToken.delete({
            where: { token },
        }).catch(() => {
            // Ignore if token doesn't exist
        });
    }
    /**
     * Send push notification to a specific user
     */
    static async sendToUser(userId, payload) {
        if (!(0, firebase_1.isFirebaseInitialized)()) {
            console.warn('Push notifications disabled - Firebase not initialized');
            return { success: false, successCount: 0, failureCount: 0, errors: ['Firebase not initialized'] };
        }
        const tokens = await prisma_1.default.deviceToken.findMany({
            where: { userId },
            select: { token: true },
        });
        if (tokens.length === 0) {
            return { success: false, successCount: 0, failureCount: 0, errors: ['No registered devices'] };
        }
        return this.sendToTokens(tokens.map((t) => t.token), payload);
    }
    /**
     * Send push notification to multiple users
     */
    static async sendToUsers(userIds, payload) {
        if (!(0, firebase_1.isFirebaseInitialized)()) {
            return { success: false, successCount: 0, failureCount: 0, errors: ['Firebase not initialized'] };
        }
        const tokens = await prisma_1.default.deviceToken.findMany({
            where: { userId: { in: userIds } },
            select: { token: true },
        });
        if (tokens.length === 0) {
            return { success: false, successCount: 0, failureCount: 0, errors: ['No registered devices'] };
        }
        return this.sendToTokens(tokens.map((t) => t.token), payload);
    }
    /**
     * Send push notification to all participants of a challenge
     */
    static async sendToChallengeParticipants(challengeId, payload, excludeUserId) {
        const participants = await prisma_1.default.challengeParticipant.findMany({
            where: {
                challengeId,
                ...(excludeUserId && { userId: { not: excludeUserId } }),
            },
            select: { userId: true },
        });
        return this.sendToUsers(participants.map((p) => p.userId), payload);
    }
    /**
     * Send push notification to all team members
     */
    static async sendToTeamMembers(teamId, payload, excludeUserId) {
        const members = await prisma_1.default.teamMember.findMany({
            where: {
                teamId,
                ...(excludeUserId && { userId: { not: excludeUserId } }),
            },
            select: { userId: true },
        });
        return this.sendToUsers(members.map((m) => m.userId), payload);
    }
    /**
     * Send notification to specific device tokens
     */
    static async sendToTokens(tokens, payload) {
        const admin = (0, firebase_1.getFirebaseAdmin)();
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
            const invalidTokens = [];
            response.responses.forEach((resp, idx) => {
                if (!resp.success && resp.error?.code === 'messaging/invalid-registration-token') {
                    invalidTokens.push(tokens[idx]);
                }
            });
            if (invalidTokens.length > 0) {
                await prisma_1.default.deviceToken.deleteMany({
                    where: { token: { in: invalidTokens } },
                });
            }
            return {
                success: response.successCount > 0,
                successCount: response.successCount,
                failureCount: response.failureCount,
            };
        }
        catch (error) {
            console.error('Failed to send push notification:', error);
            return {
                success: false,
                successCount: 0,
                failureCount: tokens.length,
                errors: [error.message],
            };
        }
    }
}
exports.NotificationService = NotificationService;
// ============================================
// PRE-BUILT NOTIFICATION TEMPLATES
// ============================================
exports.NotificationTemplates = {
    challengeProgress: (challengeTitle, userName, value) => ({
        title: 'Challenge Update! 🎯',
        body: `${userName} logged ${value} progress on "${challengeTitle}"`,
        data: { type: 'challenge_progress' },
    }),
    challengeMilestone: (challengeTitle, milestone) => ({
        title: 'Milestone Reached! 🏆',
        body: `"${challengeTitle}" hit ${milestone}!`,
        data: { type: 'challenge_milestone' },
    }),
    teamJoined: (teamName, userName) => ({
        title: 'New Team Member! 👋',
        body: `${userName} joined "${teamName}"`,
        data: { type: 'team_joined' },
    }),
    levelUp: (newLevel) => ({
        title: 'Level Up! 🚀',
        body: `Congratulations! You've reached level ${newLevel}!`,
        data: { type: 'level_up', level: String(newLevel) },
    }),
    challengeReminder: (challengeTitle) => ({
        title: 'Don\'t forget! ⏰',
        body: `Log your progress for "${challengeTitle}" today`,
        data: { type: 'challenge_reminder' },
    }),
};
//# sourceMappingURL=notification.service.js.map