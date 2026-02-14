"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changePassword = exports.deleteAccount = exports.resetPassword = exports.forgotPassword = exports.checkUsername = exports.verify = exports.login = exports.passwordLogin = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const register = async (req, res, next) => {
    try {
        const result = await auth_service_1.AuthService.register(req.body);
        res.status(201).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.register = register;
const passwordLogin = async (req, res, next) => {
    try {
        const { username, password } = req.body;
        const result = await auth_service_1.AuthService.loginWithPassword(username, password);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.passwordLogin = passwordLogin;
const login = async (req, res, next) => {
    try {
        const { phoneNumber } = req.body;
        // Service handles validation and logic
        await auth_service_1.AuthService.sendOTP(phoneNumber);
        res.status(200).json({
            success: true,
            message: 'OTP sent successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const verify = async (req, res, next) => {
    try {
        const { phoneNumber, otp } = req.body;
        const result = await auth_service_1.AuthService.verifyOTP(phoneNumber, otp);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.verify = verify;
const checkUsername = async (req, res, next) => {
    try {
        const { username } = req.body;
        const result = await auth_service_1.AuthService.checkUsername(username);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.checkUsername = checkUsername;
const forgotPassword = async (req, res, next) => {
    try {
        const { identifier } = req.body;
        const result = await auth_service_1.AuthService.forgotPassword(identifier);
        res.status(200).json({
            success: true,
            message: result.message,
            data: { phoneNumber: result.phoneNumber },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.forgotPassword = forgotPassword;
const resetPassword = async (req, res, next) => {
    try {
        const { phoneNumber, otp, newPassword } = req.body;
        const result = await auth_service_1.AuthService.resetPassword(phoneNumber, otp, newPassword);
        res.status(200).json({
            success: true,
            message: result.message,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resetPassword = resetPassword;
const deleteAccount = async (req, res, next) => {
    try {
        const userId = req.userId;
        const result = await auth_service_1.AuthService.deleteAccount(userId);
        res.status(200).json({
            success: true,
            message: result.message,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteAccount = deleteAccount;
const changePassword = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { currentPassword, newPassword } = req.body;
        const result = await auth_service_1.AuthService.changePassword(userId, currentPassword, newPassword);
        res.status(200).json({
            success: true,
            message: result.message,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.changePassword = changePassword;
//# sourceMappingURL=authController.js.map