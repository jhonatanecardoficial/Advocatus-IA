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

    const user = await prisma.user.findFirst({
        where: { email }
    });

    if (!user) {
        console.log('Utilizador qa@advocatus.pt não encontrado');
    } else {
        await prisma.user.update({
            where: { id: user.id },
            data: { passwordHash }
        });
        console.log(`Senha resetada para o usuário: ${user.email} (TenantID: ${user.tenantId})`);
    }
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect()
    });
