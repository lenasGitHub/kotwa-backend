import { NextFunction, Request, Response } from 'express';
import { HabitService } from '../services/habit.service';

export const getCategories = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const categories = await HabitService.getCategories();
    res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
};

export const getSubHabits = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { categoryId } = req.params;
    const filter = req.query.filter as string;
    const result = await HabitService.getSubHabits(categoryId, filter);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const getHabit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { id } = req.params;
    const userId = (req as any).userId; // Available from authenticate middleware
    const habit = await HabitService.getHabitById(id, userId);
    res.status(200).json({
      success: true,
      data: habit,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleFavorite = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).userId;
    const { habitId } = req.params;
    const result = await HabitService.toggleFavorite(userId, habitId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const toggleNotification = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).userId;
    const { habitId } = req.params;
    const result = await HabitService.toggleNotification(userId, habitId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const rateHabit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).userId;
    const { habitId } = req.params;
    const { rating } = req.body;

    if (rating === undefined) {
      res.status(400).json({
        success: false,
        message: 'Rating is required',
      });
      return;
    }

    const result = await HabitService.rateHabit(
      userId,
      habitId,
      Number(rating),
    );
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (
      error.message === 'Rating must be between 1 and 5' ||
      error.message === 'You must join this habit before rating it'
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

export const getHabitMembers = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { habitId } = req.params;
    const { filter } = req.query;

    const members = await HabitService.getHabitMembers(
      habitId,
      filter as string | undefined,
    );

    res.status(200).json({
      success: true,
      data: members,
    });
  } catch (error) {
    next(error);
  }
};

export const joinHabit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).userId;
    const { habitId } = req.body;

    if (!habitId) {
      res.status(400).json({ success: false, message: 'habitId is required' });
      return;
    }

    const result = await HabitService.joinHabit(userId, habitId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    const knownErrors = [
      'Habit not found',
      'You have already joined this habit',
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

export const unjoinHabit = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const userId = (req as any).userId;
    const { habitId } = req.body;

    if (!habitId) {
      res.status(400).json({ success: false, message: 'habitId is required' });
      return;
    }

    const result = await HabitService.unjoinHabit(userId, habitId);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error: any) {
    if (error.message === 'You are not a member of this habit') {
      res.status(400).json({
        success: false,
        message: error.message,
      });
      return;
    }
    next(error);
  }
};
