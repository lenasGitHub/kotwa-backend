import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedChat() {
  const users = await prisma.user.findMany({ take: 4, select: { id: true, username: true } });
  console.log('Users:', users.map((u) => u.username));

  if (users.length < 2) {
    console.log('Need at least 2 users to seed chat');
    return;
  }

  // 1-on-1 conversation between user 0 and user 1
  const conv1 = await prisma.conversation.create({
    data: {
      isGroup: false,
      participants: {
        create: [
          { userId: users[0].id },
          { userId: users[1].id },
        ],
      },
    },
  });

  await prisma.message.createMany({
    data: [
      { conversationId: conv1.id, senderId: users[0].id, content: 'Hey! Ready for the challenge?' },
      { conversationId: conv1.id, senderId: users[1].id, content: 'Yes! Lets do this 💪' },
      { conversationId: conv1.id, senderId: users[0].id, content: 'I already started my morning routine' },
      { conversationId: conv1.id, senderId: users[1].id, content: 'Nice! Im going to start with the no sugar challenge' },
    ],
  });
  console.log(`Created 1-on-1 chat: ${users[0].username} <-> ${users[1].username}`);

  // 1-on-1 conversation between user 0 and user 2
  if (users.length >= 3) {
    const conv2 = await prisma.conversation.create({
      data: {
        isGroup: false,
        participants: {
          create: [
            { userId: users[0].id },
            { userId: users[2].id },
          ],
        },
      },
    });

    await prisma.message.createMany({
      data: [
        { conversationId: conv2.id, senderId: users[2].id, content: 'Salam! How is your progress going?' },
        { conversationId: conv2.id, senderId: users[0].id, content: 'Alhamdulillah, day 5 streak!' },
      ],
    });
    console.log(`Created 1-on-1 chat: ${users[0].username} <-> ${users[2].username}`);
  }

  // Group chat with all 4 users
  if (users.length >= 4) {
    const group = await prisma.conversation.create({
      data: {
        isGroup: true,
        name: 'Challenge Squad',
        participants: {
          create: users.map((u) => ({ userId: u.id })),
        },
      },
    });

    await prisma.message.createMany({
      data: [
        { conversationId: group.id, senderId: users[1].id, content: 'Welcome everyone to the squad! 🎉' },
        { conversationId: group.id, senderId: users[2].id, content: 'Excited to be here!' },
        { conversationId: group.id, senderId: users[3].id, content: 'Lets crush these challenges together' },
      ],
    });
    console.log('Created group chat: Challenge Squad');
  }

  console.log('✅ Chat seed done!');
  await prisma.$disconnect();
}

seedChat().catch((e) => {
  console.error(e);
  process.exit(1);
});
