import { NextFunction, Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

export const register = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const result = await AuthService.register(req.body);
    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const passwordLogin = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username, password } = req.body;
    const result = await AuthService.loginWithPassword(username, password);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { phoneNumber } = req.body;
    // Service handles validation and logic
    await AuthService.sendOTP(phoneNumber);

    res.status(200).json({
      success: true,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    next(error);
  }
};

export const verify = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { phoneNumber, otp } = req.body;
    const result = await AuthService.verifyOTP(phoneNumber, otp);

    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const checkUsername = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { username } = req.body;
    const result = await AuthService.checkUsername(username);
    res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { identifier } = req.body;
    const result = await AuthService.forgotPassword(identifier);
    res.status(200).json({
      success: true,
      message: result.message,
      data: { phoneNumber: result.phoneNumber },
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { phoneNumber, otp, newPassword } = req.body;
    const result = await AuthService.resetPassword(
      phoneNumber,
      otp,
      newPassword,
    );
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};
