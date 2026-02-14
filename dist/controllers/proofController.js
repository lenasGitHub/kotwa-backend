"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyProgress = exports.getPendingProofs = exports.voteOnProof = exports.uploadProof = void 0;
const proof_service_1 = require("../services/proof.service");
const uploadProof = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { habitId } = req.body;
        const file = req.file;
        if (!habitId) {
            res.status(400).json({
                success: false,
                message: 'habitId is required',
            });
            return;
        }
        if (!file) {
            res.status(400).json({
                success: false,
                message: 'Image file is required',
            });
            return;
        }
        // Construct the image URL path
        const imageUrl = `/uploads/proofs/${file.filename}`;
        const result = await proof_service_1.ProofService.uploadProof(userId, habitId, imageUrl);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        if (error.message === 'You must join this habit before submitting proof') {
            res.status(400).json({
                success: false,
                message: error.message,
            });
            return;
        }
        next(error);
    }
};
exports.uploadProof = uploadProof;
const voteOnProof = async (req, res, next) => {
    try {
        const voterId = req.userId;
        const { proofId, voteType } = req.body;
        if (!proofId || !voteType) {
            res.status(400).json({
                success: false,
                message: 'proofId and voteType are required',
            });
            return;
        }
        if (voteType !== 'APPROVE' && voteType !== 'REJECT') {
            res.status(400).json({
                success: false,
                message: 'voteType must be APPROVE or REJECT',
            });
            return;
        }
        const result = await proof_service_1.ProofService.voteOnProof(voterId, proofId, voteType);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        // Handle known validation errors with proper status codes
        const knownErrors = [
            'Proof not found',
            'You cannot vote on your own proof',
            'You must be part of this habit to vote',
            'You have already voted on this proof',
        ];
        if (knownErrors.includes(error.message)) {
            res.status(400).json({
                success: false,
                message: error.message,
            });
            return;
        }
        next(error);
    }
};
exports.voteOnProof = voteOnProof;
const getPendingProofs = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { habitId } = req.params;
        const proofs = await proof_service_1.ProofService.getPendingProofs(habitId, userId);
        res.status(200).json({
            success: true,
            data: proofs,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPendingProofs = getPendingProofs;
const getMyProgress = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { habitId } = req.params;
        const progress = await proof_service_1.ProofService.getMyProgress(habitId, userId);
        res.status(200).json({
            success: true,
            data: progress,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getMyProgress = getMyProgress;
//# sourceMappingURL=proofController.js.map