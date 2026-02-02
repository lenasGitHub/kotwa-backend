import express from 'express';
import cors from 'cors';
import { config } from './config/env';
import authRoutes from './routes/auth.routes';
import userRoutes from './routes/user.routes';
import challengeRoutes from './routes/challenge.routes';
import teamRoutes from './routes/team.routes';
import progressRoutes from './routes/progress.routes';
import { errorHandler } from './middleware/error.middleware';
import { apiLimiter } from './middleware/rateLimit.middleware';

const app = express();

// Global Middleware
app.use(cors({ origin: config.cors.origin }));
app.use(express.json());

// Apply rate limiting to all API routes
app.use('/api', apiLimiter);

// Health check (not rate limited)
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/progress', progressRoutes);

// Error handling
app.use(errorHandler);

export default app;
