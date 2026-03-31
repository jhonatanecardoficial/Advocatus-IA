
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- DB SCHEMA FIX START ---');
  try {
    // 1. Drop the table if it exists
    console.log('Dropping table legal_documents...');
    await prisma.$executeRawUnsafe(`DROP TABLE IF EXISTS "legal_documents" CASCADE;`);
    
    // 2. Recreate it with the exact structure from the migration but with 768-dim
    console.log('Creating table legal_documents with 768-dim vector...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "legal_documents" (
        "id" TEXT NOT NULL,
        "source" TEXT NOT NULL,
        "type" "LegalDocumentType" NOT NULL,
        "title" TEXT NOT NULL,
        "reference" TEXT,
        "content" TEXT NOT NULL,
        "embedding" vector(768),
        "publishedAt" TIMESTAMP(3),
        "url" TEXT,
        "ingestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,

        CONSTRAINT "legal_documents_pkey" PRIMARY KEY ("id")
      );
    `);
    console.log('--- DB SCHEMA FIX SUCCESS ---');
  } catch (error) {
    console.error('--- DB SCHEMA FIX FAILED ---');
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
