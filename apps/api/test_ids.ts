import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const matters = await prisma.matter.findMany({ take: 5 });
  console.log('Matter IDs:', matters.map(m => m.id));
  await prisma.$disconnect();
}
main();
