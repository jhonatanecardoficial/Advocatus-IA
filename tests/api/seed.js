// Script de seed para os testes — executado via pnpm exec no contexto da api
const pg = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const DB_URL = process.env.TEST_DB_URL || 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
// Em Prisma 7, o engine 'client' exige um adapter
const pool = new pg.Pool({ connectionString: DB_URL });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

const args = process.argv.slice(2);
const action = args[0]; // 'create' ou 'delete'
const uniqueId = args[1]; // timestamp único
const tenantId = args[2]; // para delete
const userId = args[3]; // para delete

async function main() {
    if (action === 'create') {
        const tenant = await p.tenant.create({
            data: {
                name: `Test Tenant ${uniqueId}`,
                slug: `test-${uniqueId}`,
                plan: 'SOLO'
            }
        });

        const user = await p.user.create({
            data: {
                supabaseUserId: `test-user-${uniqueId}`,
                email: `test-${uniqueId}@advocatus.test`,
                name: 'Test User',
                role: 'ADMIN',
                tenantId: tenant.id
            }
        });

        // Saída JSON para o test-utils.ts parsear
        console.log(JSON.stringify({
            tenantId: tenant.id,
            userId: user.id,
            supabaseUserId: user.supabaseUserId
        }));

    } else if (action === 'delete') {
        await p.client.deleteMany({ where: { tenantId } });
        await p.matter.deleteMany({ where: { tenantId } });
        await p.user.deleteMany({ where: { tenantId } });
        await p.tenant.delete({ where: { id: tenantId } });
        console.log('cleanup done');
    }
}

main()
    .catch(e => {
        console.error('SEED_ERROR:', e.message);
        process.exit(1);
    })
    .finally(() => p.$disconnect());
