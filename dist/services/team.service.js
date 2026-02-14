"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamError = exports.TeamService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
// ============================================
// TEAM SERVICE
// ============================================
class TeamService {
    /**
     * Create a new team
     */
    static async createTeam(input) {
        const { creatorId, name, description, avatarUrl } = input;
        const team = await prisma_1.default.team.create({
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
    static async listUserTeams(userId) {
        return prisma_1.default.team.findMany({
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
    static async getTeamDetails(teamId) {
        const team = await prisma_1.default.team.findUnique({
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
    static async joinTeam(userId, inviteCode) {
        const team = await prisma_1.default.team.findUnique({
            where: { inviteCode },
        });
        if (!team) {
            throw new TeamError('Invalid invite code', 404);
        }
        // Check if already a member
        const existing = await prisma_1.default.teamMember.findUnique({
            where: {
                userId_teamId: { userId, teamId: team.id },
            },
        });
        if (existing) {
            throw new TeamError('Already a member of this team', 400);
        }
        await prisma_1.default.teamMember.create({
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
    static async leaveTeam(userId, teamId) {
        await prisma_1.default.teamMember.delete({
            where: {
                userId_teamId: { userId, teamId },
            },
        });
    }
}
exports.TeamService = TeamService;
// ============================================
// ERROR CLASS
// ============================================
class TeamError extends Error {
    constructor(message, statusCode = 400) {
        super(message);
        this.statusCode = statusCode;
        this.name = 'TeamError';
    }
}
exports.TeamError = TeamError;
//# sourceMappingURL=team.service.js.map