// Script de seed para os testes Playwright
// Executado via: pnpm --filter @advocatus/api exec node seed-test-data.js <action> <uniqueId> [tenantId]
const pg = require('pg');
const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

// Porta e URL da DB configur\u00e1veis via env — sem valores hardcoded
const DB_URL = process.env.TEST_DB_URL || process.env.DATABASE_URL;

if (!DB_URL) {
    console.error('SEED_ERROR: TEST_DB_URL ou DATABASE_URL n\u00e3o definidos');
    process.exit(1);
}

// Em Prisma 7, o engine 'client' exige um adapter
const pool = new pg.Pool({ connectionString: DB_URL });
const adapter = new PrismaPg(pool);
const p = new PrismaClient({ adapter });

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
        const tables = [
            "audit_logs", "time_entries", "expenses", "invoices", "tasks",
            "portal_accesses", "messages", "documents", "matters", "clients",
            "users", "tenants"
        ];
        
        for (const table of tables) {
            try {
                if (table === 'tenants') {
                    await p.$executeRawUnsafe(`DELETE FROM "${table}" WHERE "id" = $1`, tenantId);
                } else {
                    await p.$executeRawUnsafe(`DELETE FROM "${table}" WHERE "tenantId" = $1`, tenantId);
                }
            } catch (e) {
                // Ignore if table doesn't exist (relation does not exist)
                if (!e.message.includes('42P01')) {
                    throw e;
                }
            }
        }
        console.log('cleanup done');
    }
}

main()
    .catch(e => {
        console.error('SEED_ERROR:', e.message);
        process.exit(1);
    })
    .finally(() => p.$disconnect());
