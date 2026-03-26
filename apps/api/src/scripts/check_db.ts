import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('--- USUÁRIO QA ---');
    const users = await prisma.user.findMany({
        where: { email: 'qa@advocatus.pt' },
        include: { tenant: true }
    });
    console.log(JSON.stringify(users, null, 2));

    const tenantId = users[0]?.tenantId;
    if (!tenantId) {
        console.log('Erro: Tenant de QA não encontrado.');
        return;
    }

    console.log('\n--- CLIENTES DO TENANT ---');
    const tenantClients = await prisma.client.findMany({
        where: { tenantId, deletedAt: null },
        include: { _count: { select: { matters: true } } }
    });
    console.log(JSON.stringify(tenantClients.map(c => ({ id: c.id, name: c.name, mattersCount: c._count.matters })), null, 2));

    console.log('\n--- PROCESSOS DO TENANT (MAtters) ---');
    const matters = await prisma.matter.findMany({
        where: { tenantId },
        include: { client: { select: { name: true } } }
    });
    console.log(JSON.stringify(matters, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
