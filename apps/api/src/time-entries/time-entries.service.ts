import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

export interface CreateTimeEntryDto {
  matter_id: string;
  description: string;
  hours: number;
  rate_per_hour?: number;
  billable?: boolean;
  activity_date: string; // ISO date string
  task_id?: string;
}

export interface UpdateTimeEntryDto {
  description?: string;
  hours?: number;
  rate_per_hour?: number;
  billable?: boolean;
  activity_date?: string;
  task_id?: string;
}

@Injectable()
export class TimeEntriesService {
  constructor(private readonly prisma: PrismaService) { }

  async create(tenantId: string, userId: string, dto: CreateTimeEntryDto) {
    // Validar que o matter pertence ao tenant
    const matter = await this.prisma.matter.findFirst({
      where: { id: dto.matter_id, tenantId },
    });
    if (!matter) {
      throw new NotFoundException('Processo não encontrado.');
    }

    // Validar hours
    if (dto.hours <= 0 || dto.hours > 24) {
      throw new BadRequestException('Horas inválidas (deve estar entre 0 e 24).');
    }

    return this.prisma.timeEntry.create({
      data: {
        tenantId,
        matterId: dto.matter_id,
        userId,
        description: dto.description,
        hours: new Prisma.Decimal(dto.hours),
        ratePerHour: dto.rate_per_hour ? new Prisma.Decimal(dto.rate_per_hour) : null,
        billable: dto.billable ?? true,
        activityDate: new Date(dto.activity_date),
        taskId: dto.task_id || null,
      },
    });
  }

  async findByMatter(tenantId: string, matterId: string) {
    // Validar que o matter pertence ao tenant
    await this.prisma.matter.findFirstOrThrow({
      where: { id: matterId, tenantId },
    });

    return this.prisma.timeEntry.findMany({
      where: { matterId, tenantId },
      include: {
        user: { select: { id: true, name: true, email: true } },
        task: { select: { id: true, title: true } }
      },
      orderBy: { activityDate: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const entry = await this.prisma.timeEntry.findFirst({
      where: { id, tenantId },
      include: { user: true, matter: true },
    });

    if (!entry) {
      throw new NotFoundException('Registo de tempo não encontrado.');
    }

    return entry;
  }

  async update(tenantId: string, id: string, dto: UpdateTimeEntryDto) {
    await this.findOne(tenantId, id); // Valida que existe

    return this.prisma.timeEntry.update({
      where: { id },
      data: {
        ...(dto.description && { description: dto.description }),
        ...(dto.hours && { hours: new Prisma.Decimal(dto.hours) }),
        ...(dto.rate_per_hour && { ratePerHour: new Prisma.Decimal(dto.rate_per_hour) }),
        ...(dto.billable !== undefined && { billable: dto.billable }),
        ...(dto.activity_date && { activityDate: new Date(dto.activity_date) }),
        ...(dto.task_id && { taskId: dto.task_id }),
      },
    });
  }

  async delete(tenantId: string, id: string) {
    await this.findOne(tenantId, id);

    await this.prisma.timeEntry.delete({ where: { id } });
    return { message: `Registo de tempo eliminado com sucesso.` };
  }

  async getTotalHoursByMatter(tenantId: string, matterId: string) {
    const result = await this.prisma.timeEntry.aggregate({
      where: { matterId, tenantId },
      _sum: { hours: true },
      _count: true,
    });

    return {
      total_hours: result._sum.hours ? parseFloat(result._sum.hours.toString()) : 0,
      entry_count: result._count,
    };
  }

  async getTotalByUser(tenantId: string, userId: string) {
    const entries = await this.prisma.timeEntry.findMany({
      where: { userId, tenantId },
      include: { matter: true },
    });

    return entries;
  }
}
