"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.HabitService = void 0;
const prisma_1 = __importDefault(require("../utils/prisma"));
class HabitService {
    // 1. GET /habits/categories (The Biomes)
    static async getCategories() {
        const categories = await prisma_1.default.habitCategory.findMany({
            include: {
                _count: {
                    select: { activeClimbers: true },
                },
            },
        });
        return categories.map((cat) => ({
            id: cat.id,
            name: cat.name,
            biomeType: cat.biomeType,
            mountainIcon: cat.mountainIcon,
            mountainImage: cat.mountainImage,
            stats: {
                // Real climber count from DB relation
                totalClimbers: cat._count.activeClimbers,
                successRate: 0.85, // Placeholder: requires ProgressLog aggregation
                statusTags: [],
            },
            colorPalette: {
                primary: cat.primaryColor,
                secondary: cat.secondaryColor,
            },
        }));
    }
    // 2. GET /habits/sub/:categoryId (The Trails)
    static async getSubHabits(categoryId, filter) {
        // Fetch Category Details
        const category = await prisma_1.default.habitCategory.findUnique({
            where: { id: categoryId },
            include: {
                _count: {
                    select: { activeClimbers: true },
                },
            },
        });
        if (!category) {
            throw new Error('Category not found'); // Or custom AppError
        }
        // Sort Logic for Habits
        let orderBy = undefined;
        if (filter === 'POPULARITY') {
            // Assuming we have a way to count participants per habit?
            // Currently Habit doesn't have a direct count relation easy to sort by without aggregation
            // We can mock it or use created at for now if schema limits
            // Let's assume we sort by Difficulty for "Popularity" mock or just ID
            orderBy = { title: 'asc' }; // Placeholder for popularity
        }
        else if (filter === 'TRENDS') {
            orderBy = { updatedAt: 'desc' };
        }
        // Fetch Habits
        const habits = await prisma_1.default.habit.findMany({
            where: { categoryId: categoryId },
            orderBy: orderBy,
        });
        // In-memory sorting for non-Prisma sorts
        if (filter === 'RATING') {
            habits.sort((a, b) => (Math.random() > 0.5 ? -1 : 1));
        }
        else if (filter === 'RECOMMENDED') {
            habits.sort(() => Math.random() - 0.5);
        }
        else if (filter === 'POPULARITY') {
            // Better mock for popularity if DB sort isn't available
            habits.sort((a, b) => (Math.random() > 0.5 ? -1 : 1));
        }
        return {
            category: {
                id: category.id,
                name: category.name,
                biomeType: category.biomeType,
                mountainIcon: category.mountainIcon,
                stats: {
                    totalClimbers: category._count.activeClimbers,
                    successRate: 0.85,
                    statusTags: [],
                },
                colorPalette: {
                    primary: category.primaryColor,
                    secondary: category.secondaryColor,
                },
            },
            habits: await Promise.all(habits.map(async (h) => {
                // Fetch distinct recent joiners for this specific habit
                const joiners = await prisma_1.default.habitUserSettings.findMany({
                    where: { habitId: h.id },
                    orderBy: { createdAt: 'desc' },
                    take: 3,
                    select: {
                        user: {
                            select: { avatarUrl: true },
                        },
                    },
                });
                const recentAvatars = joiners
                    .map((j) => j.user.avatarUrl)
                    .filter(Boolean);
                // FALLBACK: If no settings found (legacy joins), check the direct relation
                if (recentAvatars.length === 0) {
                    const legacyJoiners = await prisma_1.default.habit.findUnique({
                        where: { id: h.id },
                        select: {
                            joinedUsers: {
                                take: 3,
                                select: { avatarUrl: true },
                            },
                        },
                    });
                    if (legacyJoiners?.joinedUsers) {
                        recentAvatars.push(...legacyJoiners.joinedUsers
                            .map((u) => u.avatarUrl)
                            .filter(Boolean));
                    }
                }
                return {
                    id: h.id,
                    title: h.title,
                    description: h.description,
                    rating: h.rating,
                    maturity: h.maturity,
                    submissionType: h.submissionType,
                    pathDifficulty: h.difficulty,
                    preChallengeGuide: h.preChallengeGuide
                        ? JSON.parse(h.preChallengeGuide)
                        : {},
                    incentives: h.incentives ? JSON.parse(h.incentives) : {},
                    tips: h.tips ? JSON.parse(h.tips) : [],
                    // Social preview can be real if we query ChallengeParticipants
                    socialPreview: {
                        friendsOnPath: [], // Requires friend graph
                        liveCount: Math.floor(Math.random() * 50) + 10, // Mock for now
                        recentJoiners: recentAvatars,
                    },
                };
            })),
        };
    }
    // 3. GET /habits/:id (Specific Trail Details)
    static async getHabitById(habitId, userId) {
        const habit = await prisma_1.default.habit.findUnique({
            where: { id: habitId },
            include: {
                category: true,
                _count: {
                    select: { joinedUsers: true },
                },
                userSettings: userId
                    ? {
                        where: { userId },
                    }
                    : false,
                joinedUsers: userId
                    ? {
                        where: { id: userId },
                        select: { id: true },
                    }
                    : false,
            },
        });
        if (!habit) {
            throw new Error('Habit not found');
        }
        const userSettings = habit.userSettings?.[0] || {
            isFavorite: false,
            notifyMe: false,
        };
        const isJoined = habit.joinedUsers?.length > 0;
        return {
            id: habit.id,
            title: habit.title,
            description: habit.description,
            rating: habit.rating,
            maturity: habit.maturity,
            submissionType: habit.submissionType,
            difficulty: habit.difficulty,
            preChallengeGuide: habit.preChallengeGuide
                ? JSON.parse(habit.preChallengeGuide)
                : {},
            incentives: habit.incentives ? JSON.parse(habit.incentives) : {},
            tips: habit.tips ? JSON.parse(habit.tips) : [],
            userState: {
                isJoined,
                isFavorite: userSettings.isFavorite,
                notifyMe: userSettings.notifyMe,
                userRating: userSettings.rating,
            },
            category: {
                id: habit.category.id,
                name: habit.category.name,
                biomeType: habit.category.biomeType,
                mountainIcon: habit.category.mountainIcon,
                mountainImage: habit.category.mountainImage,
                colorPalette: {
                    primary: habit.category.primaryColor,
                    secondary: habit.category.secondaryColor,
                },
            },
            stats: {
                averageRating: habit.rating,
                globalCompletions: 120, // Mock
                activeUsers: habit._count.joinedUsers,
            },
        };
    }
    // Toggle Favorite
    static async toggleFavorite(userId, habitId) {
        const settings = await prisma_1.default.habitUserSettings.findUnique({
            where: { userId_habitId: { userId, habitId } },
        });
        const isFavorite = settings ? !settings.isFavorite : true;
        await prisma_1.default.habitUserSettings.upsert({
            where: { userId_habitId: { userId, habitId } },
            update: { isFavorite },
            create: { userId, habitId, isFavorite: true },
        });
        return { habitId, isFavorite };
    }
    // Toggle Notifications
    static async toggleNotification(userId, habitId) {
        const settings = await prisma_1.default.habitUserSettings.findUnique({
            where: { userId_habitId: { userId, habitId } },
        });
        const notifyMe = settings ? !settings.notifyMe : true; // Default is false, so toggling makes it true
        await prisma_1.default.habitUserSettings.upsert({
            where: { userId_habitId: { userId, habitId } },
            update: { notifyMe },
            create: { userId, habitId, notifyMe },
        });
        return { habitId, notifyMe };
    }
    // Rate Habit
    static async rateHabit(userId, habitId, rating) {
        if (rating < 1 || rating > 5) {
            throw new Error('Rating must be between 1 and 5');
        }
        // Check if user is joined
        const habit = await prisma_1.default.habit.findUnique({
            where: { id: habitId },
            include: {
                joinedUsers: {
                    where: { id: userId },
                },
            },
        });
        if (!habit || habit.joinedUsers.length === 0) {
            throw new Error('You must join this habit before rating it');
        }
        // Update user's specific rating
        await prisma_1.default.habitUserSettings.upsert({
            where: { userId_habitId: { userId, habitId } },
            update: { rating },
            create: { userId, habitId, rating, isFavorite: false, notifyMe: false },
        });
        // Recalculate average rating for the habit
        const result = await prisma_1.default.habitUserSettings.aggregate({
            where: {
                habitId,
                rating: { not: null },
            },
            _avg: {
                rating: true,
            },
        });
        const newAvgRating = result._avg.rating || 0;
        await prisma_1.default.habit.update({
            where: { id: habitId },
            data: { rating: newAvgRating },
        });
        return {
            habitId,
            userRating: rating,
            averageRating: newAvgRating,
        };
    }
    // 4. POST /habits/join (Join a specific Sub-Habit)
    static async joinHabit(userId, habitId) {
        try {
            const habit = await prisma_1.default.habit.findUnique({
                where: { id: habitId },
                include: {
                    category: true,
                    joinedUsers: {
                        where: { id: userId },
                    },
                },
            });
            if (!habit) {
                throw new Error('Habit not found');
            }
            // Check if user already joined this habit
            if (habit.joinedUsers.length > 0) {
                throw new Error('You have already joined this habit');
            }
            // Connect User to Habit AND Category (Biome)
            // Also initialize UserSettings to track join date
            await prisma_1.default.$transaction([
                prisma_1.default.user.update({
                    where: { id: userId },
                    data: {
                        joinedHabits: {
                            connect: { id: habitId },
                        },
                        // Also add them as an active climber of the parent mountain (category)
                        currentMountain: {
                            connect: { id: habit.categoryId },
                        },
                    },
                }),
                prisma_1.default.habitUserSettings.upsert({
                    where: { userId_habitId: { userId, habitId } },
                    create: { userId, habitId, isFavorite: false, notifyMe: false },
                    update: {}, // Do nothing if exists (shouldn't happen on fresh join but safe)
                }),
            ]);
            return {
                message: 'Successfully joined habit',
                habitId: habit.id,
                categoryId: habit.category.id,
                habitTitle: habit.title,
            };
        }
        catch (error) {
            console.error(`Error joining habit ${habitId} for user ${userId}:`, JSON.stringify(error, null, 2));
            throw error;
        }
    }
    static async getHabitMembers(habitId, filter = 'RECENT') {
        let users;
        if (filter === 'RECENT') {
            // Use HabitUserSettings.createdAt as proxy for join time
            const settings = await prisma_1.default.habitUserSettings.findMany({
                where: { habitId },
                orderBy: { createdAt: 'desc' },
                take: 10,
                include: {
                    user: {
                        select: {
                            id: true,
                            username: true,
                            avatarUrl: true,
                            xp: true,
                            gender: true,
                            level: true,
                        },
                    },
                },
            });
            users = settings.map((s) => s.user);
        }
        else {
            // Filters based on User stats
            let orderBy = { xp: 'desc' };
            if (filter === 'TOP_ACHIEVEMENTS') {
                orderBy = { totalAchievements: 'desc' };
            }
            users = await prisma_1.default.user.findMany({
                where: {
                    joinedHabits: {
                        some: { id: habitId },
                    },
                },
                orderBy,
                take: 10,
                select: {
                    id: true,
                    username: true,
                    avatarUrl: true,
                    xp: true,
                    gender: true,
                    level: true,
                    totalAchievements: true,
                },
            });
        }
        return users.map((u) => ({
            id: u.id,
            username: u.username,
            avatarUrl: u.avatarUrl,
            xp: u.xp,
            gender: u.gender,
            level: u.level,
            totalAchievements: u.totalAchievements,
        }));
    }
    // 5. DELETE /habits/unjoin (Leave a specific Sub-Habit and clean up data)
    static async unjoinHabit(userId, habitId) {
        // Check if user is actually joined
        const habit = await prisma_1.default.habit.findFirst({
            where: {
                id: habitId,
                joinedUsers: {
                    some: { id: userId },
                },
            },
            include: { category: true },
        });
        if (!habit) {
            throw new Error('You are not a member of this habit');
        }
        // Transaction: remove from habit + delete proofs + delete votes
        await prisma_1.default.$transaction(async (tx) => {
            // 1. Delete user's votes on proofs for this habit
            await tx.proofVote.deleteMany({
                where: {
                    voterId: userId,
                    proof: {
                        habitId,
                    },
                },
            });
            // 2. Delete votes on user's proofs for this habit
            await tx.proofVote.deleteMany({
                where: {
                    proof: {
                        userId,
                        habitId,
                    },
                },
            });
            // 3. Delete user's proofs for this habit
            await tx.habitProof.deleteMany({
                where: {
                    userId,
                    habitId,
                },
            });
            // 4. Remove user from habit
            await tx.user.update({
                where: { id: userId },
                data: {
                    joinedHabits: {
                        disconnect: { id: habitId },
                    },
                },
            });
        });
        return {
            message: 'Successfully left habit and removed all related data',
            habitId: habit.id,
            habitTitle: habit.title,
        };
    }
}
exports.HabitService = HabitService;
//# sourceMappingURL=habit.service.js.map