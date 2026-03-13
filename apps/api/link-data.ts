
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'test@example.pt' } });
  if (!user) {
    console.error('User not found');
    return;
  }
  console.log('USER_ID:', user.id);

  const matterId = 'cmmclnt2t0007egzg3awagci8';
  const clientId = 'cmmclnt1m0005egzgjgqbkbjk';

  // Associa o processo ao usuário (verificando o campo correto, geralmente userId ou assignedTo)
  // Vou verificar o esquema do Matter primeiro para ter certeza do campo de dono/associado.
  
  const updatedMatter = await prisma.matter.update({
    where: { id: matterId },
    data: { userId: user.id }
  });
  console.log('MATTER_UPDATED:', updatedMatter.id);
  
  const updatedClient = await prisma.client.update({
    where: { id: clientId },
    data: { userId: user.id }
  });
  console.log('CLIENT_UPDATED:', updatedClient.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
