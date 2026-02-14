"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const challengeController_1 = require("../controllers/challengeController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// POST /api/challenges - Create a new challenge
router.post('/', auth_middleware_1.authenticate, challengeController_1.createChallenge);
// GET /api/challenges - List available challenges
router.get('/', auth_middleware_1.authenticate, challengeController_1.getChallenges);
// GET /api/challenges/user - Get challenges joined by current user
router.get('/user', auth_middleware_1.authenticate, challengeController_1.getUserChallenges);
// GET /api/challenges/:id - Get challenge details
router.get('/:id', auth_middleware_1.authenticate, challengeController_1.getChallengeById);
// POST /api/challenges/:id/join - Join a challenge
router.post('/:id/join', auth_middleware_1.authenticate, challengeController_1.joinChallenge);
// POST /api/challenges/:id/leave - Leave a challenge
router.post('/:id/leave', auth_middleware_1.authenticate, challengeController_1.leaveChallenge);
// GET /api/challenges/:id/leaderboard - Get ranked participants
router.get('/:id/leaderboard', auth_middleware_1.authenticate, challengeController_1.getChallengeLeaderboard);
exports.default = router;
//# sourceMappingURL=challenge.routes.js.map