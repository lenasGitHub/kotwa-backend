"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.removeFriend = exports.getFollowing = exports.getFollowers = exports.toggleFollow = exports.getFriends = exports.syncContacts = exports.acceptInvite = exports.createInvite = void 0;
const social_service_1 = require("../services/social.service");
const createInvite = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { habitId, phoneNumber } = req.body;
        const result = await social_service_1.SocialService.createInvite(userId, habitId, phoneNumber);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        if (error.message === 'You must join this habit before creating an invite') {
            res.status(400).json({
                success: false,
                message: error.message,
            });
            return;
        }
        next(error);
    }
};
exports.createInvite = createInvite;
const acceptInvite = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { code } = req.body;
        if (!code) {
            res.status(400).json({
                success: false,
                message: 'Invite code is required',
            });
            return;
        }
        const result = await social_service_1.SocialService.acceptInvite(userId, code);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        const knownErrors = [
            'Invalid invite code',
            'Invite has expired',
            'Invite has already been used',
            'You cannot accept your own invite',
            'You have already joined this habit',
            'This invite is for a different phone number',
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
exports.acceptInvite = acceptInvite;
const syncContacts = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { phoneNumbers } = req.body;
        const result = await social_service_1.SocialService.syncContacts(userId, phoneNumbers || []);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.syncContacts = syncContacts;
const getFriends = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { habitId } = req.query;
        const friends = await social_service_1.SocialService.getFriends(userId, habitId);
        res.status(200).json({
            success: true,
            data: friends,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getFriends = getFriends;
const toggleFollow = async (req, res, next) => {
    try {
        const followerId = req.userId;
        const { userId: followingId } = req.params;
        const result = await social_service_1.SocialService.toggleFollow(followerId, followingId);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.toggleFollow = toggleFollow;
const getFollowers = async (req, res, next) => {
    try {
        const userId = req.userId;
        const followers = await social_service_1.SocialService.getFollowers(userId);
        res.status(200).json({
            success: true,
            data: followers,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getFollowers = getFollowers;
const getFollowing = async (req, res, next) => {
    try {
        const userId = req.userId;
        const following = await social_service_1.SocialService.getFollowing(userId);
        res.status(200).json({
            success: true,
            data: following,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getFollowing = getFollowing;
const removeFriend = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { friendId } = req.params;
        const result = await social_service_1.SocialService.removeFriend(userId, friendId);
        res.status(200).json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.removeFriend = removeFriend;
//# sourceMappingURL=socialController.js.map