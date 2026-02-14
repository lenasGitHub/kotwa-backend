export declare class FocusService {
    /**
     * Start a new Focus Session
     */
    static startSession(userId: string, habitId?: string, challengeId?: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        challengeId: string | null;
        status: string;
        habitId: string | null;
        startTime: Date;
        endTime: Date | null;
        duration: number;
    }>;
    /**
     * Pause a Session
     */
    static pauseSession(userId: string, sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        challengeId: string | null;
        status: string;
        habitId: string | null;
        startTime: Date;
        endTime: Date | null;
        duration: number;
    }>;
    /**
     * Resume a Session
     */
    static resumeSession(userId: string, sessionId: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        challengeId: string | null;
        status: string;
        habitId: string | null;
        startTime: Date;
        endTime: Date | null;
        duration: number;
    }>;
    /**
     * End Session and Log Progress
     */
    static endSession(userId: string, sessionId: string, actualDurationSeconds: number): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        challengeId: string | null;
        status: string;
        habitId: string | null;
        startTime: Date;
        endTime: Date | null;
        duration: number;
    }>;
}
//# sourceMappingURL=focus.service.d.ts.map