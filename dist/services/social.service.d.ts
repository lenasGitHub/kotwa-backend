export declare class SocialService {
    private static generateInviteCode;
    static createInvite(userId: string, habitId?: string, phoneNumber?: string): Promise<{
        code: string;
        habitId: string | null;
        habitTitle: string;
        inviteePhone: string | null;
        expiresAt: Date;
        inviteLink: string;
    }>;
    static acceptInvite(userId: string, code: string): Promise<{
        message: string;
        habitId: string | null;
        habitTitle: string | null;
        newFriend: {
            username: string;
            id: string;
        };
        xpAwarded: number;
    }>;
    static syncContacts(userId: string, phoneNumbers: string[]): Promise<{
        users: any[];
    }>;
    static getFriends(userId: string, habitId?: string): Promise<{
        id: any;
        username: any;
        avatarUrl: any;
        xp: any;
        level: any;
        friendSince: any;
    }[]>;
    static toggleFollow(followerId: string, followingId: string): Promise<{
        status: string;
    }>;
    static getFollowers(userId: string): Promise<any[]>;
    static getFollowing(userId: string): Promise<any[]>;
    static removeFriend(userId: string, friendId: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=social.service.d.ts.map