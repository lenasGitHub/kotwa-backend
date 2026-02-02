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
