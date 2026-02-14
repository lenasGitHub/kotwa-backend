"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const testController_1 = require("../controllers/testController");
const router = (0, express_1.Router)();
/**
 * @swagger
 * tags:
 *   name: Test
 *   description: Debugging and Testing Endpoints
 */
/**
 * @swagger
 * /api/test/socket-cycle:
 *   post:
 *     summary: Trigger a socket event to test full cycle connectivity
 *     tags: [Test]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Event triggered
 */
router.post('/socket-cycle', testController_1.triggerSocketTest);
exports.default = router;
//# sourceMappingURL=test.routes.js.map