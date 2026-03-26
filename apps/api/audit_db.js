const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'qa@advocatus.pt';
    const user = await prisma.user.findFirst({
        where: { email },
        include: { tenant: true }
    });

    if (!user) {
        console.log(`[ERROR] Usuário ${email} não encontrado.`);
        return;
    }

    console.log(`[USER] ID: ${user.id}, TenantID: ${user.tenantId}, Role: ${user.role}`);

    const clients = await prisma.client.findMany({
        where: { tenantId: user.tenantId },
        select: { id: true, name: true, tenantId: true, _count: { select: { matters: true } } }
    });

    console.log(`\n[CLIENTS] Total: ${clients.length}`);
    clients.forEach(c => {
        console.log(`  - ${c.name} (${c.id}) | Tenant: ${c.tenantId} | Matters Count: ${c._count.matters}`);
    });

    const matters = await prisma.matter.findMany({
        where: { tenantId: user.tenantId },
        include: { client: { select: { name: true } } }
    });

    console.log(`\n[MATTERS GLOBAL] Total: ${matters.length}`);
    matters.forEach(m => {
        console.log(`  - ${m.title} (${m.id}) | Client: ${m.client?.name} | Status: ${m.status} | Tenant: ${m.tenantId}`);
    });

    // Verificar se existem processos do Joaquim Almeida que estão noutro tenant
    const joaquim = clients.find(c => c.name.includes('Joaquim'));
    if (joaquim) {
        const joaquimMatters = await prisma.matter.findMany({
            where: { clientId: joaquim.id }
        });
        console.log(`\n[JOAQUIM MATTERS RAW] Found: ${joaquimMatters.length}`);
        joaquimMatters.forEach(m => {
            console.log(`  - ${m.title} | Tenant na DB: ${m.tenantId} | Matter status: ${m.status}`);
        });
    }
}

main().catch(console.error).finally(() => prisma.$disconnect());
