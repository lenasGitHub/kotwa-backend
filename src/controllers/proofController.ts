import { NextFunction, Request, Response } from 'express';
import { ProofService } from '../services/proof.service';

export const uploadProof = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).userId;
    const { habitId } = req.body;
    const file = (req as any).file;

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

    const result = await ProofService.uploadProof(userId, habitId, imageUrl);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
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

export const voteOnProof = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const voterId = (req as any).userId;
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

    const result = await ProofService.voteOnProof(voterId, proofId, voteType);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
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

export const getPendingProofs = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).userId;
    const { habitId } = req.params;

    const proofs = await ProofService.getPendingProofs(habitId, userId);
    res.status(200).json({
      success: true,
      data: proofs,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyProgress = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).userId;
    const { habitId } = req.params;

    const progress = await ProofService.getMyProgress(habitId, userId);
    res.status(200).json({
      success: true,
      data: progress,
    });
  } catch (error) {
    next(error);
  }
};
