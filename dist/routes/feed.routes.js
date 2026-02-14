"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const feedController_1 = require("../controllers/feedController");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Feed
 *   description: Social Feed and Interactions
 */
/**
 * @swagger
 * /api/feed:
 *   get:
 *     summary: Get main social feed
 *     tags: [Feed]
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Feed retrieved successfully
 */
router.get('/', feedController_1.getMainFeed);
/**
 * @swagger
 * /api/feed/{id}/react:
 *   post:
 *     summary: React to a feed item (Habit Proof)
 *     tags: [Feed]
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - type
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [HEART, FIRE, MUSCLE, CLAP]
 *     responses:
 *       200:
 *         description: Reaction updated
 */
router.post('/:id/react', feedController_1.reactToProof);
exports.default = router;
//# sourceMappingURL=feed.routes.js.map