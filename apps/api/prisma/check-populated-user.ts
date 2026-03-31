const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  const users = await prisma.user.findMany({
    include: {
      tenant: {
        include: {
          _count: {
            select: {
              clients: true,
              matters: true,
              invoices: true,
            }
          }
        }
      }
    }
  });

  console.log('--- USER DATA OVERVIEW ---');
  for (const u of users) {
    console.log(`Email: ${u.email}`);
    console.log(`Tenant: ${u.tenant?.name}`);
    console.log(`Stats: Clients(${u.tenant?._count.clients}), Matters(${u.tenant?._count.matters}), Invoices(${u.tenant?._count.invoices})`);
    console.log('---');
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
