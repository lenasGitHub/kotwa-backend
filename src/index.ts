import http from 'http';
import app from './app';
import { config } from './config/env';
import { connectRedis } from './config/redis';
import { initializeSocket } from './socket';

const server = http.createServer(app);

// Initialize services and start server
const start = async () => {
  // Try to connect to Redis (optional, will fallback gracefully)
  const redisConnected = await connectRedis();

  // Initialize Socket.IO (will use Redis adapter if available)
  initializeSocket(server, redisConnected);

  server.listen(config.port, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://0.0.0.0:${config.port}`);
    console.log(
      `📡 WebSocket ready${redisConnected ? ' (Redis adapter)' : ''}`,
    );
    console.log(`🌍 Environment: ${config.nodeEnv}`);
  });
};

start().catch(err => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
