export interface CreateChallengeInput {
    creatorId: string;
    title: string;
    description?: string;
    type: 'COOP' | 'THRESHOLD' | 'SURVIVOR' | 'RELAY' | 'BLIND';
    category: 'HEALTH' | 'SPIRITUAL' | 'PRODUCTIVITY' | 'MENTAL' | 'FINANCE' | 'SOCIAL';
    targetGoal: number;
    thresholdPct?: number;
    maxHearts?: number;
    startDate: Date;
    endDate: Date;
    teamId?: string;
    isPublic?: boolean;
}
export interface ChallengeFilters {
    category?: string;
    type?: string;
    teamId?: string;
    userId: string;
}
export interface ChallengeWithDetails {
    challenge: any;
    teamProgress?: number;
}
export interface LeaderboardEntry {
    rank: number;
    userId: string;
    name: string;
    avatarUrl: string | null;
    level: number;
    value: number;
    isEliminated: boolean;
    heartsLeft: number | null;
}
export declare class ChallengeService {
    /**
     * Create a new challenge
     */
    static createChallenge(input: CreateChallengeInput): Promise<any>;
    /**
     * List challenges based on filters
     */
    static listChallenges(filters: ChallengeFilters): Promise<any[]>;
    /**
     * Get challenge details with team progress
     */
    static getChallengeDetails(challengeId: string): Promise<ChallengeWithDetails>;
    /**
     * Join a challenge
     */
    static joinChallenge(userId: string, challengeId: string): Promise<any>;
    /**
     * Leave a challenge
     */
    static leaveChallenge(userId: string, challengeId: string): Promise<void>;
    /**
     * Get challenge leaderboard
     */
    static getLeaderboard(challengeId: string): Promise<LeaderboardEntry[]>;
}
export declare class ChallengeError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
//# sourceMappingURL=challenge.service.d.ts.map