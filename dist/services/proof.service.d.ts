export declare class ProofService {
    static uploadProof(userId: string, habitId: string, imageUrl: string): Promise<{
        message: string;
        proof: {
            id: string;
            imageUrl: string | null;
            round: number;
            status: string;
            habitTitle: string;
        };
    }>;
    static voteOnProof(voterId: string, proofId: string, voteType: 'APPROVE' | 'REJECT'): Promise<{
        message: string;
        proofId: string;
        voteType: "APPROVE" | "REJECT";
        newStatus: string;
        approvals: number;
        rejections: number;
    }>;
    static getPendingProofs(habitId: string, userId: string): Promise<{
        id: any;
        imageUrl: any;
        round: any;
        user: any;
        votesCount: any;
        createdAt: any;
    }[]>;
    static getMyProgress(habitId: string, userId: string): Promise<{
        totalRounds: number;
        completedRounds: number;
        pendingProofs: number;
        rejectedProofs: number;
        currentRound: number;
        proofs: {
            id: any;
            round: any;
            status: any;
            imageUrl: any;
            createdAt: any;
        }[];
    }>;
}
//# sourceMappingURL=proof.service.d.ts.map