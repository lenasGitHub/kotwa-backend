import crypto from 'crypto';
import prisma from '../utils/prisma';

export class SocialService {
  // Generate unique invite code
  private static generateInviteCode(): string {
    return crypto.randomBytes(6).toString('hex').toUpperCase();
  }

  // 1. POST /social/invite - Create invite (global or for a habit)
  static async createInvite(
    userId: string,
    habitId?: string,
    phoneNumber?: string,
  ) {
    let habitTitle = 'Global Connection';

    // If habitId is provided, verify user is part of this habit
    if (habitId) {
      const habit = await prisma.habit.findFirst({
        where: {
          id: habitId,
          joinedUsers: {
            some: { id: userId },
          },
        },
      });

      if (!habit) {
        throw new Error('You must join this habit before creating an invite');
      }
      habitTitle = habit.title;
    }

    // Generate unique code
    const code = this.generateInviteCode();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invite = await prisma.habitInvite.create({
      data: {
        code,
        habitId: habitId || null,
        inviterId: userId,
        inviteePhone: phoneNumber || null, // Optional: restrict to this phone
        expiresAt,
      },
      include: {
        habit: true,
      },
    });

    return {
      code: invite.code,
      habitId: invite.habitId,
      habitTitle: invite.habit?.title || 'Global Connection',
      inviteePhone: invite.inviteePhone,
      expiresAt: invite.expiresAt,
      inviteLink: `kotwa://invite/${invite.code}`,
    };
  }

  // 2. POST /social/invite/accept - Accept invite
  static async acceptInvite(userId: string, code: string) {
    // Get the accepting user's phone number
    const acceptingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { phoneNumber: true },
    });

    const invite = await prisma.habitInvite.findUnique({
      where: { code },
      include: {
        habit: {
          include: {
            joinedUsers: {
              where: { id: userId },
            },
          },
        },
        inviter: {
          select: {
            id: true,
            username: true,
          },
        },
      },
    });

    if (!invite) {
      throw new Error('Invalid invite code');
    }

    if (invite.expiresAt < new Date()) {
      throw new Error('Invite has expired');
    }

    if (invite.usedById) {
      throw new Error('Invite has already been used');
    }

    if (invite.inviterId === userId) {
      throw new Error('You cannot accept your own invite');
    }

    // Check phone restriction if set
    if (
      invite.inviteePhone &&
      invite.inviteePhone !== acceptingUser?.phoneNumber
    ) {
      throw new Error('This invite is for a different phone number');
    }

    // If habit-specific, check if user already joined
    if (invite.habit && invite.habit.joinedUsers.length > 0) {
      throw new Error('You have already joined this habit');
    }

    // Transaction: join habit (if any) + create friendship + mark invite used + award XP
    await prisma.$transaction(async (tx: any) => {
      // 1. Join the habit if it's a habit-specific invite
      if (invite.habitId) {
        await tx.user.update({
          where: { id: userId },
          data: {
            joinedHabits: {
              connect: { id: invite.habitId },
            },
          },
        });
      }

      // 2. Mark invite as used
      await tx.habitInvite.update({
        where: { id: invite.id },
        data: { usedById: userId },
      });

      // 3. Award XP to inviter (+50 XP for successful referral)
      await tx.user.update({
        where: { id: invite.inviterId },
        data: {
          xp: { increment: 50 },
        },
      });

      // 4. Create friendship (both directions)
      await tx.friendship.upsert({
        where: {
          userId_friendId: { userId: invite.inviterId, friendId: userId },
        },
        update: { status: 'ACCEPTED' },
        create: {
          userId: invite.inviterId,
          friendId: userId,
          status: 'ACCEPTED',
        },
      });
      await tx.friendship.upsert({
        where: {
          userId_friendId: { userId: userId, friendId: invite.inviterId },
        },
        update: { status: 'ACCEPTED' },
        create: {
          userId: userId,
          friendId: invite.inviterId,
          status: 'ACCEPTED',
        },
      });
    });

    return {
      message: invite.habitId
        ? 'Successfully joined habit and added friend'
        : 'Successfully added friend',
      habitId: invite.habitId || null,
      habitTitle: invite.habit?.title || null,
      newFriend: invite.inviter,
      xpAwarded: 50,
    };
  }

  // 3. POST /social/contacts - Find friends from phone contacts
  static async syncContacts(userId: string, phoneNumbers: string[]) {
    if (!phoneNumbers || phoneNumbers.length === 0) {
      return { users: [] };
    }

    // Find users with matching phone numbers (excluding self)
    const users = await prisma.user.findMany({
      where: {
        phoneNumber: { in: phoneNumbers },
        id: { not: userId },
      },
      select: {
        id: true,
        phoneNumber: true,
        username: true,
        avatarUrl: true,
      },
    });

    // Get existing friendships
    const friendships = await prisma.friendship.findMany({
      where: {
        userId,
        friendId: { in: users.map((u: any) => u.id) },
      },
    });

    const friendIds = new Set(friendships.map((f: any) => f.friendId));

    return {
      users: users.map((user: any) => ({
        ...user,
        isFriend: friendIds.has(user.id),
      })),
    };
  }

  // 4. GET /social/friends - Get friend list
  static async getFriends(userId: string, habitId?: string) {
    const friendships = await prisma.friendship.findMany({
      where: {
        userId,
        status: 'ACCEPTED',
        friend: habitId
          ? {
              joinedHabits: {
                some: { id: habitId },
              },
            }
          : undefined,
      },
      include: {
        friend: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            xp: true,
            level: true,
          },
        },
      },
    });

    return friendships.map((f: any) => ({
      id: f.friend.id,
      username: f.friend.username,
      avatarUrl: f.friend.avatarUrl,
      xp: f.friend.xp,
      level: f.friend.level,
      friendSince: f.createdAt,
    }));
  }

  // 5. POST /social/follow/:userId - Toggle Follow
  static async toggleFollow(followerId: string, followingId: string) {
    if (followerId === followingId) {
      throw new Error('You cannot follow yourself');
    }

    // Check if target user exists and is public
    const targetUser = await prisma.user.findUnique({
      where: { id: followingId },
      select: { isPublic: true },
    });

    if (!targetUser) {
      throw new Error('User not found');
    }

    if (!targetUser.isPublic) {
      // Technically we could allow following private users but with "Requested" status if we wanted.
      // For this task, user said "i can see only the public profiles".
      // Use logic: Only allow following isPublic=true users.
      throw new Error('You can only follow public profiles');
    }

    // Check existing follow
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      });
      return { status: 'unfollowed' };
    } else {
      // Follow
      await prisma.follow.create({
        data: {
          followerId,
          followingId,
        },
      });
      return { status: 'followed' };
    }
  }

  // 6. GET /social/followers - Get users following me
  static async getFollowers(userId: string) {
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            xp: true,
            level: true,
          },
        },
      },
    });

    return followers.map((f: any) => ({
      ...f.follower,
      followedAt: f.createdAt,
    }));
  }

  // 7. GET /social/following - Get users I am following
  static async getFollowing(userId: string) {
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            avatarUrl: true,
            xp: true,
            level: true,
          },
        },
      },
    });

    return following.map((f: any) => ({
      ...f.following,
      followedAt: f.createdAt,
    }));
  }

  // 5. DELETE /social/friends/:friendId - Remove friend
  static async removeFriend(userId: string, friendId: string) {
    // Delete both directions
    await prisma.friendship.deleteMany({
      where: {
        OR: [
          { userId, friendId },
          { userId: friendId, friendId: userId },
        ],
      },
    });

    return { message: 'Friend removed successfully' };
  }
}
