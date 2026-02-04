import { NextFunction, Request, Response } from 'express';
import { emitToUser } from '../socket';

export const triggerSocketTest = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const userId = (req as any).userId;
        const { message } = req.body;

        console.log(`🧪 Triggering socket test for user ${userId}`);

        // Emit event back to user via Socket
        const received = await emitToUser(userId, 'test:cycle_response', {
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
    } catch (error) {
        next(error);
    }
};
