import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import { ExpenseCategory } from '@prisma/client';

export interface CreateExpenseDto {
    matter_id: string;
    task_id?: string;
    description: string;
    category: ExpenseCategory;
    amount: number;
    date: string; // ISO date string or YYYY-MM-DD
    billable?: boolean;
}

export interface UpdateExpenseDto {
    description?: string;
    category?: ExpenseCategory;
    amount?: number;
    date?: string;
    billable?: boolean;
    task_id?: string;
}

@Injectable()
export class ExpensesService {
    constructor(private readonly prisma: PrismaService) { }

    async create(tenantId: string, userId: string, dto: CreateExpenseDto) {
        // Validar que o matter pertence ao tenant
        const matter = await this.prisma.matter.findFirst({
            where: { id: dto.matter_id, tenantId },
        });
        if (!matter) {
            throw new NotFoundException('Processo não encontrado.');
        }

        // Se houver taskId, validar que pertence ao matter e tenant
        if (dto.task_id) {
            const task = await this.prisma.task.findFirst({
                where: { id: dto.task_id, matterId: dto.matter_id, tenantId },
            });
            if (!task) {
                throw new NotFoundException('Tarefa não encontrada para este processo.');
            }
        }

        return this.prisma.expense.create({
            data: {
                tenantId,
                matterId: dto.matter_id,
                userId,
                taskId: dto.task_id || null,
                description: dto.description,
                category: dto.category,
                amount: new Prisma.Decimal(dto.amount),
                date: new Date(dto.date),
                billable: dto.billable ?? true,
            },
        });
    }

    async findByMatter(tenantId: string, matterId: string) {
        await this.prisma.matter.findFirstOrThrow({
            where: { id: matterId, tenantId },
        });

        return this.prisma.expense.findMany({
            where: { matterId, tenantId },
            include: {
                user: { select: { id: true, name: true } },
                task: { select: { id: true, title: true } }
            },
            orderBy: { date: 'desc' },
        });
    }

    async findOne(tenantId: string, id: string) {
        const expense = await this.prisma.expense.findFirst({
            where: { id, tenantId },
            include: { user: true, matter: true, task: true },
        });

        if (!expense) {
            throw new NotFoundException('Despesa não encontrada.');
        }

        return expense;
    }

    async update(tenantId: string, id: string, dto: UpdateExpenseDto) {
        await this.findOne(tenantId, id);

        return this.prisma.expense.update({
            where: { id },
            data: {
                ...(dto.description && { description: dto.description }),
                ...(dto.category && { category: dto.category }),
                ...(dto.amount && { amount: new Prisma.Decimal(dto.amount) }),
                ...(dto.date && { date: new Date(dto.date) }),
                ...(dto.billable !== undefined && { billable: dto.billable }),
                ...(dto.task_id && { taskId: dto.task_id }),
            },
        });
    }

    async delete(tenantId: string, id: string) {
        await this.findOne(tenantId, id);
        await this.prisma.expense.delete({ where: { id } });
        return { message: 'Despesa eliminada com sucesso.' };
    }

    async getSummaryByMatter(tenantId: string, matterId: string) {
        const result = await this.prisma.expense.aggregate({
            where: { matterId, tenantId },
            _sum: { amount: true },
            _count: true,
        });

        return {
            total_amount: result._sum.amount ? parseFloat(result._sum.amount.toString()) : 0,
            expense_count: result._count,
        };
    }
}
