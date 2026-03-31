import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import {
    CreateClientDto,
    UpdateClientDto,
    ClientFiltersDto,
    ConflictCheckDto,
} from './dto/client.dto'

@Injectable()
export class ClientsService {
    constructor(private readonly prisma: PrismaService) { }

    async create(tenantId: string, dto: CreateClientDto) {
        const { nome, telefone, tipo, gdprConsent, ...rest } = dto

        const client = await this.prisma.client.create({
            data: {
                ...rest,
                name: nome,
                phone: telefone,
                type: tipo === 'COLETIVA' ? 'COLETIVO' : 'SINGULAR',
                gdprConsentAt: gdprConsent ? new Date() : null,
                tenant: { connect: { id: tenantId } },
            },
        })

        return {
            data: {
                ...client,
                nome: client.name,
                telefone: client.phone,
                tipo: client.type === 'COLETIVO' ? 'COLETIVA' : 'SINGULAR',
            }
        }
    }

    async findAll(tenantId: string, filters: ClientFiltersDto) {
        const { search, tipo, page, perPage } = filters
        const skip = (page - 1) * perPage

        const where: any = {
            tenantId,
            deletedAt: null,
        }

        if (search) {
            where.OR = [
                { name: { contains: search, mode: 'insensitive' } },
                { nif: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
            ]
        }

        if (tipo) {
            where.type = tipo === 'COLETIVA' ? 'COLETIVO' : 'SINGULAR'
        }

        const [items, total] = await Promise.all([
            this.prisma.client.findMany({
                where,
                skip,
                take: perPage,
                orderBy: { name: 'asc' },
                include: {
                    _count: {
                        select: { matters: true },
                    },
                },
            }),
            this.prisma.client.count({ where }),
        ])

        return {
            data: items.map(item => ({
                ...item,
                nome: item.name,
                telefone: item.phone,
                tipo: item.type === 'COLETIVO' ? 'COLETIVA' : 'SINGULAR',
            })),
            meta: {
                total,
                page,
                perPage,
                totalPages: Math.ceil(total / perPage),
            },
        }
    }

    async findOne(tenantId: string, id: string) {
        const client = await this.prisma.client.findFirst({
            where: { id, tenantId, deletedAt: null },
            include: {
                matters: {
                    orderBy: { updatedAt: 'desc' },
                },
            },
        })

        if (!client) {
            throw new NotFoundException('Cliente não encontrado')
        }

        return {
            data: {
                ...client,
                nome: client.name,
                telefone: client.phone,
                tipo: client.type === 'COLETIVO' ? 'COLETIVA' : 'SINGULAR',
            }
        }
    }

    async update(tenantId: string, id: string, dto: UpdateClientDto) {
        await this.findOne(tenantId, id)

        const { nome, telefone, tipo, gdprConsent, ...rest } = dto

        const data: any = { ...rest }
        if (nome) data.name = nome
        if (telefone !== undefined) data.phone = telefone
        if (tipo) data.type = tipo === 'COLETIVA' ? 'COLETIVO' : 'SINGULAR'
        
        if (gdprConsent !== undefined) {
            data.gdprConsentAt = gdprConsent ? new Date() : null
        }

        const updated = await this.prisma.client.update({
            where: { id, tenantId },
            data,
        })

        return {
            data: {
                ...updated,
                nome: updated.name,
                telefone: updated.phone,
                tipo: updated.type === 'COLETIVO' ? 'COLETIVA' : 'SINGULAR',
            }
        }
    }

    async remove(tenantId: string, id: string) {
        await this.findOne(tenantId, id)

        const deleted = await this.prisma.client.update({
            where: { id, tenantId },
            data: { deletedAt: new Date() },
        })

        return { data: deleted }
    }

    async conflictCheck(tenantId: string, dto: ConflictCheckDto) {
        const { nome, nif, email, telefone } = dto

        const where: any = {
            tenantId,
            deletedAt: null,
            OR: [],
        }

        if (nome) where.OR.push({ name: { contains: nome, mode: 'insensitive' } })
        if (nif) where.OR.push({ nif })
        if (email) where.OR.push({ email: { contains: email, mode: 'insensitive' } })
        if (telefone) where.OR.push({ phone: { contains: telefone, mode: 'insensitive' } })

        if (where.OR.length === 0) delete where.OR

        const conflicts = await this.prisma.client.findMany({
            where,
            take: 5,
        })

        return {
            data: {
                hasConflicts: conflicts.length > 0,
                conflicts: conflicts.map(c => ({
                    id: c.id,
                    nome: c.name,
                    nif: c.nif,
                    type: c.type,
                })),
            }
        }
    }
}
