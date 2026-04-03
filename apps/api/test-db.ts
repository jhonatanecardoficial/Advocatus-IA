import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const version = await prisma.$queryRaw`SELECT version()`;
    console.log('✅ Connection Sucessful:', version);
  } catch (e) {
    console.error('❌ Connection Failed:', e);
  } finally {
    await pool.end();
    await prisma.$disconnect();
  }
}

main();
