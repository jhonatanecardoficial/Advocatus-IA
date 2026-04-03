import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@advocatus.pt';
  const password = 'admin123';
  const passwordHash = await bcrypt.hash(password, 10);
  
  // Garantir que o Tenant existe
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'admin-tenant' },
    update: {},
    create: {
      name: 'Advocatus Admin',
      slug: 'admin-tenant',
      plan: 'PREMIUM',
    },
  });

  // Garantir que o User existe
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: 'Administrador Advocatus',
      role: 'ADMIN',
      tenantId: tenant.id,
      passwordHash,
      supabaseUserId: 'fixed-admin-qa-id', 
    },
  });

  console.log(`✅ Usuário administrador garantido: ${user.email}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed de admin:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
