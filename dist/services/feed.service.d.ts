export declare class FeedService {
    /**
     * Get Main Feed for a user
     * Aggregates:
     * 1. Habit Proofs from friends and followed users
     * 2. New Challenge creations by friends
     * 3. (Optional) Badge earnings
     */
    static getMainFeed(userId: string, page?: number, limit?: number): Promise<{
        data: {
            type: string;
            id: string;
            user: {
                username: string;
                id: string;
                avatarUrl: string | null;
                level: number;
            };
            title: string;
            habitIcon: string;
            imageUrl: string | null;
            createdAt: Date;
            stats: {
                votes: number;
                reactions: number;
            };
            userReaction: string | null;
        }[];
        pagination: {
            page: number;
            limit: number;
            hasMore: boolean;
        };
    }>;
    /**
     * React to an activity (Proof)
     */
    static reactToProof(userId: string, proofId: string, type: string): Promise<{
        action: string;
        reaction?: undefined;
    } | {
        action: string;
        reaction: {
            id: string;
            createdAt: Date;
            userId: string;
            type: string;
            proofId: string;
        };
    }>;
}
//# sourceMappingURL=feed.service.d.ts.map