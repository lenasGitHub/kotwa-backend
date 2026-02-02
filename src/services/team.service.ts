import prisma from '../utils/prisma';

// ============================================
// TYPES
// ============================================

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
    _count?: { challenges: number };
}

// ============================================
// TEAM SERVICE
// ============================================

export class TeamService {
    /**
     * Create a new team
     */
    static async createTeam(input: CreateTeamInput): Promise<TeamWithMembers> {
        const { creatorId, name, description, avatarUrl } = input;

        const team = await prisma.team.create({
            data: {
                name,
                description,
                avatarUrl,
                members: {
                    create: {
                        userId: creatorId,
                        role: 'admin',
                    },
                },
            },
            include: {
                members: {
                    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
                },
            },
        });

        return team;
    }

    /**
     * List teams for a user
     */
    static async listUserTeams(userId: string): Promise<TeamWithMembers[]> {
        return prisma.team.findMany({
            where: {
                members: { some: { userId } },
            },
            include: {
                members: {
                    include: { user: { select: { id: true, name: true, avatarUrl: true } } },
                },
                _count: { select: { challenges: true } },
            },
        });
    }

    /**
     * Get team details
     */
    static async getTeamDetails(teamId: string): Promise<TeamWithMembers> {
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: {
                members: {
                    include: { user: { select: { id: true, name: true, avatarUrl: true, currentLevel: true } } },
                },
                challenges: {
                    select: { id: true, title: true, type: true, startDate: true, endDate: true },
                },
            },
        });

        if (!team) {
            throw new TeamError('Team not found', 404);
        }

        return team;
    }

    /**
     * Join team via invite code
     */
    static async joinTeam(userId: string, inviteCode: string): Promise<{ teamId: string }> {
        const team = await prisma.team.findUnique({
            where: { inviteCode },
        });

        if (!team) {
            throw new TeamError('Invalid invite code', 404);
        }

        // Check if already a member
        const existing = await prisma.teamMember.findUnique({
            where: {
                userId_teamId: { userId, teamId: team.id },
            },
        });

        if (existing) {
            throw new TeamError('Already a member of this team', 400);
        }

        await prisma.teamMember.create({
            data: {
                userId,
                teamId: team.id,
                role: 'member',
            },
        });

        return { teamId: team.id };
    }

    /**
     * Leave a team
     */
    static async leaveTeam(userId: string, teamId: string): Promise<void> {
        await prisma.teamMember.delete({
            where: {
                userId_teamId: { userId, teamId },
            },
        });
    }
}

// ============================================
// ERROR CLASS
// ============================================

export class TeamError extends Error {
    constructor(
        message: string,
        public statusCode: number = 400
    ) {
        super(message);
        this.name = 'TeamError';
    }
}
