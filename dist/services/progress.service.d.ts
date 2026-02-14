export interface LogProgressInput {
    userId: string;
    challengeId: string;
    value: number;
    isSuccess?: boolean;
    note?: string;
    date?: Date;
}
export interface ProgressResult {
    progressLog: any;
    totalValue: number;
    xpGained: number;
}
export interface UserProgress {
    logs: any[];
    totalValue: number;
    heartsLeft: number | null;
    isEliminated: boolean;
}
export interface CalendarEntry {
    date: string;
    value: number;
    isSuccess: boolean;
}
export declare class ProgressService {
    /**
     * Log progress for a challenge
     */
    static logProgress(input: LogProgressInput): Promise<ProgressResult>;
    /**
     * Get user's progress logs for a challenge
     */
    static getUserProgress(userId: string, challengeId: string): Promise<UserProgress>;
    /**
     * Get calendar view data for a challenge
     */
    static getCalendarData(userId: string, challengeId: string): Promise<CalendarEntry[]>;
    /**
     * Emit real-time progress update via Socket.IO
     */
    private static emitProgressUpdate;
}
export declare class ProgressError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
//# sourceMappingURL=progress.service.d.ts.map