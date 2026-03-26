
const { PrismaClient } = require('@prisma/client');

// Carregar URL do .env ou usar default
const url = "postgresql://postgres:postgres@localhost:54322/postgres";
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: url,
    },
  },
});

async function main() {
  console.log('--- Iniciando Correção SQL via Prisma $executeRaw (URL Forçada) ---');
  
  const sql = `
    UPDATE "Matter"
    SET "tenantId" = c."tenantId"
    FROM "Client" c
    WHERE "Matter"."clientId" = c.id
    AND ("Matter"."tenantId" IS NULL OR "Matter"."tenantId" <> c."tenantId")
    AND "Matter"."deletedAt" IS NULL;
  `;
  
  try {
    const result = await prisma.$executeRawUnsafe(sql);
    console.log(`Sucesso! Linhas afetadas: ${result}`);
  } catch (err) {
    console.error('Erro ao executar SQL:', err);
  } finally {
    await prisma.$disconnect();
  }
}

main();
