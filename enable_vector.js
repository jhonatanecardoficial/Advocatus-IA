const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        await prisma.$executeRawUnsafe('CREATE EXTENSION IF NOT EXISTS vector;');
        console.log('Successfully enabled pgvector extension');
    } catch (error) {
        console.error('Failed to enable pgvector:', error.message);
    }
}

main().finally(() => prisma.$disconnect());
