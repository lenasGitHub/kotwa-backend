export interface CreateTeamInput {
    creatorId: string;
    name: string;
    description?: string;
    avatarUrl?: string;
}
export interface TeamWithMembers {
    id: string;
    name: string;
    description: string | null;
    avatarUrl: string | null;
    inviteCode: string;
    members: any[];
    _count?: {
        challenges: number;
    };
}
export declare class TeamService {
    /**
     * Create a new team
     */
    static createTeam(input: CreateTeamInput): Promise<TeamWithMembers>;
    /**
     * List teams for a user
     */
    static listUserTeams(userId: string): Promise<TeamWithMembers[]>;
    /**
     * Get team details
     */
    static getTeamDetails(teamId: string): Promise<TeamWithMembers>;
    /**
     * Join team via invite code
     */
    static joinTeam(userId: string, inviteCode: string): Promise<{
        teamId: string;
    }>;
    /**
     * Leave a team
     */
    static leaveTeam(userId: string, teamId: string): Promise<void>;
}
export declare class TeamError extends Error {
    statusCode: number;
    constructor(message: string, statusCode?: number);
}
//# sourceMappingURL=team.service.d.ts.map