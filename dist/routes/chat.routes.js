"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const chatController_1 = require("../controllers/chatController");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
// Get all conversations for the authenticated user
router.get('/conversations', auth_middleware_1.authenticate, chatController_1.getConversations);
// Get or create a 1-on-1 conversation
router.post('/conversations', auth_middleware_1.authenticate, chatController_1.getOrCreateConversation);
// Get messages for a conversation (paginated)
router.get('/conversations/:conversationId/messages', auth_middleware_1.authenticate, chatController_1.getMessages);
// Send a message (REST fallback)
router.post('/conversations/:conversationId/messages', auth_middleware_1.authenticate, chatController_1.sendMessage);
exports.default = router;
//# sourceMappingURL=chat.routes.js.map