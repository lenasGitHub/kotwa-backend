import { AppError } from '../middleware/error.middleware';
import prisma from '../utils/prisma';

export class FocusService {
    /**
     * Start a new Focus Session
     */
    static async startSession(userId: string, habitId?: string, challengeId?: string) {
        // Check if user has an active session
        const activeSession = await prisma.focusSession.findFirst({
            where: {
                userId,
                status: { in: ['ACTIVE', 'PAUSED'] }
            }
        });

        if (activeSession) {
            throw new AppError('You already have an active focus session', 400);
        }

        const session = await prisma.focusSession.create({
            data: {
                userId,
                habitId,
                challengeId,
                status: 'ACTIVE',
                startTime: new Date(),
            }
        });

        return session;
    }

    /**
     * Pause a Session
     */
    static async pauseSession(userId: string, sessionId: string) {
        const session = await prisma.focusSession.findUnique({
            where: { id: sessionId }
        });

        if (!session) throw new AppError('Session not found', 404);
        if (session.userId !== userId) throw new AppError('Unauthorized', 403);
        if (session.status !== 'ACTIVE') throw new AppError('Session is not active', 400);

        const now = new Date();
        // In a real app, we'd add the segment duration to total duration
        // For now, simple diff from startTime (naive, assumes no previous pauses)
        // To do this robustly, we need a SessionSegment model or similar.
        // Simplifying: we trust client or just mark status change.
        // Let's just update status for now. 
        // Calculating duration accurately requires storing "lastResumedAt". 
        // Let's assume the client sends "elapsed seconds" or we calculate segments.
        // Constraint: Schema has 'duration' Int. 

        // MVP Approach: Just toggle status. Duration is calculated at End.

        return await prisma.focusSession.update({
            where: { id: sessionId },
            data: {
                status: 'PAUSED'
            }
        });
    }

    /**
     * Resume a Session
     */
    static async resumeSession(userId: string, sessionId: string) {
        const session = await prisma.focusSession.findUnique({
            where: { id: sessionId }
        });

        if (!session) throw new AppError('Session not found', 404);
        if (session.userId !== userId) throw new AppError('Unauthorized', 403);
        if (session.status !== 'PAUSED') throw new AppError('Session is not paused', 400);

        return await prisma.focusSession.update({
            where: { id: sessionId },
            data: {
                status: 'ACTIVE'
            }
        });
    }

    /**
     * End Session and Log Progress
     */
    static async endSession(userId: string, sessionId: string, actualDurationSeconds: number) {
        const session = await prisma.focusSession.findUnique({
            where: { id: sessionId },
            include: { habit: true }
        });

        if (!session) throw new AppError('Session not found', 404);
        if (session.userId !== userId) throw new AppError('Unauthorized', 403);
        if (session.status === 'COMPLETED') throw new AppError('Session already completed', 400);

        const result = await prisma.$transaction(async (tx) => {
            // 1. Update Session
            const completedSession = await tx.focusSession.update({
                where: { id: sessionId },
                data: {
                    status: 'COMPLETED',
                    endTime: new Date(),
                    duration: actualDurationSeconds
                }
            });

            // 2. Create Progress Log (if linked to a challenge)
            if (session.challengeId && actualDurationSeconds > 60) {
                await tx.progressLog.create({
                    data: {
                        userId,
                        challengeId: session.challengeId,
                        value: actualDurationSeconds / 60, // Convert to minutes? Or keep seconds? Usually challenges are steps or count. If time-based, minutes is safer default.
                        isSuccess: true,
                        note: `Focus Session: ${Math.floor(actualDurationSeconds / 60)} mins`,
                        date: new Date(),
                    }
                });
            }
            // 3. Create Habit Proof (if linked to a habit but NO challenge, or BOTH?)
            // If linked to habit, we should prove it.
            else if (session.habitId && actualDurationSeconds > 60) {
                await tx.habitProof.create({
                    data: {
                        userId,
                        habitId: session.habitId,
                        imageUrl: null, // Timer proof has no image
                        status: 'APPROVED', // Auto-approve timer sessions? Or PENDING? Auto-approve for now.
                    }
                });
            }

            return completedSession;
        });

        return result;
    }
}
