import { Router } from 'express';
import {
  checkUsername,
  forgotPassword,
  login,
  passwordLogin,
  register,
  resetPassword,
  verify,
} from '../controllers/authController';

const router = Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication via OTP or Password
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user with username and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               gender:
 *                 type: string
 *                 enum: [male, female, other]
 *               birthday:
 *                 type: string
 *                 format: date
 *                 example: "1990-01-01"
 *               email:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Username or email already taken
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login-password:
 *   post:
 *     summary: Login with username and password
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login-password', passwordLogin);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Send OTP to phone number
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *             properties:
 *               phoneNumber:
 *                 type: string
 *                 description: User phone number
 *                 example: "1234567890"
 *     responses:
 *       200:
 *         description: OTP sent successfully
 *       400:
 *         description: Missing phone number
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/verify:
 *   post:
 *     summary: Verify OTP and get JWT token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - otp
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               otp:
 *                 type: string
 *                 description: 6-digit OTP
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     token:
 *                       type: string
 *                     user:
 *                       type: object
 *       401:
 *         description: Invalid OTP
 */
router.post('/verify', verify);

/**
 * @swagger
 * /api/auth/check-username:
 *   post:
 *     summary: Check if username is available
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *             properties:
 *               username:
 *                 type: string
 *     responses:
 *       200:
 *         description: Availability status
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     available:
 *                       type: boolean
 */
router.post('/check-username', checkUsername);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Initiate password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - identifier
 *             properties:
 *               identifier:
 *                 type: string
 *                 description: Username, Email, or Phone Number
 *     responses:
 *       200:
 *         description: OTP sent
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Reset password with OTP
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - phoneNumber
 *               - otp
 *               - newPassword
 *             properties:
 *               phoneNumber:
 *                 type: string
 *               otp:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password reset successful
 */
router.post('/reset-password', resetPassword);

export default router;
