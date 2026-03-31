import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { CreateTaskDto, UpdateTaskDto } from './dto/task.dto'
import { LegalDeadlineService } from './legal-deadline.service'

@Injectable()
export class TasksService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly deadlineService: LegalDeadlineService,
    ) { }

    async create(tenantId: string, createdById: string, dto: CreateTaskDto) {
        let finalDueAt = dto.dueAt;

        // Cálculo assistido de prazo se 'days' e 'startDate' forem fornecidos
        if (dto.days && dto.startDate) {
            const calculation = this.deadlineService.calculateDeadline({
                startDate: dto.startDate,
                days: dto.days,
                isUrgent: dto.isUrgent ?? false,
                includeSuspension: dto.type === 'PRAZO',
                dilacao: dto.dilacao ?? 0,
            });
            finalDueAt = calculation.dueAt;
        }


        return this.prisma.task.create({
            data: {
                tenantId,
                createdById,
                matterId: dto.matterId,
                title: dto.title,
                description: dto.description,
                type: dto.type ?? 'OUTRO',
                priority: dto.priority ?? 'MEDIA',
                dueAt: finalDueAt,
                startDate: dto.startDate,
                endDate: dto.endDate,
                penaltyLimitAt: (dto.days && dto.startDate) ? 
                    this.deadlineService.calculateDeadline({
                        startDate: dto.startDate,
                        days: dto.days,
                        isUrgent: dto.isUrgent ?? false,
                        includeSuspension: dto.type === 'PRAZO',
                        dilacao: dto.dilacao ?? 0,
                    }).penaltyLimitAt : null,
                assignedToId: dto.assignedToId,
            },
            include: {
                assignedTo: { select: { id: true, name: true } },
                matter: { select: { id: true, title: true } },
            },
        })
    }

    async findByMatter(tenantId: string, matterId: string) {
        return this.prisma.task.findMany({
            where: { matterId, tenantId },
            include: {
                assignedTo: { select: { id: true, name: true } },
            },
            orderBy: [{ priority: 'desc' }, { dueAt: 'asc' }],
        })
    }

    /** Busca todas as tarefas abertas do tenant — para o dashboard */
    async findUpcoming(tenantId: string, userId?: string) {
        return this.prisma.task.findMany({
            where: {
                tenantId,
                completedAt: null,
                ...(userId && { assignedToId: userId }),
                dueAt: { gte: new Date() },
            },
            include: {
                matter: { select: { id: true, title: true } },
                assignedTo: { select: { id: true, name: true } },
            },
            orderBy: { dueAt: 'asc' },
            take: 50,
        })
    }

    async update(tenantId: string, id: string, dto: UpdateTaskDto) {
        const task = await this.prisma.task.findFirst({ where: { id, tenantId } })
        if (!task) throw new NotFoundException('Tarefa não encontrada.')

        return this.prisma.task.update({
            where: { id },
            data: {
                ...dto,
                completedAt: dto.completedAt ?? null,
            },
        })
    }

    async remove(tenantId: string, id: string) {
        const task = await this.prisma.task.findFirst({ where: { id, tenantId } })
        if (!task) throw new NotFoundException('Tarefa não encontrada.')
        await this.prisma.task.delete({ where: { id } })
        return { message: 'Tarefa eliminada.' }
    }
}
