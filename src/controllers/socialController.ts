import { NextFunction, Request, Response } from 'express';
import { SocialService } from '../services/social.service';

export const createInvite = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).userId;
    const { habitId, phoneNumber } = req.body;

    const result = await SocialService.createInvite(
      userId,
      habitId,
      phoneNumber,
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (
      error.message === 'You must join this habit before creating an invite'
    ) {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }
    next(error);
  }
};

export const acceptInvite = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).userId;
    const { code } = req.body;

    if (!code) {
      res.status(400).json({
        success: false,
        message: 'Invite code is required',
      });
      return;
    }

    const result = await SocialService.acceptInvite(userId, code);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const knownErrors = [
      'Invalid invite code',
      'Invite has expired',
      'Invite has already been used',
      'You cannot accept your own invite',
      'You have already joined this habit',
      'This invite is for a different phone number',
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

export const syncContacts = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).userId;
    const { phoneNumbers } = req.body;

    const result = await SocialService.syncContacts(userId, phoneNumbers || []);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getFriends = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).userId;
    const { habitId } = req.query;

    const friends = await SocialService.getFriends(
      userId,
      habitId as string | undefined,
    );
    res.status(200).json({
      success: true,
      data: friends,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleFollow = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const followerId = (req as any).userId;
    const { userId: followingId } = req.params;
    const result = await SocialService.toggleFollow(followerId, followingId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getFollowers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).userId;
    const followers = await SocialService.getFollowers(userId);
    res.status(200).json({
      success: true,
      data: followers,
    });
  } catch (error) {
    next(error);
  }
};

export const getFollowing = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).userId;
    const following = await SocialService.getFollowing(userId);
    res.status(200).json({
      success: true,
      data: following,
    });
  } catch (error) {
    next(error);
  }
};

export const removeFriend = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).userId;
    const { friendId } = req.params;

    const result = await SocialService.removeFriend(userId, friendId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};
