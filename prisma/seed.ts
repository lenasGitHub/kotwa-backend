import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting seed...');

    // 1. Clean Database
    await prisma.reaction.deleteMany();
    await prisma.focusSession.deleteMany();
    await prisma.habitProof.deleteMany();
    await prisma.progressLog.deleteMany();
    await prisma.challengeParticipant.deleteMany();
    await prisma.challenge.deleteMany();
    await prisma.habitUserSettings.deleteMany();
    await prisma.habitInvite.deleteMany();
    await prisma.habit.deleteMany();
    await prisma.habitCategory.deleteMany();
    await prisma.friendship.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.user.deleteMany();

    // 2. Create Users
    const password = await bcrypt.hash('password123', 10);

    const user1 = await prisma.user.create({
        data: {
            username: 'khaled',
            email: 'khaled@example.com',
            password,
            avatarUrl: 'https://i.pravatar.cc/150?u=khaled',
            level: 5,
            coins: 500,
            xp: 1200,
        }
    });

    const user2 = await prisma.user.create({
        data: {
            username: 'sarah',
            email: 'sarah@example.com',
            password,
            avatarUrl: 'https://i.pravatar.cc/150?u=sarah',
            level: 8,
            coins: 1200,
            xp: 4500,
        }
    });

    const user3 = await prisma.user.create({
        data: {
            username: 'ali',
            email: 'ali@example.com',
            password,
            avatarUrl: 'https://i.pravatar.cc/150?u=ali',
            level: 3,
            coins: 100,
            xp: 300,
        }
    });

    console.log('✅ Users created');

    // 3. Social Connections
    await prisma.friendship.createMany({
        data: [
            { userId: user1.id, friendId: user2.id, status: 'ACCEPTED' },
            { userId: user2.id, friendId: user3.id, status: 'ACCEPTED' },
        ]
    });

    await prisma.follow.createMany({
        data: [
            { followerId: user1.id, followingId: user3.id },
            { followerId: user3.id, followingId: user1.id },
        ]
    });

    console.log('✅ Social connections established');

    // 4. Create Habit Categories (Themes)
    const healthCat = await prisma.habitCategory.create({
        data: {
            name: 'Physical Health',
            biomeType: 'FOREST',
            mountainIcon: 'fitness_center',
            primaryColor: '#4CAF50',
            secondaryColor: '#81C784',
        }
    });

    const spiritualCat = await prisma.habitCategory.create({
        data: {
            name: 'Spiritual Growth',
            biomeType: 'DESERT', // Mecca theme?
            mountainIcon: 'mosque',
            primaryColor: '#FFC107',
            secondaryColor: '#FFD54F',
        }
    });

    console.log('✅ Categories created');

    // 5. Create Habits
    const prayerHabit = await prisma.habit.create({
        data: {
            categoryId: spiritualCat.id,
            title: 'Fajr Prayer',
            description: 'Pray Fajr on time',
            difficulty: 'HARD',
            submissionType: 'PROOF', // Photo of mosque carpet?
        }
    });

    const runHabit = await prisma.habit.create({
        data: {
            categoryId: healthCat.id,
            title: 'Warning Run',
            description: 'Run 5km every morning',
            difficulty: 'MEDIUM',
            submissionType: 'TIMER', // Use Focus Mode
        }
    });

    console.log('✅ Habits created');

    // 6. Focus Sessions (History)
    await prisma.focusSession.create({
        data: {
            userId: user1.id,
            habitId: runHabit.id,
            status: 'COMPLETED',
            startTime: new Date(Date.now() - 3600000), // 1 hour ago
            endTime: new Date(Date.now() - 3600000 + 1800000), // 30 mins duration
            duration: 1800,
        }
    });

    console.log('✅ Focus history created');

    // 7. Create Challenge
    const challenge = await prisma.challenge.create({
        data: {
            creatorId: user2.id,
            title: 'Ramadan Prep',
            description: 'Get ready for Ramadan',
            type: 'COOP',
            category: 'SPIRITUAL',
            targetGoal: 1000,
            startDate: new Date(),
            endDate: new Date(Date.now() + 86400000 * 30), // 30 days
            participants: {
                create: [
                    { userId: user2.id, currentValue: 100 },
                    { userId: user1.id, currentValue: 50 },
                ]
            }
        }
    });

    console.log('✅ Challenges created');

    // 8. Create Proofs & Feed Content
    const proof1 = await prisma.habitProof.create({
        data: {
            userId: user2.id,
            habitId: prayerHabit.id,
            imageUrl: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?ixlib=rb-1.2.1&auto=format&fit=crop&w=500&q=60',
            status: 'APPROVED',
        }
    });

    const proof2 = await prisma.habitProof.create({
        data: {
            userId: user1.id,
            habitId: runHabit.id, // Timer habit can have proof entry too (optional image)
            imageUrl: null,
            status: 'APPROVED',
        }
    });

    // 9. Reactions
    await prisma.reaction.create({
        data: {
            userId: user1.id,
            proofId: proof1.id,
            type: 'HEART',
        }
    });

    console.log('✅ Feed content populated');
    console.log('🚀 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
