import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Habit Discovery Data...');

  // delete in order
  await prisma.habit.deleteMany();
  await prisma.habitCategory.deleteMany();

  const categories = [
    {
      id: 'health',
      name: 'Health Mountain',
      biomeType: 'SNOWY',
      mountainIcon: 'https://cdn.example.com/icons/mountain-snowy.png',
      primaryColor: '#4A90E2',
      secondaryColor: '#D0E6FF',
      habits: [
        {
          title: 'Morning Clifftop Walk',
          difficulty: 'EASY',
          guide: { gear: ['Shoes'], time: '15m' },
          incentives: { xp: 100 },
        },
        {
          title: 'Hydration Peak',
          difficulty: 'EASY',
          guide: { gear: ['Water Bottle'], time: 'All day' },
          incentives: { xp: 50 },
        },
        {
          title: 'Glacier Workout',
          difficulty: 'HARD',
          guide: { gear: ['Weights'], time: '45m' },
          incentives: { xp: 300 },
        },
      ],
    },
    {
      id: 'spiritual',
      name: 'Spiritual Summit',
      biomeType: 'DESERT',
      mountainIcon: 'https://cdn.example.com/icons/mountain-desert.png',
      primaryColor: '#E67E22',
      secondaryColor: '#FAD7A0',
      habits: [
        {
          title: 'Sunrise Meditation',
          difficulty: 'MODERATE',
          guide: { gear: ['Mat'], time: '10m' },
          incentives: { xp: 150 },
        },
        {
          title: 'Dune Journaling',
          difficulty: 'EASY',
          guide: { gear: ['Pen', 'Paper'], time: '15m' },
          incentives: { xp: 100 },
        },
      ],
    },
    {
      id: 'productivity',
      name: 'Productivity Peak',
      biomeType: 'VOLCANO',
      mountainIcon: 'https://cdn.example.com/icons/mountain-volcano.png',
      primaryColor: '#C0392B',
      secondaryColor: '#F1948A',
      habits: [
        {
          title: 'Deep Work Lava Flow',
          difficulty: 'EXPERT',
          guide: { gear: ['Timer'], time: '90m' },
          incentives: { xp: 500 },
        },
        {
          title: 'Inbox Zero Crater',
          difficulty: 'MODERATE',
          guide: { gear: ['Laptop'], time: '30m' },
          incentives: { xp: 200 },
        },
      ],
    },
    {
      id: 'finance',
      name: 'Finance Fortress',
      biomeType: 'FOREST',
      mountainIcon: 'https://cdn.example.com/icons/mountain-forest.png',
      primaryColor: '#27AE60',
      secondaryColor: '#ABEBC6',
      habits: [
        {
          title: 'Budget Review',
          difficulty: 'EASY',
          guide: { gear: ['Sheet'], time: '10m' },
          incentives: { xp: 100 },
        },
        {
          title: 'No Spend Challenge',
          difficulty: 'HARD',
          guide: { gear: ['Wallet'], time: '24h' },
          incentives: { xp: 300 },
        },
      ],
    },
    {
      id: 'mental',
      name: 'Mind Oasis',
      biomeType: 'ISLAND',
      mountainIcon: 'https://cdn.example.com/icons/mountain-island.png',
      primaryColor: '#16A085',
      secondaryColor: '#A3E4D7',
      habits: [
        {
          title: 'Reading Reef',
          difficulty: 'MODERATE',
          guide: { gear: ['Book'], time: '20m' },
          incentives: { xp: 150 },
        },
        {
          title: 'Digital Detox Beach',
          difficulty: 'HARD',
          guide: { gear: ['None'], time: '1h' },
          incentives: { xp: 300 },
        },
      ],
    },
    // Adding 5 more to reach 10
    {
      id: 'social',
      name: 'Social Valley',
      biomeType: 'GRASSLAND',
      mountainIcon: 'https://cdn.example.com/icons/mountain-grass.png',
      primaryColor: '#8E44AD',
      secondaryColor: '#D2B4DE',
      habits: [
        {
          title: 'Call a Friend',
          difficulty: 'EASY',
          guide: { gear: ['Phone'], time: '15m' },
          incentives: { xp: 100 },
        },
      ],
    },
    {
      id: 'learning',
      name: 'Knowledge Canyon',
      biomeType: 'CANYON',
      mountainIcon: 'https://cdn.example.com/icons/mountain-canyon.png',
      primaryColor: '#D35400',
      secondaryColor: '#EDBB99',
      habits: [
        {
          title: 'Learn 5 Words',
          difficulty: 'EASY',
          guide: { gear: ['App'], time: '10m' },
          incentives: { xp: 80 },
        },
      ],
    },
    {
      id: 'creativity',
      name: 'Artistic Alps',
      biomeType: 'TUNDRA',
      mountainIcon: 'https://cdn.example.com/icons/mountain-alps.png',
      primaryColor: '#E91E63',
      secondaryColor: '#F8BBD0',
      habits: [
        {
          title: 'Sketching',
          difficulty: 'MODERATE',
          guide: { gear: ['Pencil'], time: '30m' },
          incentives: { xp: 150 },
        },
      ],
    },
    {
      id: 'charity',
      name: 'Kindness Kingdom',
      biomeType: 'CASTLE',
      mountainIcon: 'https://cdn.example.com/icons/mountain-castle.png',
      primaryColor: '#F1C40F',
      secondaryColor: '#FCF3CF',
      habits: [
        {
          title: 'Random Act of Kindness',
          difficulty: 'EASY',
          guide: { gear: ['None'], time: '5m' },
          incentives: { xp: 100 },
        },
      ],
    },
    {
      id: 'eco',
      name: 'Eco Everest',
      biomeType: 'JUNGLE',
      mountainIcon: 'https://cdn.example.com/icons/mountain-jungle.png',
      primaryColor: '#2ECC71',
      secondaryColor: '#A9DFBF',
      habits: [
        {
          title: 'Recycling Run',
          difficulty: 'EASY',
          guide: { gear: ['Bin'], time: '10m' },
          incentives: { xp: 50 },
        },
      ],
    },
  ];

  for (const cat of categories) {
    const { habits, ...catData } = cat;

    // Create Category
    await prisma.habitCategory.create({
      data: {
        ...catData,
        habits: {
          create: habits.map(h => ({
            title: h.title,
            difficulty: h.difficulty,
            preChallengeGuide: JSON.stringify(h.guide),
            incentives: JSON.stringify(h.incentives),
          })),
        },
      },
    });
  }

  console.log('✅ Seeding complete!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
