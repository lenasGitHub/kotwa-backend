"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const focusController_1 = require("../controllers/focusController");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Focus
 *   description: Real-time Focus Session Tracking
 */
/**
 * @swagger
 * /api/focus/start:
 *   post:
 *     summary: Start a focus session
 *     tags: [Focus]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               habitId:
 *                 type: string
 *     responses:
 *       201:
 *         description: Session started
 */
router.post('/start', focusController_1.startFocusSession);
/**
 * @swagger
 * /api/focus/{id}/pause:
 *   post:
 *     summary: Pause a session
 *     tags: [Focus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session paused
 */
router.post('/:id/pause', focusController_1.pauseFocusSession);
/**
 * @swagger
 * /api/focus/{id}/resume:
 *   post:
 *     summary: Resume a paused session
 *     tags: [Focus]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session resumed
 */
router.post('/:id/resume', focusController_1.resumeFocusSession);
/**
 * @swagger
 * /api/focus/{id}/end:
 *   post:
 *     summary: End a session
 *     tags: [Focus]
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
 *               - duration
 *             properties:
 *               duration:
 *                 type: integer
 *                 description: Total active duration in seconds
 *     responses:
 *       200:
 *         description: Session completed
 */
router.post('/:id/end', focusController_1.endFocusSession);
exports.default = router;
//# sourceMappingURL=focus.routes.js.map