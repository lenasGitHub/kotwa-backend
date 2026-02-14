export declare class HabitService {
    static getCategories(): Promise<{
        id: any;
        name: any;
        biomeType: any;
        mountainIcon: any;
        mountainImage: any;
        stats: {
            totalClimbers: any;
            successRate: number;
            statusTags: never[];
        };
        colorPalette: {
            primary: any;
            secondary: any;
        };
    }[]>;
    static getSubHabits(categoryId: string, filter?: string): Promise<{
        category: {
            id: string;
            name: string;
            biomeType: string;
            mountainIcon: string;
            stats: {
                totalClimbers: number;
                successRate: number;
                statusTags: never[];
            };
            colorPalette: {
                primary: string;
                secondary: string;
            };
        };
        habits: {
            id: any;
            title: any;
            description: any;
            rating: any;
            maturity: any;
            submissionType: any;
            pathDifficulty: any;
            preChallengeGuide: any;
            incentives: any;
            tips: any;
            socialPreview: {
                friendsOnPath: never[];
                liveCount: number;
                recentJoiners: any[];
            };
        }[];
    }>;
    static getHabitById(habitId: string, userId?: string): Promise<{
        id: string;
        title: string;
        description: string | null;
        rating: number;
        maturity: string | null;
        submissionType: string;
        difficulty: string;
        preChallengeGuide: any;
        incentives: any;
        tips: any;
        userState: {
            isJoined: boolean;
            isFavorite: any;
            notifyMe: any;
            userRating: any;
        };
        category: {
            id: string;
            name: string;
            biomeType: string;
            mountainIcon: string;
            mountainImage: string | null;
            colorPalette: {
                primary: string;
                secondary: string;
            };
        };
        stats: {
            averageRating: number;
            globalCompletions: number;
            activeUsers: any;
        };
    }>;
    static toggleFavorite(userId: string, habitId: string): Promise<{
        habitId: string;
        isFavorite: boolean;
    }>;
    static toggleNotification(userId: string, habitId: string): Promise<{
        habitId: string;
        notifyMe: boolean;
    }>;
    static rateHabit(userId: string, habitId: string, rating: number): Promise<{
        habitId: string;
        userRating: number;
        averageRating: number;
    }>;
    static joinHabit(userId: string, habitId: string): Promise<{
        message: string;
        habitId: string;
        categoryId: string;
        habitTitle: string;
    }>;
    static getHabitMembers(habitId: string, filter?: string): Promise<{
        id: any;
        username: any;
        avatarUrl: any;
        xp: any;
        gender: any;
        level: any;
        totalAchievements: any;
    }[]>;
    static unjoinHabit(userId: string, habitId: string): Promise<{
        message: string;
        habitId: string;
        habitTitle: string;
    }>;
}
//# sourceMappingURL=habit.service.d.ts.map