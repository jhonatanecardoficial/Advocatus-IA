import { PrismaClient } from '@prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import path from 'path';

// Forçar carregamento do ficheiro .env da API
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("A procurar utilizador admin@advocatus.pt...");
  let user = await prisma.user.findFirst({ where: { email: 'admin@advocatus.pt' } });
  
  if (!user) {
    console.log("Utilizador admin@advocatus.pt não encontrado. A procurar o primeiro User...");
    user = await prisma.user.findFirst();
  }
  
  if (!user) {
    console.error("Nenhum utilizador encontrado na base de dados para associar dados.");
    return;
  }
  
  const tenantId = user.tenantId;
  console.log(`A utilizar Tenant ID: ${tenantId}`);

  // 1. Criar 5 Clientes
  console.log("A criar 5 clientes...");
  const clients = [];
  for (let i = 1; i <= 5; i++) {
    const client = await prisma.client.create({
      data: {
        tenantId,
        type: 'SINGULAR',
        name: `Cliente Teste Final ${i}`,
        nif: `20000000${i}`,
        email: `cliente${i}@teste-final.pt`,
        phone: `91000000${i}`,
        notes: "Criado automaticamente para teste manual."
      }
    });
    clients.push(client);
  }

  // 2. Criar 5 Processos (Matters)
  console.log("A criar 5 processos...");
  const matters = [];
  for (let i = 1; i <= 5; i++) {
    const matter = await prisma.matter.create({
      data: {
        tenantId,
        clientId: clients[i - 1].id,
        responsibleId: user.id,
        title: `Ação Cível - Teste Manual 00${i}`,
        type: 'CIVEL',
        status: 'ATIVO',
        description: `Processo criado automaticamente para validação do Cliente ${clients[i-1].name}`,
      }
    });
    matters.push(matter);
  }

  // 3. Criar 5 Tarefas
  console.log("A criar 5 tarefas com prazos...");
  for (let i = 1; i <= 5; i++) {
    await prisma.task.create({
      data: {
        tenantId,
        matterId: matters[i - 1].id,
        assignedToId: user.id,
        createdById: user.id,
        title: `Contestação Cliente ${i}`,
        type: 'PRAZO',
        priority: i > 3 ? 'CRITICA' : 'ALTA', // Algumas críticas para o dashboard
        dueAt: new Date(Date.now() + i * 24 * 60 * 60 * 1000), // i dias a partir de hoje
        description: "Elaborar peça processual para teste de produtividade."
      }
    });
  }

  // 4. Criar 5 Documentos (3 assinados, 2 sem assinar para teste manual)
  console.log("A criar 5 documentos e 3 assinaturas digitais...");
  for (let i = 1; i <= 5; i++) {
    const doc = await prisma.document.create({
      data: {
        tenantId,
        matterId: matters[i - 1].id,
        uploadedById: user.id,
        filename: `contrato_prestacao_servicos_0${i}.pdf`,
        mimeType: 'application/pdf',
        storagePath: `test-path/doc-${i}.pdf`,
        sizeBytes: 154000 + i * 1000,
        signatureType: 'QES',
        signatureStatus: i <= 3 ? 'SIGNED' : 'PENDING',
      }
    });

    // Assinar os 3 primeiros
    if (i <= 3) {
      await prisma.signedDocument.create({
        data: {
          tenantId,
          matterId: matters[i - 1].id,
          documentId: doc.id,
          originalFilePath: doc.storagePath,
          signedFilePath: `test-path/doc-${i}-signed.pdf`,
          signerName: clients[i - 1].name,
          signerNif: clients[i - 1].nif,
          signatureValid: true,
        }
      });
    }
  }

  console.log("\n✅ Base de dados populada com sucesso!");
  console.log("- 5 Clientes Criados");
  console.log("- 5 Processos Criados");
  console.log("- 5 Tarefas Agendadas");
  console.log("- 5 Documentos Submetidos (3 Assinados QES, 2 Pendentes para teste manual)");
}

main()
  .catch(e => {
    console.error("Erro ao fazer seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
