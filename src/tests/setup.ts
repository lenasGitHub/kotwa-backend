import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

beforeAll(async () => {
    // Ensure the database is in a clean state
    process.env.DATABASE_URL = "file:./test.db";
});

afterAll(async () => {
    await prisma.$disconnect();
});

beforeEach(async () => {
    // Clear all data
    // Delete in order of dependencies (child first, then parent)
    const tablenames = await prisma.$queryRaw<
        Array<{ name: string }>
    >`SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations';`;

    try {
        await prisma.$executeRawUnsafe('PRAGMA foreign_keys = OFF;');
        for (const { name } of tablenames) {
            await prisma.$executeRawUnsafe(`DELETE FROM "${name}";`);
        }
        await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON;');
    } catch (error) {
        console.log('Error clearing tables:', error);
    }
});
