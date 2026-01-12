import http from 'http';
import app from './app';
import { config } from './config/env';
import { initializeSocket } from './socket';

const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

server.listen(config.port, () => {
    console.log(`🚀 Server running on http://localhost:${config.port}`);
    console.log(`📡 WebSocket ready`);
    console.log(`🌍 Environment: ${config.nodeEnv}`);
});
