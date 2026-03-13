
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst({ where: { email: 'test@example.pt' } });
  if (!user) {
    console.error('User not found');
    return;
  }

  const matter = await prisma.matter.findUnique({ where: { id: 'cmmclnt2t0007egzg3awagci8' } });
  if (!matter) {
    console.error('Matter not found');
    return;
  }

  console.log('Original User Tenant:', user.tenantId);
  console.log('Matter Tenant:', matter.tenantId);

  if (user.tenantId !== matter.tenantId) {
    await prisma.user.update({
      where: { id: user.id },
      data: { tenantId: matter.tenantId }
    });
    console.log('User tenant updated to:', matter.tenantId);
  } else {
    console.log('User and Matter already have the same tenant.');
  }

  // Também garantir que o Matter seja recente para aparecer no dashboard
  await prisma.matter.update({
    where: { id: matter.id },
    data: { updatedAt: new Date() }
  });
  console.log('Matter updatedAt set to now.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
