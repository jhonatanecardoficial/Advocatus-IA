const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const clients = await prisma.client.findMany();
  console.log('CLIENTS FOUND:', clients.length);
  clients.forEach(c => {
    console.log(`ID: ${c.id} | NAME: ${c.name} | NIF: ${c.nif}`);
  });
}

main().catch(console.error).finally(() => prisma.$disconnect());
