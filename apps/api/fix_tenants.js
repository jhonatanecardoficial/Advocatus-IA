const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('--- INICIANDO CORREÇÃO DE TENANTS EM PROCESSOS ---');
    
    // 1. Procurar por processos com tenantId inconsistente
    const matters = await prisma.matter.findMany({
        include: { client: true }
    });

    let fixedCount = 0;
    for (const matter of matters) {
        if (matter.client && matter.tenantId !== matter.client.tenantId) {
            console.log(`[!] Inconsistência: Processo '${matter.title}' (ID: ${matter.id})`);
            console.log(`    Matter TenantId: ${matter.tenantId}`);
            console.log(`    Client TenantId: ${matter.client.tenantId}`);
            
            await prisma.matter.update({
                where: { id: matter.id },
                data: { tenantId: matter.client.tenantId }
            });
            fixedCount++;
        }
    }

    console.log(`\nCOREÇÃO CONCLUÍDA: ${fixedCount} processos atualizados.`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
