import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    try {
        const hashedPassword = await bcrypt.hash('Teste123!', 10);

        // Check if tenant already exists
        let tenant = await prisma.tenant.findFirst({ where: { name: 'Escritorio Piloto' } });
        if (!tenant) {
            tenant = await prisma.tenant.create({
                data: { name: 'Escritorio Piloto', plan: 'TRIAL' }
            });
        }

        // Check if user already exists
        let user = await prisma.user.findUnique({ where: { email: 'advogado@piloto.pt' } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: 'advogado@piloto.pt',
                    password: hashedPassword,
                    firstName: 'Advogado',
                    lastName: 'Piloto',
                    tenantId: tenant.id,
                    role: 'ADMIN'
                }
            });
            console.log('User created successfully:', user.email);
        } else {
            console.log('User already exists:', user.email);
        }
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}
main();
