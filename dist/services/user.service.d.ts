export declare class UserService {
    static getProfile(userId: string, targetId?: string): Promise<{
        stats: {
            followers: any;
            following: any;
            connections: any;
        };
        isFollowing: boolean;
        badges: {
            id: string;
            userId: string;
            badgeId: string;
            earnedAt: Date;
        }[];
        _count: {
            friends: number;
            followers: number;
            following: number;
        };
        username: string;
        gender: string | null;
        birthday: Date | null;
        email: string | null;
        phoneNumber: string | null;
        id: string;
        bio: string | null;
        avatarUrl: string | null;
        otp: string | null;
        otpExpiresAt: Date | null;
        isPublic: boolean;
        xp: number;
        level: number;
        coins: number;
        totalAchievements: number;
        currentMountainId: string | null;
        currentAltitude: number;
        lastActive: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static getUserStats(userId: string): Promise<{
        userId: string;
        xp: number;
        level: number;
        totalAchievements: number;
        completedProofs: number;
        activeHabits: number;
        recentActivity: {
            id: any;
            habitTitle: any;
            icon: any;
            timestamp: any;
        }[];
    }>;
    static updateProfile(userId: string, data: {
        username?: string;
        gender?: string;
        birthday?: Date;
        bio?: string;
        avatarUrl?: string;
        isPublic?: boolean;
    }): Promise<{
        username: string;
        password: string | null;
        gender: string | null;
        birthday: Date | null;
        email: string | null;
        phoneNumber: string | null;
        id: string;
        bio: string | null;
        avatarUrl: string | null;
        otp: string | null;
        otpExpiresAt: Date | null;
        isPublic: boolean;
        xp: number;
        level: number;
        coins: number;
        totalAchievements: number;
        currentMountainId: string | null;
        currentAltitude: number;
        lastActive: Date;
        createdAt: Date;
        updatedAt: Date;
    }>;
    static getAllUsers(filter: {
        username?: string;
        email?: string;
    }, options: {
        page: number;
        limit: number;
    }): Promise<{
        users: {
            username: string;
            email: string | null;
            id: string;
            avatarUrl: string | null;
            isPublic: boolean;
            level: number;
            totalAchievements: number;
        }[];
        pagination: {
            page: number;
            limit: number;
            total: number;
            totalPages: number;
        };
    }>;
}
//# sourceMappingURL=user.service.d.ts.map