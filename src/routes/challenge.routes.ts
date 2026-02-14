import { Router } from 'express';
import {
  createChallenge,
  getChallengeById,
  getChallengeLeaderboard,
  getChallenges,
  getUserChallenges,
  joinChallenge,
  leaveChallenge,
} from '../controllers/challengeController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// POST /api/challenges - Create a new challenge
router.post('/', authenticate, createChallenge);

// GET /api/challenges - List available challenges
router.get('/', authenticate, getChallenges);

// GET /api/challenges/user - Get challenges joined by current user
router.get('/user', authenticate, getUserChallenges);

// GET /api/challenges/:id - Get challenge details
router.get('/:id', authenticate, getChallengeById);

// POST /api/challenges/:id/join - Join a challenge
router.post('/:id/join', authenticate, joinChallenge);

// POST /api/challenges/:id/leave - Leave a challenge
router.post('/:id/leave', authenticate, leaveChallenge);

// GET /api/challenges/:id/leaderboard - Get ranked participants
router.get('/:id/leaderboard', authenticate, getChallengeLeaderboard);

export default router;
