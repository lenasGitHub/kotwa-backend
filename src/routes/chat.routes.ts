import { Router } from 'express';
import {
  getConversations,
  getOrCreateConversation,
  getMessages,
  sendMessage,
} from '../controllers/chatController';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Get all conversations for the authenticated user
router.get('/conversations', authenticate, getConversations);

// Get or create a 1-on-1 conversation
router.post('/conversations', authenticate, getOrCreateConversation);

// Get messages for a conversation (paginated)
router.get('/conversations/:conversationId/messages', authenticate, getMessages);

// Send a message (REST fallback)
router.post('/conversations/:conversationId/messages', authenticate, sendMessage);

export default router;
