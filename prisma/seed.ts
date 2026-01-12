import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Seeding database...');

    // Create demo users
    const password = await bcrypt.hash('password123', 12);

    const lena = await prisma.user.upsert({
        where: { email: 'lena@example.com' },
        update: {},
        create: {
            email: 'lena@example.com',
            password,
            name: 'Lena',
            avatarUrl: 'https://i.pravatar.cc/150?img=68',
            totalXp: 1200,
            currentLevel: 12,
            currentStreak: 5,
        },
    });

    const sarah = await prisma.user.upsert({
        where: { email: 'sarah@example.com' },
        update: {},
        create: {
            email: 'sarah@example.com',
            password,
            name: 'Sarah',
            avatarUrl: 'https://i.pravatar.cc/150?img=1',
            totalXp: 900,
            currentLevel: 10,
            currentStreak: 3,
        },
    });

    const ahmed = await prisma.user.upsert({
        where: { email: 'ahmed@example.com' },
        update: {},
        create: {
            email: 'ahmed@example.com',
            password,
            name: 'Ahmed',
            avatarUrl: 'https://i.pravatar.cc/150?img=3',
            totalXp: 2100,
            currentLevel: 25,
            currentStreak: 21,
        },
    });

    console.log('✅ Users created:', lena.name, sarah.name, ahmed.name);

    // Create a team
    const team = await prisma.team.upsert({
        where: { inviteCode: 'mecca-walkers' },
        update: {},
        create: {
            name: 'Mecca Walkers',
            description: 'Walking our way to Mecca together!',
            inviteCode: 'mecca-walkers',
            members: {
                create: [
                    { userId: lena.id, role: 'admin' },
                    { userId: sarah.id, role: 'member' },
                    { userId: ahmed.id, role: 'member' },
                ],
            },
        },
    });

    console.log('✅ Team created:', team.name);

    // Create the "Walk to Mecca" challenge
    const meccaChallenge = await prisma.challenge.upsert({
        where: { id: 'mecca-walk-2024' },
        update: {},
        create: {
            id: 'mecca-walk-2024',
            title: 'The Walk to Mecca',
            description: 'Walk 1,500km together as a team over 30 days.',
            type: 'COOP',
            category: 'HEALTH',
            targetGoal: 1500000, // 1.5M steps
            startDate: new Date(),
            endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            creatorId: lena.id,
            teamId: team.id,
            isPublic: true,
        },
    });

    // Add participants
    const participants = [
        { userId: lena.id, currentValue: 120000 },
        { userId: sarah.id, currentValue: 85000 },
        { userId: ahmed.id, currentValue: 400000 },
    ];

    for (const p of participants) {
        await prisma.challengeParticipant.upsert({
            where: {
                userId_challengeId: { userId: p.userId, challengeId: meccaChallenge.id },
            },
            update: { currentValue: p.currentValue },
            create: {
                userId: p.userId,
                challengeId: meccaChallenge.id,
                currentValue: p.currentValue,
            },
        });
    }

    console.log('✅ Challenge created:', meccaChallenge.title);

    // Create badges
    const badges = [
        { name: 'Sugar Slayer', description: 'Completed 14 days sugar-free challenge', xpReward: 500 },
        { name: 'Early Bird', description: 'Woke up before 5:30 AM for 30 days', xpReward: 1000 },
        { name: 'Team Player', description: 'Participated in 5 team challenges', xpReward: 300 },
        { name: 'First Steps', description: 'Logged your first activity', xpReward: 50 },
    ];

    for (const badge of badges) {
        await prisma.badge.upsert({
            where: { name: badge.name },
            update: {},
            create: badge,
        });
    }

    console.log('✅ Badges created');
    console.log('🎉 Seeding complete!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
