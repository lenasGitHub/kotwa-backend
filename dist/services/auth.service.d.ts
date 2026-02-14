export declare class AuthService {
    private static generateOTP;
    static register(data: {
        username: string;
        password: string;
        gender?: string;
        birthday?: string;
        email?: string;
        phoneNumber?: string;
    }): Promise<{
        user: {
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
        };
        token: string;
    }>;
    static loginWithPassword(username: string, password: string): Promise<{
        user: {
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
        };
        token: string;
    }>;
    static sendOTP(phoneNumber: string): Promise<string>;
    static verifyOTP(phoneNumber: string, otp: string): Promise<{
        user: {
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
        };
        token: string;
    }>;
    static checkUsername(username: string): Promise<{
        available: boolean;
    }>;
    static forgotPassword(identifier: string): Promise<{
        message: string;
        phoneNumber: string;
    }>;
    static resetPassword(phoneNumber: string, otp: string, newPassword: string): Promise<{
        message: string;
    }>;
    static deleteAccount(userId: string): Promise<{
        message: string;
    }>;
    static changePassword(userId: string, currentPassword: string, newPassword: string): Promise<{
        message: string;
    }>;
}
//# sourceMappingURL=auth.service.d.ts.map