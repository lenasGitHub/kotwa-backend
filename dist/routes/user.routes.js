"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const userController_1 = require("../controllers/userController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Users
 *   description: User management
 */
/**
 * @swagger
 * /api/users/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User profile data
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', auth_middleware_1.authenticate, userController_1.getProfile);
router.get('/profile/:id', auth_middleware_1.authenticate, userController_1.getProfile);
/**
 * @swagger
 * /api/users/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               bio:
 *                 type: string
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Profile updated successfully
 */
router.put('/profile', auth_middleware_1.authenticate, userController_1.updateProfile);
/**
 * @swagger
 * /api/users/{id}/stats:
 *   get:
 *     summary: Get user progress stats
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID or "me" for current user
 *     responses:
 *       200:
 *         description: User stats and recent activity
 */
router.get('/:id/stats', auth_middleware_1.authenticate, userController_1.getUserStats);
/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users with pagination and filtering
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Items per page
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         description: Filter by username
 *       - in: query
 *         name: email
 *         schema:
 *           type: string
 *         description: Filter by email
 *     responses:
 *       200:
 *         description: List of users
 */
router.get('/', auth_middleware_1.authenticate, userController_1.getAllUsers);
exports.default = router;
//# sourceMappingURL=user.routes.js.map