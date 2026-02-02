import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import swaggerUi from 'swagger-ui-express';
import { config } from './config/env';
import { swaggerSpec } from './config/swagger';
import { errorHandler } from './middleware/error.middleware';
import { globalLimiter } from './middleware/rateLimit.middleware';
import authRoutes from './routes/auth.routes';
import challengeRoutes from './routes/challenge.routes';
import habitRoutes from './routes/habit.routes';
import progressRoutes from './routes/progress.routes';
import socialRoutes from './routes/social.routes';
import teamRoutes from './routes/team.routes';
import userRoutes from './routes/user.routes';

const app = express();

// Security Middleware
app.use(helmet());
app.use(cors({ origin: config.cors.origin }));
app.use(express.json());
app.use(globalLimiter);

// Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/challenges', challengeRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/social', socialRoutes);

// Error handling
app.use(errorHandler);

export default app;
