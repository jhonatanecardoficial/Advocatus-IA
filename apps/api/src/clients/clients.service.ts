import {
    Injectable,
    NotFoundException,
    ConflictException,
} from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateClientDto, UpdateClientDto, ClientFiltersDto, ConflictCheckDto } from './dto/client.dto'

@Injectable()
export class ClientsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(tenantId: string, dto: CreateClientDto) {
        // Verificar conflito de NIF dentro do mesmo tenant
        if (dto.nif) {
            const existing = await this.prisma.client.findUnique({
                where: { tenantId_nif: { tenantId, nif: dto.nif } },
            })
            if (existing) {
                throw new ConflictException(`Já existe um cliente com o NIF ${dto.nif} neste escritório.`)
            }
        }

        return this.prisma.client.create({
            data: {
                tenantId,
                name: dto.name,
                type: dto.type ?? 'SINGULAR',
                nif: dto.nif,
                email: dto.email,
                phone: dto.phone,
                address: dto.address,
                notes: dto.notes,
                gdprConsentAt: dto.gdprConsent ? new Date() : null,
            },
        })
    }

    async conflictCheck(tenantId: string, dto: ConflictCheckDto) {
        const conditions = []

        if (dto.name) {
            conditions.push({ name: { contains: dto.name, mode: 'insensitive' as const } })
        }
        if (dto.nif) {
            conditions.push({ nif: dto.nif })
        }
        if (dto.email) {
            conditions.push({ email: { equals: dto.email, mode: 'insensitive' as const } })
        }
        if (dto.phone) {
            conditions.push({ phone: { contains: dto.phone } })
        }

        const potentialConflicts = await this.prisma.client.findMany({
            where: {
                tenantId,
                OR: conditions,
            },
            select: {
                id: true,
                name: true,
                type: true,
                nif: true,
                email: true,
                phone: true,
                createdAt: true,
                _count: { select: { matters: true } },
            },
            take: 20, // Limite para não sobrecarregar
        })

        return {
            hasConflicts: potentialConflicts.length > 0,
            conflicts: potentialConflicts,
        }
    }

    async findAll(tenantId: string, filters: ClientFiltersDto) {
        const { search, type, page, perPage } = filters
        const skip = (page - 1) * perPage

        const where = {
            tenantId,
            ...(type && { type }),
            ...(search && {
                OR: [
                    { name: { contains: search, mode: 'insensitive' as const } },
                    { email: { contains: search, mode: 'insensitive' as const } },
                    { nif: { contains: search } },
                ],
            }),
        }

        const [clients, total] = await Promise.all([
            this.prisma.client.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { name: 'asc' },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    nif: true,
                    email: true,
                    phone: true,
                    gdprConsentAt: true,
                    createdAt: true,
                    _count: { select: { matters: true } },
                },
            }),
            this.prisma.client.count({ where }),
        ])

        return {
            data: clients,
            meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
        }
    }

    async findOne(tenantId: string, id: string) {
        const client = await this.prisma.client.findFirst({
            where: { id, tenantId },
            include: {
                matters: {
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        status: true,
                        deadlineAt: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
            },
        })

        if (!client) throw new NotFoundException('Cliente não encontrado.')
        return client
    }

    async update(tenantId: string, id: string, dto: UpdateClientDto) {
        await this.findOne(tenantId, id) // Garante que pertence ao tenant

        return this.prisma.client.update({
            where: { id },
            data: {
                ...dto,
                gdprConsentAt: dto.gdprConsent === true ? new Date() : undefined,
            },
        })
    }

    async remove(tenantId: string, id: string) {
        const client = await this.findOne(tenantId, id)

        // Verificar se tem processos activos antes de eliminar
        const activeMatters = await this.prisma.matter.count({
            where: { clientId: id, status: 'ATIVO' },
        })

        if (activeMatters > 0) {
            throw new ConflictException(
                `Não é possível eliminar o cliente: possui ${activeMatters} processo(s) activo(s).`,
            )
        }

        await this.prisma.client.delete({ where: { id } })
        return { message: `Cliente '${client.name}' eliminado com sucesso.` }
    }
}
