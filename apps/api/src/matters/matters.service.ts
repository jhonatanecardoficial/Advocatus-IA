import { Injectable, NotFoundException, ConflictException } from '@nestjs/common'
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

    async remove(tenantId: string, id: string) {
        const matter = await this.findOne(tenantId, id)

        const dependenciesCount = await this.prisma.matter.findUnique({
            where: { id },
            select: {
                _count: { select: { documents: true, tasks: true, timeEntries: true, invoices: true } }
            }
        });

        if (!dependenciesCount) {
            throw new NotFoundException('Processo não encontrado.');
        }

        const { documents, tasks, timeEntries, invoices } = dependenciesCount._count;
        if (documents > 0 || tasks > 0 || timeEntries > 0 || invoices > 0) {
            throw new ConflictException('Não é possível eliminar o processo, pois possui registos associados (documentos, tarefas, horas ou faturas).')
        }

        await this.prisma.matter.delete({ where: { id } })
        return { message: `Processo '${matter.title}' eliminado com sucesso.` }
    }

    async getTimeline(tenantId: string, id: string) {
        // Garantir que o matter existe e pertence ao tenant
        await this.findOne(tenantId, id);

        const [tasks, documents, timeEntries, auditLogs] = await Promise.all([
            this.prisma.task.findMany({
                where: { matterId: id, tenantId },
                select: { id: true, title: true, type: true, createdAt: true, completedAt: true, createdBy: { select: { name: true } } }
            }),
            this.prisma.document.findMany({
                where: { matterId: id, tenantId },
                select: { id: true, filename: true, createdAt: true, uploadedById: true }
            }),
            this.prisma.timeEntry.findMany({
                where: { matterId: id, tenantId },
                select: { id: true, description: true, hours: true, activityDate: true, createdAt: true, user: { select: { name: true } } }
            }),
            this.prisma.auditLog.findMany({
                where: { resourceId: id, resourceType: 'Matter', tenantId },
                select: { id: true, action: true, timestamp: true, user: { select: { name: true } } }
            })
        ]);

        const timeline = [
            ...tasks.map(t => ({
                id: `task_create_${t.id}`,
                type: 'TASK_CREATED',
                title: `Tarefa Mapeada: ${t.title}`,
                date: t.createdAt as Date,
                user: t.createdBy?.name
            })),
            ...tasks.filter(t => t.completedAt).map(t => ({
                id: `task_complete_${t.id}`,
                type: 'TASK_COMPLETED',
                title: `Tarefa Concluída: ${t.title}`,
                date: t.completedAt as Date,
                user: t.createdBy?.name
            })),
            ...documents.map(d => ({
                id: `doc_${d.id}`,
                type: 'DOCUMENT_UPLOADED',
                title: `Documento Adicionado: ${d.filename}`,
                date: d.createdAt as Date,
                user: null
            })),
            ...timeEntries.map(te => ({
                id: `time_${te.id}`,
                type: 'TIME_ENTRY',
                title: `Registo de Tempo: ${te.hours}h - ${te.description}`,
                date: te.activityDate as Date,
                user: te.user?.name
            })),
            ...auditLogs.map(a => ({
                id: `audit_${a.id}`,
                type: 'AUDIT_LOG',
                title: `Ação no Processo: ${a.action}`,
                date: a.timestamp as Date,
                user: a.user?.name
            }))
        ];

        return timeline.sort((a, b) => b.date.getTime() - a.date.getTime());
    }
}
