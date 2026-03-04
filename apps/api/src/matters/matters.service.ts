import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateMatterDto, UpdateMatterDto, MatterFiltersDto } from './dto/matter.dto'

@Injectable()
export class MattersService {
    constructor(private readonly prisma: PrismaService) { }

    async create(tenantId: string, dto: CreateMatterDto) {
        return this.prisma.matter.create({
            data: {
                tenantId,
                clientId: dto.clientId,
                title: dto.title,
                type: dto.type ?? 'OUTRO',
                description: dto.description,
                courtReference: dto.courtReference,
                citiusReference: dto.citiusReference,
                opposingParty: dto.opposingParty,
                opposingCounsel: dto.opposingCounsel,
                deadlineAt: dto.deadlineAt,
                responsibleId: dto.responsibleId,
            },
            include: {
                client: { select: { id: true, name: true, type: true } },
            },
        })
    }

    async findAll(tenantId: string, filters: MatterFiltersDto) {
        const { search, clientId, type, status, responsibleId, page, perPage } = filters
        const skip = (page - 1) * perPage

        const where = {
            tenantId,
            ...(clientId && { clientId }),
            ...(type && { type }),
            ...(status && { status }),
            ...(responsibleId && { responsibleId }),
            ...(search && {
                OR: [
                    { title: { contains: search, mode: 'insensitive' as const } },
                    { courtReference: { contains: search } },
                    { citiusReference: { contains: search } },
                    { opposingParty: { contains: search, mode: 'insensitive' as const } },
                ],
            }),
        }

        const [matters, total] = await Promise.all([
            this.prisma.matter.findMany({
                where,
                skip,
                take: perPage,
                orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
                include: {
                    client: { select: { id: true, name: true } },
                    _count: { select: { documents: true, tasks: true, timeEntries: true } },
                },
            }),
            this.prisma.matter.count({ where }),
        ])

        return {
            data: matters,
            meta: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
        }
    }

    async findOne(tenantId: string, id: string) {
        const matter = await this.prisma.matter.findFirst({
            where: { id, tenantId },
            include: {
                client: { select: { id: true, name: true, email: true, phone: true } },
                documents: {
                    select: {
                        id: true,
                        filename: true,
                        mimeType: true,
                        version: true,
                        signatureType: true,
                        createdAt: true,
                    },
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
                tasks: {
                    where: { completedAt: null },
                    select: {
                        id: true,
                        title: true,
                        type: true,
                        priority: true,
                        dueAt: true,
                        assignedTo: { select: { id: true, name: true } },
                    },
                    orderBy: { dueAt: 'asc' },
                },
                timeEntries: {
                    select: { id: true, hours: true, description: true, activityDate: true, billable: true },
                    orderBy: { activityDate: 'desc' },
                    take: 10,
                },
            },
        })

        if (!matter) throw new NotFoundException('Processo não encontrado.')
        return matter
    }

    async update(tenantId: string, id: string, dto: UpdateMatterDto) {
        await this.findOne(tenantId, id)

        return this.prisma.matter.update({
            where: { id },
            data: {
                ...dto,
                closedAt: dto.status === 'ENCERRADO' ? new Date() : undefined,
            },
        })
    }
}
