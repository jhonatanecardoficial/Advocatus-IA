import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'

@Injectable()
export class TenantsService {
    constructor(private readonly prisma: PrismaService) { }

    /** Busca tenant pelo slug — usado no onboarding e configurações */
    async findBySlug(slug: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { slug },
            select: {
                id: true,
                slug: true,
                name: true,
                plan: true,
                logoUrl: true,
                billingStatus: true,
                settings: true,
                createdAt: true,
            },
        })

        if (!tenant) throw new NotFoundException(`Escritório '${slug}' não encontrado.`)
        return tenant
    }

    /** Retorna o tenant pelo ID — usado internamente */
    async findById(id: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id },
        })
        if (!tenant) throw new NotFoundException('Escritório não encontrado.')
        return tenant
    }

    /** Cria um novo tenant durante o onboarding */
    async create(data: { name: string; slug: string }) {
        return this.prisma.tenant.create({
            data: {
                name: data.name,
                slug: data.slug,
                plan: 'SOLO',
                billingStatus: 'TRIAL',
            },
        })
    }
}
