import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding Challenges...');

  // 1. Find a user to be the creator (or create one)
  let creator = await prisma.user.findFirst();
  if (!creator) {
    console.log('No user found. Creating admin user...');
    creator = await prisma.user.create({
      data: {
        username: 'admin',
        // email: 'admin@kotwa.com', // Unique constraint might fail if re-running
        // Let's rely on username which is unique
        phoneNumber: '+1234567890',
      } as any, // Bypass strict Partial<User> check for quick seed
    });
  }

  console.log(`Using creator: ${creator.username} (${creator.id})`);

  // Challenge Data from Frontend
  const challenges = [
    {
      title: 'Water Warrior',
      description: 'Drink 8 glasses of water daily to stay hydrated.',
      type: 'COUNTER', // Mapping from Frontend TrackingType.counter
      category: 'HEALTH',
      targetGoal: 8,
      difficulty: 'EASY',
      icon: 'water_drop',
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)), // +30 days
      isPublic: true,
    },
    {
      title: 'No Sugar',
      description: 'Avoid all added sugars for better energy and skin.',
      type: 'BOOLEAN',
      category: 'HEALTH',
      targetGoal: 1, // 1 boolean success per day
      difficulty: 'HARD',
      icon: 'no_food',
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 14)), // +14 days
      isPublic: true,
    },
    {
      title: 'Sleep 8 Hours',
      description: 'Get a full nights rest for recovery.',
      type: 'COUNTER',
      category: 'HEALTH',
      targetGoal: 8,
      difficulty: 'MEDIUM',
      icon: 'bedtime',
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
      isPublic: true,
    },
    {
      title: 'Five Prayers',
      description: 'Perform all 5 daily prayers on time.',
      type: 'CHECKLIST',
      category: 'SPIRITUAL',
      targetGoal: 5,
      difficulty: 'MEDIUM',
      icon: 'mosque',
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 365)),
      isPublic: true,
    },
    {
      title: 'Deep Work',
      description: 'Focus intensely for 2 hours without distractions.',
      type: 'TIMER',
      category: 'PRODUCTIVITY',
      targetGoal: 120, // minutes
      difficulty: 'HARD',
      icon: 'psychology',
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 21)),
      isPublic: true,
    },
    {
      title: 'Gratitude Journal',
      description: 'Write down 3 things you are grateful for.',
      type: 'TEXT',
      category: 'MENTAL',
      targetGoal: 1,
      difficulty: 'EASY',
      icon: 'favorite',
      startDate: new Date(),
      endDate: new Date(new Date().setDate(new Date().getDate() + 60)),
      isPublic: true,
    },
  ];

  for (const c of challenges) {
    const existing = await prisma.challenge.findFirst({
      where: { title: c.title },
    });

    if (!existing) {
      await prisma.challenge.create({
        data: {
          ...c,
          creatorId: creator.id,
        },
      });
      console.log(`✅ Created: ${c.title}`);
    } else {
      console.log(`Skipping ${c.title} (already exists)`);
    }
  }

  console.log('🎉 Seeding complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
