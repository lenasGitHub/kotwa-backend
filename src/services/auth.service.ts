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

    if (!username || !password) {
      throw new AppError('Username and password are required', 400);
    }

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

    let parsedBirthday: Date | null = null;
    if (birthday) {
      parsedBirthday = new Date(birthday);
      if (isNaN(parsedBirthday.getTime())) {
        throw new AppError('Invalid birthday format', 400);
      }
    }

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        gender,
        birthday: parsedBirthday,
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

  // 5. Check Username Availability
  static async checkUsername(username: string) {
    const user = await prisma.user.findUnique({
      where: { username },
      select: { username: true },
    });
    return { available: !user };
  }

  // 6. Forgot Password (OTP)
  static async forgotPassword(identifier: string) {
    if (!identifier)
      throw new AppError('Email or phone number is required', 400);

    // Find user by username, email, or phone
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: identifier },
          { phoneNumber: identifier },
          { username: identifier },
        ],
      },
    });

    if (!user) throw new AppError('User not found', 404);
    if (!user.phoneNumber)
      throw new AppError('User has no phone number linked', 400);

    const otp = this.generateOTP();
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Log for dev
    console.log(
      `[AUTH] Forgot Password OTP for ${user.username} (${user.phoneNumber}): ${otp}`,
    );

    await prisma.user.update({
      where: { id: user.id },
      data: { otp, otpExpiresAt },
    });

    return { message: 'OTP sent successfully', phoneNumber: user.phoneNumber };
  }

  // 7. Reset Password
  static async resetPassword(
    phoneNumber: string,
    otp: string,
    newPassword: string,
  ) {
    if (!phoneNumber || !otp || !newPassword)
      throw new AppError(
        'Phone number, OTP, and new password are required',
        400,
      );

    const user = await prisma.user.findUnique({
      where: { phoneNumber },
    });

    if (!user) throw new AppError('User not found', 404);
    if (user.otp !== otp) throw new AppError('Invalid OTP', 401);
    if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
      throw new AppError('OTP expired', 401);
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        otp: null,
        otpExpiresAt: null,
      },
    });

    return { message: 'Password reset successfully' };
  }
}
