"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.triggerSocketTest = void 0;
const socket_1 = require("../socket");
const triggerSocketTest = async (req, res, next) => {
    try {
        const userId = req.userId;
        const { message } = req.body;
        console.log(`🧪 Triggering socket test for user ${userId}`);
        // Emit event back to user via Socket
        const received = await (0, socket_1.emitToUser)(userId, 'test:cycle_response', {
            message: message || 'Hello from Backend!',
            timestamp: Date.now(),
            serverTime: new Date().toISOString()
        });
        res.json({
            success: true,
            data: {
                targetUser: userId,
                eventEmitted: 'test:cycle_response',
                userConnected: received, // emitToUser returns true if sent to active socket
                note: received ? 'User is online and received event' : 'User is offline (or on different node), event queued'
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.triggerSocketTest = triggerSocketTest;
//# sourceMappingURL=testController.js.map