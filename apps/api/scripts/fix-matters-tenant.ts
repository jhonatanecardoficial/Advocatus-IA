
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Iniciando Correção de tenantId nos Processos ---');

  // Buscar todos os processos que têm cliente mas o tenantId pode estar errado
  const matters = await prisma.matter.findMany({
    include: {
      client: true
    }
  });

  console.log(`Encontrados ${matters.length} processos para verificar.`);

  let updatedCount = 0;

  for (const matter of matters) {
    if (matter.client && matter.tenantId !== matter.client.tenantId) {
      console.log(`Corrigindo Matter [${matter.title}] (ID: ${matter.id}):`);
      console.log(`  - Tenant Atual: ${matter.tenantId}`);
      console.log(`  - Tenant Correto (do Cliente): ${matter.client.tenantId}`);

      await prisma.matter.update({
        where: { id: matter.id },
        data: { tenantId: matter.client.tenantId }
      });
      
      updatedCount++;
    }
  }

  console.log('--- Resumo ---');
  console.log(`Processos corrigidos: ${updatedCount}`);
  console.log('--- Fim ---');
}

main()
  .catch((e) => {
    console.error('Erro na migração:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
