import { Router } from 'express';
import {
  getCategories,
  getHabit,
  getHabitMembers,
  getSubHabits,
  joinHabit,
  rateHabit,
  toggleFavorite,
  toggleNotification,
  unjoinHabit,
} from '../controllers/habitController';
import {
  getMyProgress,
  getPendingProofs,
  uploadProof,
  voteOnProof,
} from '../controllers/proofController';
import { authenticate } from '../middleware/auth.middleware';
import { upload } from '../utils/upload';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Discovery
 *   description: Habit discovery and biomes
 */

/**
 * @swagger
 * /api/habits/categories:
 *   get:
 *     summary: Get all Major Mountains (Biomes)
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of habit categories (Biomes)
 */
router.get('/categories', authenticate, getCategories);

/**
 * @swagger
 * /api/habits/categories/{categoryId}:
 *   get:
 *     summary: Get Biome Details & Trails
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the habit category (Biome)
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [POPULARITY, TRENDS, RATING, RECOMMENDED]
 *         description: Sort/Filter habits by specific criteria
 *     responses:
 *       200:
 *         description: Category details and list of trails/sub-habits
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 category:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalClimbers:
 *                           type: integer
 *                 habits:
 *                   type: array
 *                   description: List of trails in this biome
 */
router.get('/categories/:categoryId', authenticate, getSubHabits);

/**
 * @swagger
 * /api/habits/categories/{categoryId}/sub/{id}:
 *   get:
 *     summary: Get specific Trail (Habit) details
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: categoryId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the category (Structure only)
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the habit/trail
 *     responses:
 *       200:
 *         description: Full habit details including guides and incentives
 */
router.get('/categories/:categoryId/sub/:id', authenticate, getHabit);

/**
 * @swagger
 * /api/habits/{habitId}/favorite:
 *   post:
 *     summary: Toggle habit favorite status
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: habitId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Favorite status toggled
 */
router.post('/:habitId/favorite', authenticate, toggleFavorite);

/**
 * @swagger
 * /api/habits/{habitId}/notify:
 *   post:
 *     summary: Toggle habit notification status
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: habitId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Notification status toggled
 */
router.post('/:habitId/notify', authenticate, toggleNotification);

/**
 * @swagger
 * /api/habits/{habitId}/rate:
 *   post:
 *     summary: Rate a habit (1-5 stars)
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: habitId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - rating
 *             properties:
 *               rating:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       200:
 *         description: Rating applied and average recalculated
 *       400:
 *         description: Must join habit first or invalid rating
 */
router.post('/:habitId/rate', authenticate, rateHabit);

/**
 * @swagger
 * /api/habits/{habitId}/members:
 *   get:
 *     summary: Get members of a habit
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: habitId
 *         required: true
 *         schema:
 *           type: string
 *       - in: query
 *         name: filter
 *         schema:
 *           type: string
 *           enum: [RECENT, TOP_XP, TOP_ACHIEVEMENTS]
 *           default: RECENT
 *     responses:
 *       200:
 *         description: List of members
 */
router.get('/:habitId/members', authenticate, getHabitMembers);

/**
 * @swagger
 * /api/habits/join:
 *   post:
 *     summary: Join a specific Habit (Trail)
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               habitId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully joined habit and biome
 */
router.post('/join', authenticate, joinHabit);

/**
 * @swagger
 * /api/habits/unjoin:
 *   delete:
 *     summary: Leave a habit and remove all related data
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               habitId:
 *                 type: string
 *     responses:
 *       200:
 *         description: Successfully left habit
 */
router.delete('/unjoin', authenticate, unjoinHabit);

/**
 * @swagger
 * /api/habits/upload-proof:
 *   post:
 *     summary: Upload proof for habit completion
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               habitId:
 *                 type: string
 *               image:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Proof uploaded successfully
 */
router.post('/upload-proof', authenticate, upload.single('image'), uploadProof);

/**
 * @swagger
 * /api/habits/vote-proof:
 *   post:
 *     summary: Vote on a habit proof (APPROVE or REJECT)
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               proofId:
 *                 type: string
 *               voteType:
 *                 type: string
 *                 enum: [APPROVE, REJECT]
 *     responses:
 *       200:
 *         description: Vote submitted successfully
 */
router.post('/vote-proof', authenticate, voteOnProof);

/**
 * @swagger
 * /api/habits/{habitId}/proofs:
 *   get:
 *     summary: Get pending proofs for voting
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: habitId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of pending proofs
 */
router.get('/:habitId/proofs', authenticate, getPendingProofs);

/**
 * @swagger
 * /api/habits/{habitId}/my-progress:
 *   get:
 *     summary: Get user's progress for a habit
 *     tags: [Habits]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: habitId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: User's habit progress
 */
router.get('/:habitId/my-progress', authenticate, getMyProgress);

export default router;
