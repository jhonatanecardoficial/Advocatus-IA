import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const clients = await prisma.client.findMany({
        select: { id: true, name: true, tenantId: true }
    });
    console.log('CLIENTS IN DB:', JSON.stringify(clients, null, 2));

    const matters = await prisma.matter.findMany({
        select: { id: true, title: true, tenantId: true, clientId: true }
    });
    console.log('MATTERS IN DB:', JSON.stringify(matters, null, 2));

    const users = await prisma.user.findMany({
        select: { id: true, email: true, tenantId: true, role: true }
    });
    console.log('USERS IN DB:', JSON.stringify(users, null, 2));

    const tenants = await prisma.tenant.findMany({
        select: { id: true, name: true, slug: true }
    });
    console.log('TENANTS IN DB:', JSON.stringify(tenants, null, 2));
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    });
