"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unjoinHabit = exports.joinHabit = exports.getHabitMembers = exports.rateHabit = exports.toggleNotification = exports.toggleFavorite = exports.getHabit = exports.getSubHabits = exports.getCategories = void 0;
const habit_service_1 = require("../services/habit.service");
const getCategories = async (req, res, next) => {
    try {
        const categories = await habit_service_1.HabitService.getCategories();
        res.status(200).json({
            success: true,
            data: categories,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCategories = getCategories;
const getSubHabits = async (req, res, next) => {
    try {
        const { categoryId } = req.params;
        const filter = req.query.filter;
        const result = await habit_service_1.HabitService.getSubHabits(categoryId, filter);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSubHabits = getSubHabits;
const getHabit = async (req, res, next) => {
    try {
        const { id } = req.params;
        const userId = req.userId; // Available from authenticate middleware
        const habit = await habit_service_1.HabitService.getHabitById(id, userId);
        res.status(200).json({
            success: true,
            data: habit,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getHabit = getHabit;
const toggleFavorite = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { habitId } = req.params;
        const result = await habit_service_1.HabitService.toggleFavorite(userId, habitId);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleFavorite = toggleFavorite;
const toggleNotification = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { habitId } = req.params;
        const result = await habit_service_1.HabitService.toggleNotification(userId, habitId);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleNotification = toggleNotification;
const rateHabit = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { habitId } = req.params;
        const { rating } = req.body;
        if (rating === undefined) {
            res.status(400).json({
                success: false,
                message: 'Rating is required',
            });
            return;
        }
        const result = await habit_service_1.HabitService.rateHabit(userId, habitId, Number(rating));
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        if (error.message === 'Rating must be between 1 and 5' ||
            error.message === 'You must join this habit before rating it') {
            res.status(400).json({
                success: false,
                message: error.message,
            });
            return;
        }
        next(error);
    }
};
exports.rateHabit = rateHabit;
const getHabitMembers = async (req, res, next) => {
    try {
        const { habitId } = req.params;
        const { filter } = req.query;
        const members = await habit_service_1.HabitService.getHabitMembers(habitId, filter);
        res.status(200).json({
            success: true,
            data: members,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getHabitMembers = getHabitMembers;
const joinHabit = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { habitId } = req.body;
        if (!habitId) {
            res.status(400).json({ success: false, message: 'habitId is required' });
            return;
        }
        const result = await habit_service_1.HabitService.joinHabit(userId, habitId);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
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
exports.joinHabit = joinHabit;
const unjoinHabit = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { habitId } = req.body;
        if (!habitId) {
            res.status(400).json({ success: false, message: 'habitId is required' });
            return;
        }
        const result = await habit_service_1.HabitService.unjoinHabit(userId, habitId);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
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
exports.unjoinHabit = unjoinHabit;
//# sourceMappingURL=habitController.js.map