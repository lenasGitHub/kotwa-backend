import { Request, Response } from 'express';
/**
 * Get all conversations for the authenticated user
 */
export declare const getConversations: (req: Request, res: Response) => Promise<void>;
/**
 * Get or create a 1-on-1 conversation with another user
 */
export declare const getOrCreateConversation: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Get messages for a conversation (paginated)
 */
export declare const getMessages: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
/**
 * Send a message via REST (fallback if socket is down)
 */
export declare const sendMessage: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=chatController.d.ts.map