"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendMessage = exports.getMessages = exports.getOrCreateConversation = exports.getConversations = void 0;
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
/**
 * Get all conversations for the authenticated user
 */
const getConversations = async (req, res) => {
    try {
        const userId = req.userId;
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: { some: { userId } },
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { id: true, username: true, avatarUrl: true },
                        },
                    },
                },
                messages: {
                    orderBy: { createdAt: 'desc' },
                    take: 1,
                    include: {
                        sender: {
                            select: { id: true, username: true },
                        },
                    },
                },
            },
            orderBy: { updatedAt: 'desc' },
        });
        // Add unread count per conversation
        const result = await Promise.all(conversations.map(async (conv) => {
            const participant = conv.participants.find((p) => p.userId === userId);
            const unreadCount = await prisma.message.count({
                where: {
                    conversationId: conv.id,
                    senderId: { not: userId },
                    createdAt: { gt: participant?.lastReadAt ?? new Date(0) },
                },
            });
            return {
                ...conv,
                lastMessage: conv.messages[0] ?? null,
                messages: undefined,
                unreadCount,
            };
        }));
        res.json({ success: true, data: result });
    }
    catch (error) {
        console.error('getConversations error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getConversations = getConversations;
/**
 * Get or create a 1-on-1 conversation with another user
 */
const getOrCreateConversation = async (req, res) => {
    try {
        const userId = req.userId;
        const { recipientId } = req.body;
        if (!recipientId) {
            return res.status(400).json({ success: false, error: 'recipientId is required' });
        }
        if (recipientId === userId) {
            return res.status(400).json({ success: false, error: 'Cannot chat with yourself' });
        }
        // Check if recipient exists
        const recipient = await prisma.user.findUnique({ where: { id: recipientId } });
        if (!recipient) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        // Find existing 1-on-1 conversation
        const existing = await prisma.conversation.findFirst({
            where: {
                isGroup: false,
                AND: [
                    { participants: { some: { userId } } },
                    { participants: { some: { userId: recipientId } } },
                ],
            },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, username: true, avatarUrl: true } },
                    },
                },
            },
        });
        if (existing) {
            return res.json({ success: true, data: existing });
        }
        // Create new conversation
        const conversation = await prisma.conversation.create({
            data: {
                isGroup: false,
                participants: {
                    create: [
                        { userId },
                        { userId: recipientId },
                    ],
                },
            },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, username: true, avatarUrl: true } },
                    },
                },
            },
        });
        res.status(201).json({ success: true, data: conversation });
    }
    catch (error) {
        console.error('getOrCreateConversation error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getOrCreateConversation = getOrCreateConversation;
/**
 * Get messages for a conversation (paginated)
 */
const getMessages = async (req, res) => {
    try {
        const userId = req.userId;
        const { conversationId } = req.params;
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        // Verify user is a participant
        const participant = await prisma.conversationParticipant.findUnique({
            where: { conversationId_userId: { conversationId, userId } },
        });
        if (!participant) {
            return res.status(403).json({ success: false, error: 'Not a participant' });
        }
        const messages = await prisma.message.findMany({
            where: { conversationId },
            include: {
                sender: { select: { id: true, username: true, avatarUrl: true } },
            },
            orderBy: { createdAt: 'desc' },
            skip: (page - 1) * limit,
            take: limit,
        });
        // Mark as read
        await prisma.conversationParticipant.update({
            where: { conversationId_userId: { conversationId, userId } },
            data: { lastReadAt: new Date() },
        });
        res.json({ success: true, data: messages.reverse() });
    }
    catch (error) {
        console.error('getMessages error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.getMessages = getMessages;
/**
 * Send a message via REST (fallback if socket is down)
 */
const sendMessage = async (req, res) => {
    try {
        const userId = req.userId;
        const { conversationId } = req.params;
        const { content, type } = req.body;
        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, error: 'Message content is required' });
        }
        // Verify user is a participant
        const participant = await prisma.conversationParticipant.findUnique({
            where: { conversationId_userId: { conversationId, userId } },
        });
        if (!participant) {
            return res.status(403).json({ success: false, error: 'Not a participant' });
        }
        const message = await prisma.message.create({
            data: {
                conversationId,
                senderId: userId,
                content: content.trim(),
                type: type || 'TEXT',
            },
            include: {
                sender: { select: { id: true, username: true, avatarUrl: true } },
            },
        });
        // Update conversation timestamp
        await prisma.conversation.update({
            where: { id: conversationId },
            data: { updatedAt: new Date() },
        });
        // Update sender's lastReadAt
        await prisma.conversationParticipant.update({
            where: { conversationId_userId: { conversationId, userId } },
            data: { lastReadAt: new Date() },
        });
        res.status(201).json({ success: true, data: message });
    }
    catch (error) {
        console.error('sendMessage error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};
exports.sendMessage = sendMessage;
//# sourceMappingURL=chatController.js.map