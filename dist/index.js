"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = __importDefault(require("./app"));
const env_1 = require("./config/env");
const redis_1 = require("./config/redis");
const socket_1 = require("./socket");
const server = http_1.default.createServer(app_1.default);
// Initialize services and start server
const start = async () => {
    // Try to connect to Redis (optional, will fallback gracefully)
    const redisConnected = await (0, redis_1.connectRedis)();
    // Initialize Socket.IO (will use Redis adapter if available)
    (0, socket_1.initializeSocket)(server, redisConnected);
    server.listen(env_1.config.port, '0.0.0.0', () => {
        console.log(`🚀 Server running on http://0.0.0.0:${env_1.config.port}`);
        console.log(`📡 WebSocket ready${redisConnected ? ' (Redis adapter)' : ''}`);
        console.log(`🌍 Environment: ${env_1.config.nodeEnv}`);
    });
};
start().catch(err => {
    console.error('Failed to start server:', err);
    process.exit(1);
});
//# sourceMappingURL=index.js.map