import { NextFunction, Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { AppError } from '../middleware/error.middleware';
import { UserService } from '../services/user.service';

export const getProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) throw new AppError('Unauthorized', 401);

    // If no id param provided, use current user's id
    const targetId = id ? (id === 'me' ? userId : id) : userId;
    const user = await UserService.getProfile(userId, targetId);

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    if (!userId) throw new AppError('Unauthorized', 401);

    const updatedUser = await UserService.updateProfile(userId, req.body);

    res.status(200).json({
      success: true,
      data: updatedUser,
    });
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = req.userId;
    const { id } = req.params;

    if (!userId) throw new AppError('Unauthorized', 401);

    const targetId = id === 'me' ? userId : id;

    const stats = await UserService.getUserStats(targetId);

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
