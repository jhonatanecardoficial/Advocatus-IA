// Script de seed para os testes Playwright
// Executado via: pnpm --filter @advocatus/api exec node seed-test-data.js <action> <uniqueId> [tenantId]
const { PrismaClient } = require('@prisma/client');

// Porta e URL da DB configur\u00e1veis via env — sem valores hardcoded
const DB_URL = process.env.TEST_DB_URL || process.env.DATABASE_URL;

if (!DB_URL) {
    console.error('SEED_ERROR: TEST_DB_URL ou DATABASE_URL n\u00e3o definidos');
    process.exit(1);
}

const p = new PrismaClient({
    datasources: { db: { url: DB_URL } }
});

const args = process.argv.slice(2);
const action = args[0];   // 'create' ou 'delete'
const uniqueId = args[1]; // timestamp \u00fanico
const tenantId = args[2]; // para delete

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

        console.log(JSON.stringify({
            tenantId: tenant.id,
            userId: user.id,
            supabaseUserId: user.supabaseUserId
        }));

    } else if (action === 'delete') {
        // Usar SQL raw para evitar conflito de nomes p.client vs PrismaClient
        await p.$executeRawUnsafe(`DELETE FROM "audit_logs" WHERE "tenantId" = $1`, tenantId);
        await p.$executeRawUnsafe(`DELETE FROM "matters" WHERE "tenantId" = $1`, tenantId);
        await p.$executeRawUnsafe(`DELETE FROM "clients" WHERE "tenantId" = $1`, tenantId);
        await p.$executeRawUnsafe(`DELETE FROM "users" WHERE "tenantId" = $1`, tenantId);
        await p.$executeRawUnsafe(`DELETE FROM "tenants" WHERE "id" = $1`, tenantId);
        console.log('cleanup done');
    }
}

main()
    .catch(e => {
        console.error('SEED_ERROR:', e.message);
        process.exit(1);
    })
    .finally(() => p.$disconnect());
