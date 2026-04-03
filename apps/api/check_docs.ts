import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const docs = await prisma.document.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: { matter: { select: { title: true } } }
  });
  console.log('Recent Documents:', JSON.stringify(docs, null, 2));
  await prisma.$disconnect();
}
main();
