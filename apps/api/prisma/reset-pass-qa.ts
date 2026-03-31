import { PrismaClient } from '@prisma/client';
import pg from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcryptjs';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
    const email = 'qa@advocatus.pt'
    const password = 'Advocatus123!'
    const passwordHash = await bcrypt.hash(password, 10)

    // Procurar o tenant com mais dados ou o primeiro
    const tenants = await prisma.tenant.findMany({
        orderBy: {
            createdAt: 'asc'
        },
        take: 1
    });

    let tenantId: string;
    let tenantName = 'Desconhecido';

    if (tenants.length === 0) {
        console.log('Nenhum tenant encontrado. Criando um novo...');
        const newTenant = await prisma.tenant.create({
            data: { 
                name: 'Escritório de Testes',
                slug: 'test-office-' + Date.now()
            }
        });
        tenantId = newTenant.id;
        tenantName = newTenant.name;
    } else {
        tenantId = tenants[0].id;
        tenantName = tenants[0].name;
    }

    // Procurar utilizador existente pelo email (independente do tenant para este script de utilitário)
    const existingUser = await prisma.user.findFirst({
        where: { email: email }
    });

    let user;
    if (existingUser) {
        console.log(`Utilizador encontrado (ID: ${existingUser.id}). Atualizando palavra-passe...`);
        user = await prisma.user.update({
            where: { id: existingUser.id },
            data: {
                passwordHash: passwordHash,
                role: 'ADMIN' as any
            }
        });
    } else {
        console.log(`Utilizador não encontrado. Criando novo utilizador no tenant ${tenantName}...`);
        user = await prisma.user.create({
            data: {
                email: email,
                passwordHash: passwordHash,
                tenantId: tenantId,
                name: 'Utilizador QA',
                role: 'ADMIN' as any
            }
        });
    }

    console.log(`\n✅ SUCESSO: Utilizador pronto para login.`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔑 Senha: ${password}`);
    console.log(`🏢 Tenant: ${tenantName} (ID: ${tenantId})\n`);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    });
