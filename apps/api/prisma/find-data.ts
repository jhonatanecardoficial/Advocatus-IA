import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

const prisma = new PrismaClient();

async function main() {
    console.log('--- Buscando Tenants com Dados ---');
    const tenants = await prisma.tenant.findMany({
        include: {
            _count: {
                select: {
                    clients: true,
                    matters: true,
                    timeEntries: true,
                    expenses: true,
                    tasks: true,
                    users: true
                }
            },
            users: {
                select: { email: true, name: true }
            }
        }
    });

    for (const t of tenants) {
        console.log(`\nTenant: ${t.name} (${t.id})`);
        console.log(`- Clientes: ${t._count.clients}`);
        console.log(`- Processos: ${t._count.matters}`);
        console.log(`- Horas: ${t._count.timeEntries}`);
        console.log(`- Usuarios: ${t.users.map(u => u.email).join(', ')}`);
    }
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
