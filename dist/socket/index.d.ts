import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
export declare const initializeSocket: (httpServer: HttpServer, useRedis?: boolean) => Server<import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, import("socket.io").DefaultEventsMap, any>;
export declare const getIO: () => Server;
/**
 * Emit to user, queue if offline
 */
export declare const emitToUser: (userId: string, event: string, data: any, queueIfOffline?: boolean) => Promise<boolean>;
export declare const emitChallengeProgress: (challengeId: string, data: {
    userId: string;
    value: number;
    totalValue: number;
}) => void;
export declare const emitChallengeMilestone: (challengeId: string, data: {
    milestone: string;
    teamProgress: number;
}) => void;
export declare const emitUserLevelUp: (userId: string, newLevel: number) => Promise<void>;
//# sourceMappingURL=index.d.ts.map