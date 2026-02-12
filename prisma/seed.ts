import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ── Helpers ──────────────────────────────────────────────────────────────
const daysAgo = (n: number) => new Date(Date.now() - 86_400_000 * n);
const daysFromNow = (n: number) => new Date(Date.now() + 86_400_000 * n);
const hoursAgo = (n: number) => new Date(Date.now() - 3_600_000 * n);
const randomCode = () => Math.random().toString(36).substring(2, 10).toUpperCase();

async function main() {
    console.log('🌱 Starting comprehensive seed…');

    // ─── 1. Clean Database (order respects FK constraints) ───────────────
    await prisma.reaction.deleteMany();
    await prisma.proofVote.deleteMany();
    await prisma.habitProof.deleteMany();
    await prisma.focusSession.deleteMany();
    await prisma.progressLog.deleteMany();
    await prisma.challengeParticipant.deleteMany();
    await prisma.challenge.deleteMany();
    await prisma.habitUserSettings.deleteMany();
    await prisma.habitInvite.deleteMany();
    await prisma.habit.deleteMany();
    await prisma.habitCategory.deleteMany();
    await prisma.teamMember.deleteMany();
    await prisma.team.deleteMany();
    await prisma.userBadge.deleteMany();
    await prisma.badge.deleteMany();
    await prisma.friendship.deleteMany();
    await prisma.follow.deleteMany();
    await prisma.userInventoryItem.deleteMany();
    await prisma.user.deleteMany();

    console.log('🗑️  Database cleaned');

    // ─── 2. Users ────────────────────────────────────────────────────────
    const password = await bcrypt.hash('password123', 10);

    const usersData = [
        { username: 'khaled',   email: 'khaled@kotwa.app',   phoneNumber: '+966501234567', gender: 'male',   birthday: new Date('1995-03-15'), bio: 'Fitness enthusiast & early riser',          level: 12, xp: 6800,  coins: 1500, totalAchievements: 8  },
        { username: 'sarah',    email: 'sarah@kotwa.app',    phoneNumber: '+966509876543', gender: 'female', birthday: new Date('1998-07-22'), bio: 'Spiritual growth is my daily mission',     level: 18, xp: 14200, coins: 3200, totalAchievements: 15 },
        { username: 'ali',      email: 'ali@kotwa.app',      phoneNumber: '+966505551234', gender: 'male',   birthday: new Date('2000-01-10'), bio: 'Student | Quran memorizer',                level: 7,  xp: 2100,  coins: 400,  totalAchievements: 3  },
        { username: 'noura',    email: 'noura@kotwa.app',    phoneNumber: '+966507778899', gender: 'female', birthday: new Date('1997-11-05'), bio: 'Marathon runner & healthy cook',            level: 14, xp: 9500,  coins: 2100, totalAchievements: 11 },
        { username: 'omar',     email: 'omar@kotwa.app',     phoneNumber: '+966502223344', gender: 'male',   birthday: new Date('1993-06-30'), bio: 'Deep work advocate | Software engineer',   level: 20, xp: 18000, coins: 5000, totalAchievements: 20 },
        { username: 'layla',    email: 'layla@kotwa.app',    phoneNumber: '+966508884455', gender: 'female', birthday: new Date('1999-09-18'), bio: 'Journaling & mindfulness lover',           level: 9,  xp: 3600,  coins: 800,  totalAchievements: 5  },
        { username: 'youssef',  email: 'youssef@kotwa.app',  phoneNumber: '+966503336677', gender: 'male',   birthday: new Date('1996-12-01'), bio: 'Night owl trying to become a morning person', level: 5,  xp: 1200,  coins: 250,  totalAchievements: 2  },
        { username: 'amina',    email: 'amina@kotwa.app',    phoneNumber: '+966506669988', gender: 'female', birthday: new Date('2001-04-14'), bio: 'Reading 52 books this year 📚',            level: 11, xp: 5800,  coins: 1300, totalAchievements: 7  },
    ];

    const users = [];
    for (const u of usersData) {
        const user = await prisma.user.create({
            data: {
                ...u,
                password,
                avatarUrl: `https://i.pravatar.cc/150?u=${u.username}`,
                isPublic: true,
                lastActive: hoursAgo(Math.floor(Math.random() * 48)),
            },
        });
        users.push(user);
    }

    const [khaled, sarah, ali, noura, omar, layla, youssef, amina] = users;
    console.log(`✅ ${users.length} users created`);

    // ─── 3. User Inventory Items ─────────────────────────────────────────
    const inventoryItems = [
        { userId: khaled.id,  itemId: 'hiking_boots' },
        { userId: khaled.id,  itemId: 'water_bottle' },
        { userId: sarah.id,   itemId: 'prayer_mat' },
        { userId: sarah.id,   itemId: 'golden_compass' },
        { userId: sarah.id,   itemId: 'lantern' },
        { userId: omar.id,    itemId: 'focus_crystal' },
        { userId: omar.id,    itemId: 'time_shield' },
        { userId: noura.id,   itemId: 'running_shoes' },
        { userId: amina.id,   itemId: 'book_of_wisdom' },
        { userId: ali.id,     itemId: 'quran_bookmark' },
        { userId: layla.id,   itemId: 'journal_pen' },
        { userId: youssef.id, itemId: 'alarm_clock' },
    ];

    await prisma.userInventoryItem.createMany({ data: inventoryItems });
    console.log('✅ Inventory items created');

    // ─── 4. Teams ────────────────────────────────────────────────────────
    const teamAlpha = await prisma.team.create({
        data: {
            name: 'Morning Warriors',
            description: 'We wake up before Fajr and conquer the day',
            avatarUrl: 'https://i.pravatar.cc/150?u=team_warriors',
        },
    });

    const teamBeta = await prisma.team.create({
        data: {
            name: 'Quran Circle',
            description: 'Daily Quran recitation and memorization group',
            avatarUrl: 'https://i.pravatar.cc/150?u=team_quran',
        },
    });

    const teamGamma = await prisma.team.create({
        data: {
            name: 'Fitness Squad',
            description: 'Push each other to stay active every single day',
            avatarUrl: 'https://i.pravatar.cc/150?u=team_fitness',
        },
    });

    // Team Members
    await prisma.teamMember.createMany({
        data: [
            { userId: khaled.id,  teamId: teamAlpha.id, role: 'admin'  },
            { userId: sarah.id,   teamId: teamAlpha.id, role: 'member' },
            { userId: omar.id,    teamId: teamAlpha.id, role: 'member' },
            { userId: youssef.id, teamId: teamAlpha.id, role: 'member' },

            { userId: sarah.id,   teamId: teamBeta.id,  role: 'admin'  },
            { userId: ali.id,     teamId: teamBeta.id,   role: 'member' },
            { userId: amina.id,   teamId: teamBeta.id,   role: 'member' },
            { userId: layla.id,   teamId: teamBeta.id,   role: 'member' },

            { userId: noura.id,   teamId: teamGamma.id, role: 'admin'  },
            { userId: khaled.id,  teamId: teamGamma.id, role: 'member' },
            { userId: omar.id,    teamId: teamGamma.id, role: 'member' },
        ],
    });
    console.log('✅ Teams & members created');

    // ─── 5. Badges ───────────────────────────────────────────────────────
    const badgesData = [
        { name: 'Early Bird',         description: 'Complete a habit before 6 AM',                iconUrl: '🌅', xpReward: 100 },
        { name: 'Streak Master',      description: 'Maintain a 30-day streak',                    iconUrl: '🔥', xpReward: 500 },
        { name: 'Social Butterfly',   description: 'Add 10 friends on the platform',              iconUrl: '🦋', xpReward: 150 },
        { name: 'Mountain Climber',   description: 'Reach altitude 1000 on any mountain',         iconUrl: '🏔️', xpReward: 300 },
        { name: 'Team Player',        description: 'Complete 5 team challenges',                   iconUrl: '🤝', xpReward: 250 },
        { name: 'Quran Scholar',      description: 'Complete 30 days of Quran recitation',         iconUrl: '📖', xpReward: 400 },
        { name: 'Iron Will',          description: 'Survive a SURVIVOR challenge without losing a heart', iconUrl: '🛡️', xpReward: 350 },
        { name: 'Centurion',          description: 'Log 100 progress entries',                     iconUrl: '💯', xpReward: 200 },
        { name: 'Night Owl Reformed', description: 'Sleep before 11 PM for 14 consecutive days',   iconUrl: '🌙', xpReward: 250 },
        { name: 'Hydration Hero',     description: 'Drink 8 glasses of water daily for 21 days',   iconUrl: '💧', xpReward: 150 },
    ];

    const badges = [];
    for (const b of badgesData) {
        const badge = await prisma.badge.create({ data: b });
        badges.push(badge);
    }

    // Assign badges to users
    await prisma.userBadge.createMany({
        data: [
            { userId: khaled.id, badgeId: badges[0].id, earnedAt: daysAgo(45) },
            { userId: khaled.id, badgeId: badges[1].id, earnedAt: daysAgo(10) },
            { userId: khaled.id, badgeId: badges[3].id, earnedAt: daysAgo(5)  },
            { userId: sarah.id,  badgeId: badges[0].id, earnedAt: daysAgo(60) },
            { userId: sarah.id,  badgeId: badges[1].id, earnedAt: daysAgo(30) },
            { userId: sarah.id,  badgeId: badges[4].id, earnedAt: daysAgo(20) },
            { userId: sarah.id,  badgeId: badges[5].id, earnedAt: daysAgo(15) },
            { userId: omar.id,   badgeId: badges[1].id, earnedAt: daysAgo(25) },
            { userId: omar.id,   badgeId: badges[6].id, earnedAt: daysAgo(8)  },
            { userId: omar.id,   badgeId: badges[7].id, earnedAt: daysAgo(3)  },
            { userId: noura.id,  badgeId: badges[0].id, earnedAt: daysAgo(40) },
            { userId: noura.id,  badgeId: badges[9].id, earnedAt: daysAgo(12) },
            { userId: ali.id,    badgeId: badges[5].id, earnedAt: daysAgo(7)  },
            { userId: amina.id,  badgeId: badges[2].id, earnedAt: daysAgo(18) },
            { userId: layla.id,  badgeId: badges[8].id, earnedAt: daysAgo(14) },
        ],
    });
    console.log('✅ Badges & user badges created');

    // ─── 6. Friendships ──────────────────────────────────────────────────
    await prisma.friendship.createMany({
        data: [
            { userId: khaled.id,  friendId: sarah.id,   status: 'ACCEPTED' },
            { userId: khaled.id,  friendId: omar.id,    status: 'ACCEPTED' },
            { userId: khaled.id,  friendId: noura.id,   status: 'ACCEPTED' },
            { userId: sarah.id,   friendId: ali.id,     status: 'ACCEPTED' },
            { userId: sarah.id,   friendId: layla.id,   status: 'ACCEPTED' },
            { userId: sarah.id,   friendId: amina.id,   status: 'ACCEPTED' },
            { userId: omar.id,    friendId: noura.id,   status: 'ACCEPTED' },
            { userId: omar.id,    friendId: youssef.id, status: 'ACCEPTED' },
            { userId: ali.id,     friendId: amina.id,   status: 'PENDING'  },
            { userId: layla.id,   friendId: youssef.id, status: 'ACCEPTED' },
            { userId: noura.id,   friendId: amina.id,   status: 'ACCEPTED' },
        ],
    });

    // ─── 7. Follows ──────────────────────────────────────────────────────
    await prisma.follow.createMany({
        data: [
            { followerId: khaled.id,  followingId: sarah.id   },
            { followerId: khaled.id,  followingId: omar.id    },
            { followerId: sarah.id,   followingId: khaled.id  },
            { followerId: sarah.id,   followingId: noura.id   },
            { followerId: ali.id,     followingId: sarah.id   },
            { followerId: ali.id,     followingId: khaled.id  },
            { followerId: noura.id,   followingId: khaled.id  },
            { followerId: noura.id,   followingId: omar.id    },
            { followerId: omar.id,    followingId: sarah.id   },
            { followerId: layla.id,   followingId: amina.id   },
            { followerId: amina.id,   followingId: layla.id   },
            { followerId: youssef.id, followingId: omar.id    },
            { followerId: youssef.id, followingId: khaled.id  },
        ],
    });
    console.log('✅ Friendships & follows created');

    // ─── 8. Habit Categories ─────────────────────────────────────────────
    const healthCat = await prisma.habitCategory.create({
        data: {
            name: 'Physical Health',
            biomeType: 'FOREST',
            mountainIcon: 'fitness_center',
            mountainImage: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=600',
            primaryColor: '#4CAF50',
            secondaryColor: '#81C784',
        },
    });

    const spiritualCat = await prisma.habitCategory.create({
        data: {
            name: 'Spiritual Growth',
            biomeType: 'DESERT',
            mountainIcon: 'mosque',
            mountainImage: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=600',
            primaryColor: '#FFC107',
            secondaryColor: '#FFD54F',
        },
    });

    const productivityCat = await prisma.habitCategory.create({
        data: {
            name: 'Productivity',
            biomeType: 'MOUNTAIN',
            mountainIcon: 'psychology',
            mountainImage: 'https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=600',
            primaryColor: '#2196F3',
            secondaryColor: '#64B5F6',
        },
    });

    const mentalCat = await prisma.habitCategory.create({
        data: {
            name: 'Mental Wellness',
            biomeType: 'OCEAN',
            mountainIcon: 'self_improvement',
            mountainImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600',
            primaryColor: '#9C27B0',
            secondaryColor: '#CE93D8',
        },
    });

    const socialCat = await prisma.habitCategory.create({
        data: {
            name: 'Social & Community',
            biomeType: 'VILLAGE',
            mountainIcon: 'groups',
            mountainImage: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600',
            primaryColor: '#FF5722',
            secondaryColor: '#FF8A65',
        },
    });

    // Set currentMountain for some users
    await prisma.user.update({ where: { id: khaled.id }, data: { currentMountainId: healthCat.id, currentAltitude: 450 } });
    await prisma.user.update({ where: { id: sarah.id },  data: { currentMountainId: spiritualCat.id, currentAltitude: 820 } });
    await prisma.user.update({ where: { id: omar.id },   data: { currentMountainId: productivityCat.id, currentAltitude: 1100 } });
    await prisma.user.update({ where: { id: noura.id },  data: { currentMountainId: healthCat.id, currentAltitude: 670 } });

    console.log('✅ Habit categories created');

    // ─── 9. Habits ───────────────────────────────────────────────────────
    const habitsData = [
        // Physical Health
        { categoryId: healthCat.id, title: 'Morning Run',           description: 'Run 5 km every morning before breakfast',                     difficulty: 'MEDIUM', submissionType: 'TIMER',  rating: 4.5, maturity: 'Intermediate', tips: JSON.stringify([{ text: 'Start with a 5-min warm-up walk', type: 'beginner' }, { text: 'Track your pace with a watch', type: 'advanced' }]) },
        { categoryId: healthCat.id, title: 'Drink 8 Glasses Water', description: 'Stay hydrated throughout the day with at least 8 glasses',     difficulty: 'EASY',   submissionType: 'INPUT',  rating: 4.8, maturity: 'Beginner',     tips: JSON.stringify([{ text: 'Keep a water bottle at your desk', type: 'beginner' }]) },
        { categoryId: healthCat.id, title: '100 Push-ups',          description: 'Complete 100 push-ups spread across the day',                  difficulty: 'HARD',   submissionType: 'PROOF',  rating: 4.2, maturity: 'Advanced',     tips: JSON.stringify([{ text: 'Break into sets of 20', type: 'intermediate' }]) },
        { categoryId: healthCat.id, title: 'No Junk Food',          description: 'Avoid all processed and fast food for the entire day',         difficulty: 'MEDIUM', submissionType: 'PROOF',  rating: 4.0, maturity: 'Intermediate' },
        // Spiritual Growth
        { categoryId: spiritualCat.id, title: 'Fajr Prayer On Time',   description: 'Pray Fajr within its designated time window',              difficulty: 'HARD',   submissionType: 'PROOF',  rating: 4.9, maturity: 'Beginner',     tips: JSON.stringify([{ text: 'Set an alarm 15 min before Fajr', type: 'beginner' }, { text: 'Sleep early to wake up refreshed', type: 'beginner' }]) },
        { categoryId: spiritualCat.id, title: 'Read 1 Page of Quran',  description: 'Read at least one page of the Quran daily with reflection', difficulty: 'EASY',   submissionType: 'PROOF',  rating: 4.7, maturity: 'Beginner' },
        { categoryId: spiritualCat.id, title: 'Evening Adhkar',        description: 'Recite the evening remembrance after Asr prayer',           difficulty: 'EASY',   submissionType: 'DATE',   rating: 4.6, maturity: 'Beginner' },
        { categoryId: spiritualCat.id, title: 'Memorize 5 Ayahs',      description: 'Memorize 5 new ayahs from the Quran each day',              difficulty: 'HARD',   submissionType: 'PROOF',  rating: 4.3, maturity: 'Advanced' },
        // Productivity
        { categoryId: productivityCat.id, title: 'Deep Work 2 Hours',    description: 'Focus intensely for 2 hours without any distractions',   difficulty: 'HARD',   submissionType: 'TIMER',  rating: 4.4, maturity: 'Intermediate', tips: JSON.stringify([{ text: 'Put your phone in another room', type: 'beginner' }, { text: 'Use the Pomodoro technique', type: 'intermediate' }]) },
        { categoryId: productivityCat.id, title: 'Plan Tomorrow Tonight', description: 'Write down 3 priorities for tomorrow before sleeping',   difficulty: 'EASY',   submissionType: 'INPUT',  rating: 4.1, maturity: 'Beginner' },
        { categoryId: productivityCat.id, title: 'No Social Media',      description: 'Stay off social media for the entire day',                difficulty: 'HARD',   submissionType: 'DATE',   rating: 3.9, maturity: 'Intermediate' },
        // Mental Wellness
        { categoryId: mentalCat.id, title: 'Gratitude Journal',   description: 'Write down 3 things you are grateful for today',                  difficulty: 'EASY',   submissionType: 'INPUT',  rating: 4.6, maturity: 'Beginner' },
        { categoryId: mentalCat.id, title: '10-Min Meditation',   description: 'Sit quietly and meditate for at least 10 minutes',                difficulty: 'MEDIUM', submissionType: 'TIMER',  rating: 4.5, maturity: 'Beginner' },
        { categoryId: mentalCat.id, title: 'Read 30 Pages',       description: 'Read 30 pages of a non-fiction book',                             difficulty: 'MEDIUM', submissionType: 'INPUT',  rating: 4.3, maturity: 'Intermediate' },
        // Social & Community
        { categoryId: socialCat.id, title: 'Call a Family Member', description: 'Call a family member or old friend to strengthen bonds',          difficulty: 'EASY',   submissionType: 'DATE',   rating: 4.7, maturity: 'Beginner' },
        { categoryId: socialCat.id, title: 'Volunteer 1 Hour',    description: 'Spend at least 1 hour helping your community or a charity',       difficulty: 'MEDIUM', submissionType: 'PROOF',  rating: 4.8, maturity: 'Intermediate' },
    ];

    const habits = [];
    for (const h of habitsData) {
        const habit = await prisma.habit.create({ data: h });
        habits.push(habit);
    }

    // Name aliases for readability
    const [morningRun, drinkWater, pushUps, noJunk, fajr, quranPage, adhkar, memorize, deepWork, planTomorrow, noSocial, gratitude, meditation, read30, callFamily, volunteer] = habits;

    // Connect users to habits (joinedUsers)
    await prisma.habit.update({ where: { id: morningRun.id },    data: { joinedUsers: { connect: [{ id: khaled.id }, { id: noura.id }, { id: omar.id }] } } });
    await prisma.habit.update({ where: { id: drinkWater.id },    data: { joinedUsers: { connect: [{ id: khaled.id }, { id: sarah.id }, { id: noura.id }, { id: layla.id }] } } });
    await prisma.habit.update({ where: { id: fajr.id },          data: { joinedUsers: { connect: [{ id: sarah.id }, { id: ali.id }, { id: khaled.id }, { id: amina.id }] } } });
    await prisma.habit.update({ where: { id: quranPage.id },     data: { joinedUsers: { connect: [{ id: sarah.id }, { id: ali.id }, { id: amina.id }] } } });
    await prisma.habit.update({ where: { id: deepWork.id },      data: { joinedUsers: { connect: [{ id: omar.id }, { id: youssef.id }] } } });
    await prisma.habit.update({ where: { id: gratitude.id },     data: { joinedUsers: { connect: [{ id: layla.id }, { id: amina.id }] } } });
    await prisma.habit.update({ where: { id: meditation.id },    data: { joinedUsers: { connect: [{ id: layla.id }, { id: noura.id }] } } });
    await prisma.habit.update({ where: { id: read30.id },        data: { joinedUsers: { connect: [{ id: amina.id }, { id: omar.id }] } } });
    await prisma.habit.update({ where: { id: callFamily.id },    data: { joinedUsers: { connect: [{ id: sarah.id }, { id: layla.id }] } } });
    await prisma.habit.update({ where: { id: pushUps.id },       data: { joinedUsers: { connect: [{ id: khaled.id }, { id: omar.id }] } } });

    console.log('✅ Habits created & users joined');

    // ─── 10. Habit User Settings ─────────────────────────────────────────
    await prisma.habitUserSettings.createMany({
        data: [
            { userId: khaled.id, habitId: morningRun.id, isFavorite: true,  notifyMe: true,  rating: 5 },
            { userId: khaled.id, habitId: drinkWater.id, isFavorite: false, notifyMe: true,  rating: 4 },
            { userId: khaled.id, habitId: fajr.id,       isFavorite: true,  notifyMe: true,  rating: 5 },
            { userId: sarah.id,  habitId: fajr.id,       isFavorite: true,  notifyMe: true,  rating: 5 },
            { userId: sarah.id,  habitId: quranPage.id,  isFavorite: true,  notifyMe: true,  rating: 5 },
            { userId: omar.id,   habitId: deepWork.id,   isFavorite: true,  notifyMe: true,  rating: 4 },
            { userId: omar.id,   habitId: morningRun.id, isFavorite: false, notifyMe: false, rating: 3 },
            { userId: noura.id,  habitId: morningRun.id, isFavorite: true,  notifyMe: true,  rating: 5 },
            { userId: layla.id,  habitId: gratitude.id,  isFavorite: true,  notifyMe: true,  rating: 5 },
            { userId: amina.id,  habitId: read30.id,     isFavorite: true,  notifyMe: true,  rating: 4 },
        ],
    });
    console.log('✅ Habit user settings created');

    // ─── 11. Challenges ──────────────────────────────────────────────────
    const challenge1 = await prisma.challenge.create({
        data: {
            title: 'Ramadan Preparation',
            description: 'Build spiritual stamina before Ramadan — pray all 5 prayers on time for 30 days',
            type: 'COOP',
            category: 'SPIRITUAL',
            icon: 'mosque',
            difficulty: 'MEDIUM',
            targetGoal: 150,
            startDate: daysAgo(10),
            endDate: daysFromNow(20),
            creatorId: sarah.id,
            teamId: teamBeta.id,
            isPublic: true,
        },
    });

    const challenge2 = await prisma.challenge.create({
        data: {
            title: 'Walk to Mecca',
            description: 'Collectively walk 1,500,000 steps as a team — the distance from Riyadh to Mecca',
            type: 'COOP',
            category: 'HEALTH',
            icon: 'directions_walk',
            difficulty: 'HARD',
            targetGoal: 1500000,
            startDate: daysAgo(5),
            endDate: daysFromNow(55),
            creatorId: khaled.id,
            teamId: teamGamma.id,
            isPublic: true,
        },
    });

    const challenge3 = await prisma.challenge.create({
        data: {
            title: 'Survivor: No Sugar',
            description: 'Avoid all added sugar — lose a heart each time you fail. 3 hearts max!',
            type: 'SURVIVOR',
            category: 'HEALTH',
            icon: 'no_food',
            difficulty: 'HARD',
            targetGoal: 21,
            maxHearts: 3,
            startDate: daysAgo(3),
            endDate: daysFromNow(18),
            creatorId: noura.id,
            isPublic: true,
        },
    });

    const challenge4 = await prisma.challenge.create({
        data: {
            title: 'Deep Focus Week',
            description: 'Accumulate 14 hours of deep work in 7 days',
            type: 'COUNTER',
            category: 'PRODUCTIVITY',
            icon: 'psychology',
            difficulty: 'HARD',
            targetGoal: 840,
            startDate: daysAgo(2),
            endDate: daysFromNow(5),
            creatorId: omar.id,
            isPublic: true,
        },
    });

    const challenge5 = await prisma.challenge.create({
        data: {
            title: 'Gratitude Month',
            description: 'Write in your gratitude journal every day for 30 days',
            type: 'BOOLEAN',
            category: 'MENTAL',
            icon: 'favorite',
            difficulty: 'EASY',
            targetGoal: 30,
            startDate: daysAgo(15),
            endDate: daysFromNow(15),
            creatorId: layla.id,
            isPublic: true,
        },
    });

    const challenge6 = await prisma.challenge.create({
        data: {
            title: 'Quran Khatma Relay',
            description: 'Each member reads 5 juz then passes the baton — complete the Quran as a relay!',
            type: 'RELAY',
            category: 'SPIRITUAL',
            icon: 'menu_book',
            difficulty: 'MEDIUM',
            targetGoal: 30,
            startDate: daysAgo(7),
            endDate: daysFromNow(53),
            creatorId: ali.id,
            teamId: teamBeta.id,
            isPublic: true,
        },
    });

    console.log('✅ Challenges created');

    // ─── 12. Challenge Participants ──────────────────────────────────────
    await prisma.challengeParticipant.createMany({
        data: [
            // Ramadan Preparation
            { userId: sarah.id,   challengeId: challenge1.id, currentValue: 42  },
            { userId: ali.id,     challengeId: challenge1.id, currentValue: 35  },
            { userId: amina.id,   challengeId: challenge1.id, currentValue: 28  },
            { userId: layla.id,   challengeId: challenge1.id, currentValue: 20  },
            // Walk to Mecca
            { userId: khaled.id,  challengeId: challenge2.id, currentValue: 85000  },
            { userId: noura.id,   challengeId: challenge2.id, currentValue: 120000 },
            { userId: omar.id,    challengeId: challenge2.id, currentValue: 65000  },
            // Survivor: No Sugar
            { userId: noura.id,   challengeId: challenge3.id, currentValue: 3,  heartsLeft: 3, isEliminated: false },
            { userId: khaled.id,  challengeId: challenge3.id, currentValue: 2,  heartsLeft: 2, isEliminated: false },
            { userId: sarah.id,   challengeId: challenge3.id, currentValue: 3,  heartsLeft: 3, isEliminated: false },
            { userId: youssef.id, challengeId: challenge3.id, currentValue: 1,  heartsLeft: 1, isEliminated: false },
            // Deep Focus Week
            { userId: omar.id,    challengeId: challenge4.id, currentValue: 360 },
            { userId: youssef.id, challengeId: challenge4.id, currentValue: 120 },
            // Gratitude Month
            { userId: layla.id,   challengeId: challenge5.id, currentValue: 14 },
            { userId: amina.id,   challengeId: challenge5.id, currentValue: 12 },
            { userId: sarah.id,   challengeId: challenge5.id, currentValue: 15 },
            // Quran Khatma Relay
            { userId: ali.id,     challengeId: challenge6.id, currentValue: 5, relayOrder: 1, relayCompleted: true  },
            { userId: sarah.id,   challengeId: challenge6.id, currentValue: 3, relayOrder: 2, relayCompleted: false },
            { userId: amina.id,   challengeId: challenge6.id, currentValue: 0, relayOrder: 3, relayCompleted: false },
            { userId: layla.id,   challengeId: challenge6.id, currentValue: 0, relayOrder: 4, relayCompleted: false },
        ],
    });
    console.log('✅ Challenge participants created');

    // ─── 13. Progress Logs ───────────────────────────────────────────────
    const progressData = [
        // Khaled — Walk to Mecca
        { userId: khaled.id, challengeId: challenge2.id, value: 12000, isSuccess: true, note: 'Great morning walk around the neighborhood', date: daysAgo(4) },
        { userId: khaled.id, challengeId: challenge2.id, value: 15000, isSuccess: true, note: 'Walked to the office and back',              date: daysAgo(3) },
        { userId: khaled.id, challengeId: challenge2.id, value: 18000, isSuccess: true, note: 'Hiked in the park with friends',              date: daysAgo(2) },
        { userId: khaled.id, challengeId: challenge2.id, value: 20000, isSuccess: true, note: 'Personal best! Long evening walk',            date: daysAgo(1) },
        { userId: khaled.id, challengeId: challenge2.id, value: 20000, isSuccess: true, note: 'Kept the momentum going',                     date: daysAgo(0) },
        // Noura — Walk to Mecca
        { userId: noura.id,  challengeId: challenge2.id, value: 22000, isSuccess: true, note: 'Morning jog + evening walk',                  date: daysAgo(4) },
        { userId: noura.id,  challengeId: challenge2.id, value: 25000, isSuccess: true, note: 'Ran a half marathon route!',                  date: daysAgo(3) },
        { userId: noura.id,  challengeId: challenge2.id, value: 28000, isSuccess: true, note: 'New personal record',                         date: daysAgo(2) },
        { userId: noura.id,  challengeId: challenge2.id, value: 23000, isSuccess: true, note: 'Recovery day but still walked a lot',         date: daysAgo(1) },
        { userId: noura.id,  challengeId: challenge2.id, value: 22000, isSuccess: true, note: 'Steady pace today',                           date: daysAgo(0) },
        // Omar — Deep Focus
        { userId: omar.id,   challengeId: challenge4.id, value: 120,   isSuccess: true, note: 'Solid 2-hour deep work session on the API',   date: daysAgo(1) },
        { userId: omar.id,   challengeId: challenge4.id, value: 120,   isSuccess: true, note: 'Another focused morning block',               date: daysAgo(0) },
        { userId: omar.id,   challengeId: challenge4.id, value: 120,   isSuccess: true, note: 'Finished the auth module refactor',           date: daysAgo(2) },
        // Sarah — Ramadan Prep
        { userId: sarah.id,  challengeId: challenge1.id, value: 5,     isSuccess: true, note: 'All 5 prayers on time alhamdulillah',         date: daysAgo(3) },
        { userId: sarah.id,  challengeId: challenge1.id, value: 5,     isSuccess: true, note: 'Prayed in the masjid today',                  date: daysAgo(2) },
        { userId: sarah.id,  challengeId: challenge1.id, value: 4,     isSuccess: true, note: 'Missed Isha by a few minutes',                date: daysAgo(1) },
        // Layla — Gratitude
        { userId: layla.id,  challengeId: challenge5.id, value: 1,     isSuccess: true, note: 'Grateful for my health, family, and this app', date: daysAgo(5) },
        { userId: layla.id,  challengeId: challenge5.id, value: 1,     isSuccess: true, note: 'Thankful for a productive day at work',        date: daysAgo(4) },
        { userId: layla.id,  challengeId: challenge5.id, value: 1,     isSuccess: true, note: 'Grateful for the sunset I saw today',          date: daysAgo(3) },
        { userId: layla.id,  challengeId: challenge5.id, value: 1,     isSuccess: true, note: 'Appreciating small moments with friends',      date: daysAgo(2) },
        // Ali — Quran Relay
        { userId: ali.id,    challengeId: challenge6.id, value: 1,     isSuccess: true, note: 'Completed Juz 1 — Al-Baqarah beginning',      date: daysAgo(6) },
        { userId: ali.id,    challengeId: challenge6.id, value: 1,     isSuccess: true, note: 'Completed Juz 2',                              date: daysAgo(5) },
        { userId: ali.id,    challengeId: challenge6.id, value: 1,     isSuccess: true, note: 'Completed Juz 3 — Aal-Imran',                  date: daysAgo(4) },
        { userId: ali.id,    challengeId: challenge6.id, value: 1,     isSuccess: true, note: 'Completed Juz 4',                              date: daysAgo(3) },
        { userId: ali.id,    challengeId: challenge6.id, value: 1,     isSuccess: true, note: 'Completed Juz 5 — passing the baton to Sarah!', date: daysAgo(2) },
    ];

    await prisma.progressLog.createMany({ data: progressData });
    console.log('✅ Progress logs created');

    // ─── 14. Habit Proofs ────────────────────────────────────────────────
    const proof1 = await prisma.habitProof.create({
        data: {
            userId: sarah.id,
            habitId: fajr.id,
            imageUrl: 'https://images.unsplash.com/photo-1564121211835-e88c852648ab?w=500',
            round: 1,
            status: 'APPROVED',
            createdAt: daysAgo(3),
        },
    });

    const proof2 = await prisma.habitProof.create({
        data: {
            userId: khaled.id,
            habitId: morningRun.id,
            imageUrl: 'https://images.unsplash.com/photo-1571008887538-b36bb32f4571?w=500',
            round: 1,
            status: 'APPROVED',
            createdAt: daysAgo(2),
        },
    });

    const proof3 = await prisma.habitProof.create({
        data: {
            userId: ali.id,
            habitId: quranPage.id,
            imageUrl: 'https://images.unsplash.com/photo-1609599006353-e629aaabfeae?w=500',
            round: 1,
            status: 'APPROVED',
            createdAt: daysAgo(1),
        },
    });

    const proof4 = await prisma.habitProof.create({
        data: {
            userId: noura.id,
            habitId: morningRun.id,
            imageUrl: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=500',
            round: 2,
            status: 'APPROVED',
            createdAt: daysAgo(1),
        },
    });

    const proof5 = await prisma.habitProof.create({
        data: {
            userId: omar.id,
            habitId: deepWork.id,
            imageUrl: null,
            round: 1,
            status: 'APPROVED',
            createdAt: daysAgo(1),
        },
    });

    const proof6 = await prisma.habitProof.create({
        data: {
            userId: layla.id,
            habitId: gratitude.id,
            imageUrl: null,
            round: 1,
            status: 'PENDING',
            createdAt: hoursAgo(3),
        },
    });

    const proof7 = await prisma.habitProof.create({
        data: {
            userId: amina.id,
            habitId: read30.id,
            imageUrl: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500',
            round: 1,
            status: 'PENDING',
            createdAt: hoursAgo(1),
        },
    });

    const proof8 = await prisma.habitProof.create({
        data: {
            userId: youssef.id,
            habitId: deepWork.id,
            imageUrl: null,
            round: 1,
            status: 'REJECTED',
            createdAt: daysAgo(2),
        },
    });

    console.log('✅ Habit proofs created');

    // ─── 15. Proof Votes ─────────────────────────────────────────────────
    await prisma.proofVote.createMany({
        data: [
            { proofId: proof1.id, voterId: khaled.id, voteType: 'APPROVE' },
            { proofId: proof1.id, voterId: ali.id,    voteType: 'APPROVE' },
            { proofId: proof1.id, voterId: amina.id,  voteType: 'APPROVE' },
            { proofId: proof2.id, voterId: sarah.id,  voteType: 'APPROVE' },
            { proofId: proof2.id, voterId: noura.id,  voteType: 'APPROVE' },
            { proofId: proof3.id, voterId: sarah.id,  voteType: 'APPROVE' },
            { proofId: proof3.id, voterId: amina.id,  voteType: 'APPROVE' },
            { proofId: proof4.id, voterId: khaled.id, voteType: 'APPROVE' },
            { proofId: proof4.id, voterId: omar.id,   voteType: 'APPROVE' },
            { proofId: proof5.id, voterId: youssef.id, voteType: 'APPROVE' },
            { proofId: proof8.id, voterId: omar.id,   voteType: 'REJECT'  },
            { proofId: proof8.id, voterId: khaled.id, voteType: 'REJECT'  },
        ],
    });
    console.log('✅ Proof votes created');

    // ─── 16. Reactions ───────────────────────────────────────────────────
    await prisma.reaction.createMany({
        data: [
            { userId: khaled.id,  proofId: proof1.id, type: 'HEART'  },
            { userId: ali.id,     proofId: proof1.id, type: 'FIRE'   },
            { userId: noura.id,   proofId: proof2.id, type: 'MUSCLE' },
            { userId: sarah.id,   proofId: proof2.id, type: 'CLAP'   },
            { userId: sarah.id,   proofId: proof3.id, type: 'HEART'  },
            { userId: amina.id,   proofId: proof3.id, type: 'FIRE'   },
            { userId: khaled.id,  proofId: proof4.id, type: 'FIRE'   },
            { userId: omar.id,    proofId: proof4.id, type: 'MUSCLE' },
            { userId: youssef.id, proofId: proof5.id, type: 'CLAP'   },
            { userId: layla.id,   proofId: proof7.id, type: 'HEART'  },
        ],
    });
    console.log('✅ Reactions created');

    // ─── 17. Habit Invites ───────────────────────────────────────────────
    await prisma.habitInvite.createMany({
        data: [
            { code: randomCode(), habitId: morningRun.id, inviterId: khaled.id, expiresAt: daysFromNow(7) },
            { code: randomCode(), habitId: fajr.id,       inviterId: sarah.id,  expiresAt: daysFromNow(14), inviteePhone: '+966504445566' },
            { code: randomCode(), habitId: deepWork.id,   inviterId: omar.id,   expiresAt: daysFromNow(7) },
            { code: randomCode(), habitId: gratitude.id,  inviterId: layla.id,  expiresAt: daysFromNow(30) },
            { code: randomCode(), habitId: null,           inviterId: sarah.id,  expiresAt: daysFromNow(7) }, // Global friendship invite
            { code: randomCode(), habitId: quranPage.id,  inviterId: ali.id,    expiresAt: daysFromNow(10), usedById: amina.id },
        ],
    });
    console.log('✅ Habit invites created');

    // ─── 18. Focus Sessions ──────────────────────────────────────────────
    await prisma.focusSession.createMany({
        data: [
            // Completed sessions
            { userId: khaled.id, habitId: morningRun.id,  status: 'COMPLETED',  startTime: hoursAgo(26), endTime: hoursAgo(25.5), duration: 1800 },
            { userId: khaled.id, habitId: morningRun.id,  status: 'COMPLETED',  startTime: hoursAgo(2),  endTime: hoursAgo(1.5),  duration: 1800 },
            { userId: omar.id,   habitId: deepWork.id,    status: 'COMPLETED',  startTime: hoursAgo(5),  endTime: hoursAgo(3),    duration: 7200 },
            { userId: omar.id,   habitId: deepWork.id,    status: 'COMPLETED',  startTime: hoursAgo(29), endTime: hoursAgo(27),   duration: 7200 },
            { userId: omar.id,   challengeId: challenge4.id, status: 'COMPLETED', startTime: hoursAgo(53), endTime: hoursAgo(51), duration: 7200 },
            { userId: noura.id,  habitId: morningRun.id,  status: 'COMPLETED',  startTime: hoursAgo(3),  endTime: hoursAgo(2.25), duration: 2700 },
            { userId: layla.id,  habitId: meditation.id,  status: 'COMPLETED',  startTime: hoursAgo(8),  endTime: hoursAgo(7.83), duration: 600  },
            { userId: layla.id,  habitId: meditation.id,  status: 'COMPLETED',  startTime: hoursAgo(32), endTime: hoursAgo(31.83), duration: 600 },
            { userId: amina.id,  habitId: read30.id,      status: 'COMPLETED',  startTime: hoursAgo(4),  endTime: hoursAgo(3.25), duration: 2700 },
            // Active session
            { userId: youssef.id, habitId: deepWork.id,   status: 'ACTIVE',     startTime: new Date(),   duration: 0 },
            // Abandoned session
            { userId: youssef.id, habitId: deepWork.id,   status: 'ABANDONED',  startTime: hoursAgo(48), endTime: hoursAgo(47.75), duration: 900 },
        ],
    });
    console.log('✅ Focus sessions created');

    // ─── Summary ─────────────────────────────────────────────────────────
    console.log('\n🚀 Seed completed successfully!');
    console.log('───────────────────────────────────');
    console.log(`   Users:                 ${users.length}`);
    console.log(`   Inventory Items:       ${inventoryItems.length}`);
    console.log(`   Teams:                 3`);
    console.log(`   Badges:                ${badgesData.length}`);
    console.log(`   Habit Categories:      5`);
    console.log(`   Habits:                ${habitsData.length}`);
    console.log(`   Challenges:            6`);
    console.log(`   Challenge Participants: 20`);
    console.log(`   Progress Logs:         ${progressData.length}`);
    console.log(`   Habit Proofs:          8`);
    console.log(`   Proof Votes:           12`);
    console.log(`   Reactions:             10`);
    console.log(`   Habit Invites:         6`);
    console.log(`   Focus Sessions:        11`);
    console.log('───────────────────────────────────');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
