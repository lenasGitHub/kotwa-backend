"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const socialController_1 = require("../controllers/socialController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Social
 *   description: Social features - invites, contacts, friends
 */
/**
 * @swagger
 * /api/social/invite:
 *   post:
 *     summary: Generate invite link (global or habit-specific)
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               habitId:
 *                 type: string
 *                 description: Optional. If provided, restrict to a habit.
 *               phoneNumber:
 *                 type: string
 *                 description: Optional. If provided, restrict to a specific phone number.
 *     responses:
 *       200:
 *         description: Invite created successfully
 */
router.post('/invite', auth_middleware_1.authenticate, socialController_1.createInvite);
/**
 * @swagger
 * /api/social/invite/accept:
 *   post:
 *     summary: Accept invite, become friends, and join habit (if applicable)
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - code
 *             properties:
 *               code:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully processed invite (adds friend, awards XP, joins habit if applicable)
 */
router.post('/invite/accept', auth_middleware_1.authenticate, socialController_1.acceptInvite);
/**
 * @swagger
 * /api/social/contacts:
 *   post:
 *     summary: Sync phone contacts to find friends
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               phoneNumbers:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       200:
 *         description: List of matching users
 */
router.post('/contacts', auth_middleware_1.authenticate, socialController_1.syncContacts);
/**
 * @swagger
 * /api/social/friends:
 *   get:
 *     summary: Get friend list
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: habitId
 *         schema:
 *           type: string
 *         description: Optional. Filter friends who are joined in this specific habit.
 *     responses:
 *       200:
 *         description: List of friends
 */
router.get('/friends', auth_middleware_1.authenticate, socialController_1.getFriends);
/**
 * @swagger
 * /api/social/follow/{userId}:
 *   post:
 *     summary: Follow or unfollow a user
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of user to follow/unfollow
 *     responses:
 *       200:
 *         description: Follow status toggled
 */
router.post('/follow/:userId', auth_middleware_1.authenticate, socialController_1.toggleFollow);
/**
 * @swagger
 * /api/social/followers:
 *   get:
 *     summary: Get list of followers
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of followers
 */
router.get('/followers', auth_middleware_1.authenticate, socialController_1.getFollowers);
/**
 * @swagger
 * /api/social/following:
 *   get:
 *     summary: Get list of following
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of following
 */
router.get('/following', auth_middleware_1.authenticate, socialController_1.getFollowing);
/**
 * @swagger
 * /api/social/friends/{friendId}:
 *   delete:
 *     summary: Remove friend
 *     tags: [Social]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Friend removed successfully
 */
router.delete('/friends/:friendId', auth_middleware_1.authenticate, socialController_1.removeFriend);
exports.default = router;
//# sourceMappingURL=social.routes.js.map