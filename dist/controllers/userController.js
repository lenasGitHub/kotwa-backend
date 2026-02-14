"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllUsers = exports.getUserStats = exports.updateProfile = exports.getProfile = void 0;
const error_middleware_1 = require("../middleware/error.middleware");
const user_service_1 = require("../services/user.service");
const getProfile = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        if (!userId)
            throw new error_middleware_1.AppError('Unauthorized', 401);
        // If no id param provided, use current user's id
        const targetId = id ? (id === 'me' ? userId : id) : userId;
        const user = await user_service_1.UserService.getProfile(userId, targetId);
        res.status(200).json({
            success: true,
            data: user,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getProfile = getProfile;
const updateProfile = async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!userId)
            throw new error_middleware_1.AppError('Unauthorized', 401);
        const updatedUser = await user_service_1.UserService.updateProfile(userId, req.body);
        res.status(200).json({
            success: true,
            data: updatedUser,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
const getUserStats = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { id } = req.params;
        if (!userId)
            throw new error_middleware_1.AppError('Unauthorized', 401);
        const targetId = id === 'me' ? userId : id;
        const stats = await user_service_1.UserService.getUserStats(targetId);
        res.status(200).json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserStats = getUserStats;
const getAllUsers = async (req, res, next) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const username = req.query.username;
        const email = req.query.email;
        const result = await user_service_1.UserService.getAllUsers({ username, email }, { page, limit });
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAllUsers = getAllUsers;
//# sourceMappingURL=userController.js.map