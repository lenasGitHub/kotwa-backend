// @ts-nocheck
import { PrismaClient } from '@prisma/client';
import Database from 'better-sqlite3';

const sqlite = new Database('prisma/dev.db');
const prisma = new PrismaClient();

async function migrate() {
  console.log('🚀 Starting migration from SQLite to Postgres...');

  // 1. Habit Categories
  console.log('Migrating HabitCategories...');
  const categories = sqlite
    .prepare('SELECT * FROM HabitCategory')
    .all() as any[];
  for (const cat of categories) {
    await prisma.habitCategory.create({
      data: {
        id: cat.id,
        name: cat.name,
        biomeType: cat.biomeType,
        mountainIcon: cat.mountainIcon,
        mountainImage: cat.mountainImage,
        primaryColor: cat.primaryColor,
        secondaryColor: cat.secondaryColor,
        createdAt: new Date(cat.createdAt),
        updatedAt: new Date(cat.updatedAt),
      },
    });
  }
  console.log(`✅ Migrated ${categories.length} categories.`);

  // 2. Users
  console.log('Migrating Users...');
  const users = sqlite.prepare('SELECT * FROM User').all() as any[];
  for (const user of users) {
    // SQLite 0/1 to Boolean
    /* 
       Schema:
       isPublic Int (0/1) -> Boolean
    */
    // Check if user exists to avoid unique constraint errors (though we did reset)
    await prisma.user.create({
      data: {
        id: user.id,
        username: user.username,
        phoneNumber: user.phoneNumber,
        password: user.password,
        email: user.email,
        gender: user.gender,
        birthday: user.birthday ? new Date(user.birthday) : null,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        otp: user.otp,
        otpExpiresAt: user.otpExpiresAt ? new Date(user.otpExpiresAt) : null,
        isPublic: user.isPublic === 1,
        xp: user.xp,
        level: user.level,
        coins: user.coins,
        totalAchievements: user.totalAchievements,
        currentMountainId: user.currentMountainId,
        currentAltitude: user.currentAltitude,
        lastActive: user.lastActive ? new Date(user.lastActive) : undefined,
        createdAt: new Date(user.createdAt),
        updatedAt: new Date(user.updatedAt),
      },
    });
  }
  console.log(`✅ Migrated ${users.length} users.`);

  // 3. Habits
  console.log('Migrating Habits...');
  const habits = sqlite.prepare('SELECT * FROM Habit').all() as any[];
  for (const habit of habits) {
    await prisma.habit.create({
      data: {
        id: habit.id,
        categoryId: habit.categoryId,
        title: habit.title,
        difficulty: habit.difficulty,
        description: habit.description,
        rating: habit.rating,
        maturity: habit.maturity,
        submissionType: habit.submissionType,
        tips: habit.tips,
        preChallengeGuide: habit.preChallengeGuide,
        incentives: habit.incentives,
        createdAt: new Date(habit.createdAt),
        updatedAt: new Date(habit.updatedAt),
      },
    });
  }
  console.log(`✅ Migrated ${habits.length} habits.`);

  // 4. Habit User Settings (Implicit Join _HabitToUser logic + explicit settings)
  // First, implicit connects from _HabitToUser
  console.log('Migrating Habit Memberships (_HabitToUser)...');
  try {
    const joins = sqlite.prepare('SELECT * FROM _HabitToUser').all() as any[];
    // A is usually HabitId, B is UserId or vice versa. Prisma sorts alphabetically.
    // Habit (H) vs User (U). H comes before U. So A is Habit, B is User.
    // Let's verify with IDs.
    // Sample: A: 'cml3p26oo0000kfu2x91csv28', B: 'cml3nnv0h000019iqxgumnoyx'
    // User sample ID: cml3nnv0h000019iqxgumnoyx
    // Habit sample ID: cml3p26oo0000kfu2x91csv28
    // So A=Habit, B=User.

    for (const join of joins) {
      await prisma.habit.update({
        where: { id: join.A },
        data: {
          joinedUsers: {
            connect: { id: join.B },
          },
        },
      });
    }
    console.log(`✅ Migrated ${joins.length} habit memberships.`);
  } catch (e: any) {
    console.log('Could not find _HabitToUser or failed to migrate:', e.message);
  }

  // 5. Explicit HabitUserSettings
  console.log('Migrating HabitUserSettings...');
  const settings = sqlite
    .prepare('SELECT * FROM HabitUserSettings')
    .all() as any[];
  for (const setting of settings) {
    await prisma.habitUserSettings.create({
      data: {
        userId: setting.userId,
        habitId: setting.habitId,
        isFavorite: setting.isFavorite === 1,
        notifyMe: setting.notifyMe === 1,
        rating: setting.rating,
        createdAt: new Date(setting.createdAt),
        updatedAt: new Date(setting.updatedAt),
      },
    });
  }
  console.log(`✅ Migrated ${settings.length} habit settings.`);

  // 6. HabitProofs
  console.log('Migrating HabitProofs...');
  const proofs = sqlite.prepare('SELECT * FROM HabitProof').all() as any[];
  for (const proof of proofs) {
    await prisma.habitProof.create({
      data: {
        id: proof.id,
        userId: proof.userId,
        habitId: proof.habitId,
        imageUrl: proof.imageUrl,
        round: proof.round,
        status: proof.status,
        createdAt: new Date(proof.createdAt),
        updatedAt: new Date(proof.updatedAt),
      },
    });
  }
  console.log(`✅ Migrated ${proofs.length} proofs.`);

  // 7. ProofVotes
  console.log('Migrating ProofVotes...');
  const votes = sqlite.prepare('SELECT * FROM ProofVote').all() as any[];
  for (const vote of votes) {
    await prisma.proofVote.create({
      data: {
        id: vote.id,
        proofId: vote.proofId,
        voterId: vote.voterId,
        voteType: vote.voteType,
        createdAt: new Date(vote.createdAt),
      },
    });
  }
  console.log(`✅ Migrated ${votes.length} votes.`);

  // 8. HabitInvites
  console.log('Migrating HabitInvites...');
  const invites = sqlite.prepare('SELECT * FROM HabitInvite').all() as any[];
  for (const invite of invites) {
    await prisma.habitInvite.create({
      data: {
        id: invite.id,
        code: invite.code,
        habitId: invite.habitId,
        inviterId: invite.inviterId,
        inviteePhone: invite.inviteePhone,
        expiresAt: new Date(invite.expiresAt),
        usedById: invite.usedById,
        createdAt: new Date(invite.createdAt),
      },
    });
  }
  console.log(`✅ Migrated ${invites.length} invites.`);

  // 9. Friendships
  console.log('Migrating Friendships...');
  const friendships = sqlite.prepare('SELECT * FROM Friendship').all() as any[];
  for (const friend of friendships) {
    await prisma.friendship.create({
      data: {
        id: friend.id,
        userId: friend.userId,
        friendId: friend.friendId,
        status: friend.status,
        createdAt: new Date(friend.createdAt),
      },
    });
  }
  console.log(`✅ Migrated ${friendships.length} friendships.`);

  console.log('🎉 Migration complete!');
}

migrate()
  .catch(e => {
    console.error('❌ Migration failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    sqlite.close();
  });
