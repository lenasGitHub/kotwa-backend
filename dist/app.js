"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const env_1 = require("./config/env");
const swagger_1 = require("./config/swagger");
const error_middleware_1 = require("./middleware/error.middleware");
const rateLimit_middleware_1 = require("./middleware/rateLimit.middleware");
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const challenge_routes_1 = __importDefault(require("./routes/challenge.routes"));
const feed_routes_1 = __importDefault(require("./routes/feed.routes"));
const focus_routes_1 = __importDefault(require("./routes/focus.routes"));
const habit_routes_1 = __importDefault(require("./routes/habit.routes"));
const progress_routes_1 = __importDefault(require("./routes/progress.routes"));
const social_routes_1 = __importDefault(require("./routes/social.routes"));
const team_routes_1 = __importDefault(require("./routes/team.routes"));
const chat_routes_1 = __importDefault(require("./routes/chat.routes"));
const test_routes_1 = __importDefault(require("./routes/test.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const app = (0, express_1.default)();
// Security Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)({ origin: env_1.config.cors.origin }));
app.use(express_1.default.json());
app.use(rateLimit_middleware_1.globalLimiter);
// Documentation
app.use('/api-docs', swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});
// API Routes
app.use('/api/auth', auth_routes_1.default);
app.use('/api/users', user_routes_1.default);
app.use('/api/habits', habit_routes_1.default);
app.use('/api/habits', habit_routes_1.default);
app.use('/api/challenges', challenge_routes_1.default);
app.use('/api/feed', feed_routes_1.default);
app.use('/api/focus', focus_routes_1.default);
app.use('/api/teams', team_routes_1.default);
app.use('/api/progress', progress_routes_1.default);
app.use('/api/social', social_routes_1.default);
app.use('/api/chat', chat_routes_1.default);
app.use('/api/test', test_routes_1.default);
// Error handling
app.use(error_middleware_1.errorHandler);
exports.default = app;
//# sourceMappingURL=app.js.map