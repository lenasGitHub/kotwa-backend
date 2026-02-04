import { Router } from 'express';
import { triggerSocketTest } from '../controllers/testController';

const router = Router();

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
router.post('/socket-cycle', triggerSocketTest);

export default router;
