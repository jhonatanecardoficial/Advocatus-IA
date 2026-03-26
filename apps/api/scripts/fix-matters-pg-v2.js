
const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres:postgres@localhost:54322/postgres"
  });

  try {
    await client.connect();
    console.log('--- Conectado via PG Nativo ---');
    
    // Nomes das tabelas baseados no @@map do Prisma
    const sql = `
      UPDATE "matters"
      SET "tenantId" = c."tenantId"
      FROM "clients" c
      WHERE "matters"."clientId" = c.id
      AND ("matters"."tenantId" IS NULL OR "matters"."tenantId" <> c."tenantId")
      AND "matters"."deletedAt" IS NULL;
    `;
    
    const res = await client.query(sql);
    console.log(`Sucesso! Linhas afetadas: ${res.rowCount}`);
  } catch (err) {
    console.error('Erro ao executar query:', err);
  } finally {
    await client.end();
  }
}

main();
