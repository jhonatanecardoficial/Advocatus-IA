
const { Client } = require('pg');

async function main() {
  const client = new Client({
    connectionString: "postgresql://postgres:postgres@localhost:54322/postgres"
  });

  try {
    await client.connect();
    console.log('--- Conectado via PG Nativo ---');
    
    const sql = `
      UPDATE "Matter"
      SET "tenantId" = c."tenantId"
      FROM "Client" c
      WHERE "Matter"."clientId" = c.id
      AND ("Matter"."tenantId" IS NULL OR "Matter"."tenantId" <> c."tenantId")
      AND "Matter"."deletedAt" IS NULL;
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
