"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../config/env");
const error_middleware_1 = require("../middleware/error.middleware");
const prisma_1 = __importDefault(require("../utils/prisma"));
class AuthService {
    // Generate 6-digit OTP
    static generateOTP() {
        return Math.floor(100000 + Math.random() * 900000).toString();
    }
    // 1. Register with Password
    static async register(data) {
        const { username, password, gender, birthday, email, phoneNumber } = data;
        if (!username || !password) {
            throw new error_middleware_1.AppError('Username and password are required', 400);
        }
        // Check if user already exists
        const existingUser = await prisma_1.default.user.findFirst({
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
                throw new error_middleware_1.AppError('Username already taken', 400);
            if (email && existingUser.email === email)
                throw new error_middleware_1.AppError('Email already registered', 400);
            if (phoneNumber && existingUser.phoneNumber === phoneNumber)
                throw new error_middleware_1.AppError('Phone number already registered', 400);
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        let parsedBirthday = null;
        if (birthday) {
            parsedBirthday = new Date(birthday);
            if (isNaN(parsedBirthday.getTime())) {
                throw new error_middleware_1.AppError('Invalid birthday format', 400);
            }
        }
        const user = await prisma_1.default.user.create({
            data: {
                username,
                password: hashedPassword,
                gender,
                birthday: parsedBirthday,
                email,
                phoneNumber,
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.config.jwt.secret, {
            expiresIn: env_1.config.jwt.expiresIn,
        });
        return { user, token };
    }
    // 2. Login with Password
    static async loginWithPassword(username, password) {
        const user = await prisma_1.default.user.findUnique({
            where: { username },
        });
        if (!user || !user.password) {
            throw new error_middleware_1.AppError('Invalid username or password', 401);
        }
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            throw new error_middleware_1.AppError('Invalid username or password', 401);
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.config.jwt.secret, {
            expiresIn: env_1.config.jwt.expiresIn,
        });
        return { user, token };
    }
    // 3. Send OTP (Keep existing)
    static async sendOTP(phoneNumber) {
        if (!phoneNumber)
            throw new error_middleware_1.AppError('Phone number is required', 400);
        const otp = this.generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // Log for dev
        console.log(`[AUTH] OTP for ${phoneNumber}: ${otp}`);
        await prisma_1.default.user.upsert({
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
    static async verifyOTP(phoneNumber, otp) {
        if (!phoneNumber || !otp)
            throw new error_middleware_1.AppError('Phone number and OTP are required', 400);
        const user = await prisma_1.default.user.findUnique({
            where: { phoneNumber },
        });
        if (!user)
            throw new error_middleware_1.AppError('User not found', 404);
        if (user.otp !== otp) {
            throw new error_middleware_1.AppError('Invalid OTP', 401);
        }
        if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
            throw new error_middleware_1.AppError('OTP expired', 401);
        }
        // Clear OTP & Update Activity
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                otp: null,
                otpExpiresAt: null,
                lastActive: new Date(),
            },
        });
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, env_1.config.jwt.secret, {
            expiresIn: env_1.config.jwt.expiresIn,
        });
        return { user, token };
    }
    // 5. Check Username Availability
    static async checkUsername(username) {
        const user = await prisma_1.default.user.findUnique({
            where: { username },
            select: { username: true },
        });
        return { available: !user };
    }
    // 6. Forgot Password (OTP)
    static async forgotPassword(identifier) {
        if (!identifier)
            throw new error_middleware_1.AppError('Email or phone number is required', 400);
        // Find user by username, email, or phone
        const user = await prisma_1.default.user.findFirst({
            where: {
                OR: [
                    { email: identifier },
                    { phoneNumber: identifier },
                    { username: identifier },
                ],
            },
        });
        if (!user)
            throw new error_middleware_1.AppError('User not found', 404);
        if (!user.phoneNumber)
            throw new error_middleware_1.AppError('User has no phone number linked', 400);
        const otp = this.generateOTP();
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
        // Log for dev
        console.log(`[AUTH] Forgot Password OTP for ${user.username} (${user.phoneNumber}): ${otp}`);
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: { otp, otpExpiresAt },
        });
        return { message: 'OTP sent successfully', phoneNumber: user.phoneNumber };
    }
    // 7. Reset Password
    static async resetPassword(phoneNumber, otp, newPassword) {
        if (!phoneNumber || !otp || !newPassword)
            throw new error_middleware_1.AppError('Phone number, OTP, and new password are required', 400);
        const user = await prisma_1.default.user.findUnique({
            where: { phoneNumber },
        });
        if (!user)
            throw new error_middleware_1.AppError('User not found', 404);
        if (user.otp !== otp)
            throw new error_middleware_1.AppError('Invalid OTP', 401);
        if (user.otpExpiresAt && user.otpExpiresAt < new Date()) {
            throw new error_middleware_1.AppError('OTP expired', 401);
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                otp: null,
                otpExpiresAt: null,
            },
        });
        return { message: 'Password reset successfully' };
    }
    // 8. Delete Account
    static async deleteAccount(userId) {
        if (!userId)
            throw new error_middleware_1.AppError('User ID is required', 400);
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user)
            throw new error_middleware_1.AppError('User not found', 404);
        // Delete user - Prisma cascade will handle all related data
        // Based on schema, all relations have onDelete: Cascade
        await prisma_1.default.user.delete({
            where: { id: userId },
        });
        return { message: 'Account deleted successfully' };
    }
    // 9. Change Password
    static async changePassword(userId, currentPassword, newPassword) {
        if (!currentPassword || !newPassword)
            throw new error_middleware_1.AppError('Current password and new password are required', 400);
        const user = await prisma_1.default.user.findUnique({
            where: { id: userId },
        });
        if (!user || !user.password) {
            throw new error_middleware_1.AppError('User not found or no password set', 404);
        }
        const isMatch = await bcryptjs_1.default.compare(currentPassword, user.password);
        if (!isMatch) {
            throw new error_middleware_1.AppError('Current password is incorrect', 401);
        }
        const hashedPassword = await bcryptjs_1.default.hash(newPassword, 10);
        await prisma_1.default.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
        return { message: 'Password changed successfully' };
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map