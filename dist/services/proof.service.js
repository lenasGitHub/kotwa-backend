"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProofService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class ProofService {
    // 1. POST /habits/upload-proof
    static async uploadProof(userId, habitId, imageUrl) {
        // Check if user has joined this habit
        const habit = await prisma_1.default.habit.findFirst({
            where: {
                id: habitId,
                joinedUsers: {
                    some: { id: userId },
                },
            },
        });
        if (!habit) {
            throw new Error('You must join this habit before submitting proof');
        }
        // Get the user's current round for this habit
        const lastProof = await prisma_1.default.habitProof.findFirst({
            where: {
                userId,
                habitId,
                status: 'APPROVED',
            },
            orderBy: {
                round: 'desc',
            },
        });
        const nextRound = lastProof ? lastProof.round + 1 : 1;
        // Create proof record
        const proof = await prisma_1.default.habitProof.create({
            data: {
                userId,
                habitId,
                imageUrl,
                round: nextRound,
                status: 'PENDING',
            },
            include: {
                habit: true,
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                    },
                },
            },
        });
        return {
            message: 'Proof uploaded successfully',
            proof: {
                id: proof.id,
                imageUrl: proof.imageUrl,
                round: proof.round,
                status: proof.status,
                habitTitle: proof.habit.title,
            },
        };
    }
    // 2. POST /habits/vote-proof (WebSocket: submit_vote)
    static async voteOnProof(voterId, proofId, voteType) {
        const proof = await prisma_1.default.habitProof.findUnique({
            where: { id: proofId },
            include: {
                habit: {
                    include: {
                        joinedUsers: true,
                    },
                },
                votes: true,
            },
        });
        if (!proof) {
            throw new Error('Proof not found');
        }
        // Check if voter is trying to vote on their own proof
        if (proof.userId === voterId) {
            throw new Error('You cannot vote on your own proof');
        }
        // Check if voter is part of the same habit
        const isJoined = proof.habit.joinedUsers.some((u) => u.id === voterId);
        if (!isJoined) {
            throw new Error('You must be part of this habit to vote');
        }
        // Check if already voted
        const existingVote = proof.votes.find((v) => v.voterId === voterId);
        if (existingVote) {
            throw new Error('You have already voted on this proof');
        }
        // Create the vote
        await prisma_1.default.proofVote.create({
            data: {
                proofId,
                voterId,
                voteType,
            },
        });
        // Check if proof should be approved (need at least 1 approval for now, can be adjusted)
        const votes = await prisma_1.default.proofVote.findMany({
            where: { proofId },
        });
        const approvals = votes.filter((v) => v.voteType === 'APPROVE').length;
        const rejections = votes.filter((v) => v.voteType === 'REJECT').length;
        let newStatus = proof.status;
        // Simple logic: 1 approval = approved, 1 rejection = rejected
        if (approvals >= 1 && newStatus === 'PENDING') {
            newStatus = 'APPROVED';
            await prisma_1.default.habitProof.update({
                where: { id: proofId },
                data: { status: 'APPROVED' },
            });
        }
        else if (rejections >= 1 && newStatus === 'PENDING') {
            newStatus = 'REJECTED';
            await prisma_1.default.habitProof.update({
                where: { id: proofId },
                data: { status: 'REJECTED' },
            });
        }
        return {
            message: 'Vote submitted successfully',
            proofId,
            voteType,
            newStatus,
            approvals,
            rejections,
        };
    }
    // 3. GET /habits/:habitId/proofs (Get pending proofs for voting)
    static async getPendingProofs(habitId, userId) {
        const proofs = await prisma_1.default.habitProof.findMany({
            where: {
                habitId,
                status: 'PENDING',
                userId: { not: userId }, // Don't show user's own proofs
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        avatarUrl: true,
                    },
                },
                votes: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        });
        return proofs.map((proof) => ({
            id: proof.id,
            imageUrl: proof.imageUrl,
            round: proof.round,
            user: proof.user,
            votesCount: proof.votes.length,
            createdAt: proof.createdAt,
        }));
    }
    // 4. GET /habits/:habitId/my-progress (Get user's habit progress/stats)
    static async getMyProgress(habitId, userId) {
        const proofs = await prisma_1.default.habitProof.findMany({
            where: {
                habitId,
                userId,
            },
            orderBy: {
                round: 'asc',
            },
        });
        const approvedRounds = proofs.filter((p) => p.status === 'APPROVED').length;
        const pendingProofs = proofs.filter((p) => p.status === 'PENDING').length;
        const rejectedProofs = proofs.filter((p) => p.status === 'REJECTED').length;
        return {
            totalRounds: proofs.length,
            completedRounds: approvedRounds,
            pendingProofs,
            rejectedProofs,
            currentRound: proofs.length > 0 ? proofs[proofs.length - 1].round : 0,
            proofs: proofs.map((p) => ({
                id: p.id,
                round: p.round,
                status: p.status,
                imageUrl: p.imageUrl,
                createdAt: p.createdAt,
            })),
        };
    }
}
exports.ProofService = ProofService;
//# sourceMappingURL=proof.service.js.map