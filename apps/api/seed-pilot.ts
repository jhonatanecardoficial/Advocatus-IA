import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    try {
        const hashedPassword = await bcrypt.hash('Teste123!', 10);

        // Check if tenant already exists
        let tenant = await prisma.tenant.findFirst({ where: { slug: 'escritorio-piloto' } });
        if (!tenant) {
            tenant = await prisma.tenant.create({
                data: { name: 'Escritório Piloto', plan: 'SOLO', slug: 'escritorio-piloto' }
            });
            console.log('✅ Tenant created: Escritório Piloto');
        }

        // Check if user already exists
        let user = await prisma.user.findFirst({ where: { email: 'advogado@piloto.pt' } });

        if (!user) {
            user = await prisma.user.create({
                data: {
                    email: 'advogado@piloto.pt',
                    passwordHash: hashedPassword,
                    name: 'Advogado Piloto',
                    tenantId: tenant.id,
                    role: 'ADMIN',
                    barNumber: '12345L'
                }
            });
            console.log('✅ User created:', user.email);
        }

        // Add Sample Client
        let client = await prisma.client.findFirst({ where: { tenantId: tenant.id, nif: '256123456' } });
        if (!client) {
            client = await prisma.client.create({
                data: {
                    tenantId: tenant.id,
                    name: 'João Exemplo Silva',
                    nif: '256123456',
                    email: 'joao.silva@exemplo.pt',
                    phone: '+351 912 345 678',
                    type: 'SINGULAR',
                    address: 'Rua das Flores, 123, Lisboa'
                }
            });
            console.log('✅ Client created:', client.name);
        }

        // Add Sample Matter
        let matter = await prisma.matter.findFirst({ where: { tenantId: tenant.id, title: 'Processo de Despejo - Rua das Flores' } });
        if (!matter) {
            matter = await prisma.matter.create({
                data: {
                    tenantId: tenant.id,
                    clientId: client.id,
                    title: 'Processo de Despejo - Rua das Flores',
                    type: 'CIVEL',
                    status: 'ATIVO',
                    courtReference: '1234/24.5LSB',
                    citiusReference: 'CIT-2026-999',
                    description: 'Acção de despejo por falta de pagamento de rendas superior a 2 meses.',
                    responsibleId: user.id,
                    openedAt: new Date(),
                    deadlineAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days from now
                }
            });
            console.log('✅ Matter created:', matter.title);
        }

    } catch (e) {
        console.error('❌ Error during seeding:', e);
    } finally {
        await prisma.$disconnect();
    }
}
main();

