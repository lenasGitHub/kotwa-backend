export interface QueuedMessage {
    id: string;
    userId: string;
    event: string;
    data: any;
    createdAt: Date;
    expiresAt: Date;
}
export declare class MessageQueueService {
    /**
     * Queue a message for an offline user
     * Messages are stored in Redis and delivered when user reconnects
     */
    static queueMessage(userId: string, event: string, data: any, ttlSeconds?: number): Promise<string | null>;
    /**
     * Get all pending messages for a user
     */
    static getPendingMessages(userId: string): Promise<QueuedMessage[]>;
    /**
     * Clear all pending messages for a user (called after delivery)
     */
    static clearMessages(userId: string): Promise<void>;
    /**
     * Remove a specific message by ID
     */
    static removeMessage(userId: string, messageId: string): Promise<void>;
    /**
     * Get queue statistics (for monitoring)
     */
    static getStats(): Promise<{
        totalQueued: number;
        usersWithMessages: number;
    }>;
}
//# sourceMappingURL=messageQueue.service.d.ts.map