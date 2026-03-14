
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const matter = await prisma.matter.findFirst();
  console.log('MATTER_ID:', matter?.id);
  const client = await prisma.client.findFirst();
  console.log('CLIENT_ID:', client?.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
