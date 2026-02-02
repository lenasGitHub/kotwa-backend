import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config/env';
import { AppError } from '../middleware/error.middleware';
import prisma from '../utils/prisma';

export class AuthService {
  // Generate 6-digit OTP
  private static generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // 1. Register with Password
  static async register(data: {
    username: string;
    password: string;
    gender?: string;
    birthday?: string;
    email?: string;
    phoneNumber?: string;
  }) {
    const { username, password, gender, birthday, email, phoneNumber } = data;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { username },
          ...(email ? [{ email }] : []),
          ...(phoneNumber ? [{ phoneNumber }] : []),
        ],
      },
    });

    if (existingUser) {
      if (existingUser.username === username)
        throw new AppError('Username already taken', 400);
      if (email && existingUser.email === email)
        throw new AppError('Email already registered', 400);
      if (phoneNumber && existingUser.phoneNumber === phoneNumber)
        throw new AppError('Phone number already registered', 400);
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        gender,
        birthday: birthday ? new Date(birthday) : null,
        email,
        phoneNumber,
      },
    });

    const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    });

    return { user, token };
  }

  // 2. Login with Password
  static async loginWithPassword(username: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user || !user.password) {
      throw new AppError('Invalid username or password', 401);
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new AppError('Invalid username or password', 401);
    }

    const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    });

    return { user, token };
  }

  // 3. Send OTP (Keep existing)
  static async sendOTP(phoneNumber: string): Promise<string> {
    if (!phoneNumber) throw new AppError('Phone number is required', 400);

    const otp = this.generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Log for dev
    console.log(`[AUTH] OTP for ${phoneNumber}: ${otp}`);

    await prisma.user.upsert({
      where: { phoneNumber },
      update: { otp, otpExpiresAt },
      create: {
        phoneNumber,
        username: `user_${phoneNumber}`, // Default username for OTP login
        otp,
        otpExpiresAt,
      },
    });

    return otp;
  }

  // 4. Verify OTP & Generate Token
  static async verifyOTP(phoneNumber: string, otp: string) {
    if (!phoneNumber || !otp)
      throw new AppError('Phone number and OTP are required', 400);

    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) throw new AppError('User not found', 404);
    if (user.otp !== otp) {
      throw new AppError('Invalid OTP', 401);
    }
    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      throw new AppError('OTP expired', 401);
    }

    // Clear OTP & Update Activity
    await prisma.user.update({
      where: { id: user.id },
      data: {
        otp: null,
        otpExpiresAt: null,
        lastActive: new Date(),
      },
    });

    const token = jwt.sign({ userId: user.id }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn as any,
    });

    return { user, token };
  }
}
