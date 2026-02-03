import { AppError } from '../middleware/error.middleware';
import prisma from '../utils/prisma';

export class UserService {
  static async getProfile(userId: string, targetId?: string) {
    const idToFetch = targetId || userId;

    const user = await prisma.user.findUnique({
      where: { id: idToFetch },
      include: {
        badges: true,
        _count: {
          select: {
            followers: true,
            following: true,
            friends: { where: { status: 'ACCEPTED' } }, // Connections
          },
        },
      },
    });

    if (!user) throw new AppError('User not found', 404);

    // Privacy Check
    if (userId !== idToFetch && !user.isPublic) {
      // Check if they are friends, if not, throw error or limit fields
      // For now, adhering to "I can see only public profiles" strictly:
      throw new AppError('This profile is private', 403);
    }

    // Check if current user follows them
    const isFollowing = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: idToFetch,
        },
      },
    });

    return {
      ...user,
      stats: {
        followers: (user as any)._count.followers,
        following: (user as any)._count.following,
        connections: (user as any)._count.friends,
      },
      isFollowing: !!isFollowing,
    };
  }

  static async getUserStats(userId: string) {
    // 1. Check if user is public (or friend/same user)
    // For now, assuming if I can get their profile via existing endpoints, I can get their stats.
    // The controller should handle checking permissions if strict.

    // Calculate aggregated stats
    const totalXP = await prisma.user.findUnique({
      where: { id: userId },
      select: { xp: true, level: true, totalAchievements: true },
    });

    if (!totalXP) {
      throw new AppError('User not found', 404);
    }

    const completedHabits = await prisma.habitProof.count({
      where: {
        userId,
        status: 'APPROVED',
      },
    });

    const joinedHabitsCount = await prisma.habit.count({
      where: {
        joinedUsers: {
          some: { id: userId },
        },
      },
    });

    // Recent Activity (Approals)
    const recentActivity = await prisma.habitProof.findMany({
      where: {
        userId,
        status: 'APPROVED',
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        habit: {
          select: { title: true, category: { select: { mountainIcon: true } } },
        },
      },
    });

    return {
      userId,
      xp: totalXP?.xp || 0,
      level: totalXP?.level || 1,
      totalAchievements: totalXP?.totalAchievements || 0,
      completedProofs: completedHabits,
      activeHabits: joinedHabitsCount,
      recentActivity: recentActivity.map((a: any) => ({
        id: a.id,
        habitTitle: a.habit.title,
        icon: a.habit.category.mountainIcon,
        timestamp: a.createdAt,
      })),
    };
  }

  static async updateProfile(
    userId: string,
    data: {
      username?: string;
      gender?: string;
      birthday?: Date;
      bio?: string;
      avatarUrl?: string;
      isPublic?: boolean;
    },
  ) {
    // Unique Check
    if (data.username) {
      const existing = await prisma.user.findUnique({
        where: { username: data.username },
      });
      if (existing && existing.id !== userId) {
        throw new AppError('Username already taken', 409);
      }
    }

    return await prisma.user.update({
      where: { id: userId },
      data,
    });
  }

  static async getAllUsers(
    filter: { username?: string; email?: string },
    options: { page: number; limit: number },
  ) {
    const { page, limit } = options;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (filter.username) {
      where.username = { contains: filter.username };
    }
    if (filter.email) {
      where.email = { contains: filter.email };
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          email: true,
          avatarUrl: true,
          isPublic: true,
          level: true,
          totalAchievements: true,
        },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
