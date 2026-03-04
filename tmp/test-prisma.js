// Script de debug: verifica se o PrismaClient consegue conectar-se e criar dados
const { PrismaClient } = require('./apps/api/node_modules/.prisma/client');

const p = new PrismaClient({
    datasources: {
        db: { url: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' }
    }
});

async function main() {
    try {
        const slug = 'test-' + Date.now();
        const tenant = await p.tenant.create({
            data: { name: 'Test Tenant', slug, plan: 'SOLO' }
        });
        console.log('Tenant created OK:', tenant.id);
        await p.tenant.delete({ where: { id: tenant.id } });
        console.log('Tenant deleted OK');
    } catch (e) {
        console.error('ERROR:', e.message);
        console.error('DETAIL:', e.code, e.meta);
    } finally {
        await p.$disconnect();
    }
}

main();
