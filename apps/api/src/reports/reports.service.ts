import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Métricas rápidas para o Dashboard
   */
  async getDashboardMetrics(tenantId: string) {
    const now = new Date();
    const next7Days = new Date();
    next7Days.setDate(now.getDate() + 7);

    const [activeMatters, upcomingTasks, fatalDeadlines, newClients] = await Promise.all([
      // Processos Ativos
      this.prisma.matter.count({
        where: { tenantId, status: 'ATIVO' },
      }),
      // Tarefas nos próximos 7 dias (Audiências/Prazos)
      this.prisma.task.count({
        where: {
          tenantId,
          dueAt: { gte: now, lte: next7Days },
          completedAt: null,
        },
      }),
      // Prazos Fatais (menos de 48h)
      this.prisma.task.count({
        where: {
          tenantId,
          dueAt: { gte: now, lte: new Date(now.getTime() + 48 * 60 * 60 * 1000) },
          priority: 'ALTA',
          completedAt: null,
        },
      }),
      // Novos Clientes (mês atual)
      this.prisma.client.count({
        where: {
          tenantId,
          createdAt: { gte: new Date(now.getFullYear(), now.getMonth(), 1) },
        },
      }),
    ]);

    return {
      activeMatters,
      upcomingTasks,
      fatalDeadlines,
      newClients,
    };
  }

  /**
   * Relatório de Rentabilidade por Processo
   */
  async getProfitabilityReport(tenantId: string) {
    const matters = await this.prisma.matter.findMany({
      where: { tenantId },
      select: {
        id: true,
        title: true,
        courtReference: true,
        client: { select: { name: true } },
        timeEntries: {
          select: {
            hours: true,
            ratePerHour: true,
          },
        },
        expenses: {
          select: {
            amount: true,
          },
        },
      },
    });

    return matters.map((m) => {
      const revenue = m.timeEntries.reduce((acc, curr) => {
        return acc + (Number(curr.hours) * Number(curr.ratePerHour || 0));
      }, 0);

      const costs = m.expenses.reduce((acc, curr) => {
        return acc + Number(curr.amount);
      }, 0);

      const profit = revenue - costs;

      return {
        id: m.id,
        title: m.title,
        client: m.client.name,
        revenue,
        costs,
        profit,
        margin: revenue > 0 ? (profit / revenue) * 100 : 0,
      };
    });
  }
}
