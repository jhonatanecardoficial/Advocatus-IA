import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    const tenant = await prisma.tenant.findFirst();
    const user = await prisma.user.findFirst();
    const client = await prisma.client.findFirst();

    if (!tenant || !user || !client) {
      console.error('❌ Missing prerequisite data. Run seed first.');
      return;
    }

    console.log('--- Testing Matter Creation with Nullable deadlineAt ---');

    // Test 1: Explicit null
    const m1 = await prisma.matter.create({
      data: {
        tenantId: tenant.id,
        clientId: client.id,
        responsibleId: user.id,
        title: 'Teste Matter Null Deadline',
        type: 'CIVEL',
        status: 'ATIVO',
        deadlineAt: null,
      },
    });
    console.log('✅ Created Matter with null deadlineAt:', m1.id);

    // Test 2: Valid Date
    const m2 = await prisma.matter.create({
      data: {
        tenantId: tenant.id,
        clientId: client.id,
        responsibleId: user.id,
        title: 'Teste Matter Valid Deadline',
        type: 'CIVEL',
        status: 'ATIVO',
        deadlineAt: new Date(),
      },
    });
    console.log('✅ Created Matter with valid deadlineAt:', m2.id);

  } catch (e) {
    console.error('❌ Matter creation failed:', e);
  } finally {
    await pool.end();
    await prisma.$disconnect();
  }
}

main();
