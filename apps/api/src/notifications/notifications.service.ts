import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { Resend } from 'resend';

export interface DeadlineRunSummary {
  processed: number;
  sent: number;
  skipped: number;
  failed: number;
}

@Injectable()
export class NotificationsService {
  private readonly resend: Resend | null;
  private readonly fromEmail: string;

  constructor(private readonly prisma: PrismaService) {
    this.resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
    this.fromEmail = process.env.NOTIFICATIONS_FROM_EMAIL || 'notifications@advocatus.local';
  }

  async runDeadlineSweep(tenantId: string): Promise<DeadlineRunSummary> {
    const todayStart = this.startOfDay(new Date());
    const plus7 = new Date(todayStart);
    plus7.setDate(plus7.getDate() + 7);

    const tasks = await this.prisma.task.findMany({
      where: {
        tenantId,
        completedAt: null,
        dueAt: { not: null, gte: todayStart, lte: this.endOfDay(plus7) },
      },
      include: {
        assignedTo: { select: { email: true, name: true } },
        createdBy: { select: { email: true, name: true } },
        matter: { select: { title: true } },
      },
      orderBy: { dueAt: 'asc' },
    });

    const summary: DeadlineRunSummary = { processed: 0, sent: 0, skipped: 0, failed: 0 };

    for (const task of tasks) {
      if (!task.dueAt) {
        continue;
      }

      const daysRemaining = this.daysUntil(todayStart, task.dueAt);
      if (daysRemaining !== 7 && daysRemaining !== 1) {
        continue;
      }

      summary.processed += 1;
      const action = `NOTIFICATION_DEADLINE_D${daysRemaining}`;
      const alreadySentToday = await this.hasAuditForToday(tenantId, task.id, action, todayStart);
      if (alreadySentToday) {
        summary.skipped += 1;
        continue;
      }

      const targetEmail = task.assignedTo?.email || task.createdBy.email;
      const result = await this.sendDeadlineEmail({
        to: targetEmail,
        title: task.title,
        matterTitle: task.matter.title,
        daysRemaining,
      });

      await this.prisma.auditLog.create({
        data: {
          tenantId,
          userId: task.assignedToId || task.createdById,
          action: result.success ? action : `${action}_FAILED`,
          resourceType: 'TASK',
          resourceId: task.id,
          oldValue: Prisma.JsonNull,
          newValue: {
            to: targetEmail,
            days_remaining: daysRemaining,
            dry_run: result.dryRun,
            message_id: result.messageId || null,
            error: result.error || null,
          },
        },
      });

      if (result.success) {
        summary.sent += 1;
        if (daysRemaining === 1 && !task.notificationSent) {
          await this.prisma.task.update({
            where: { id: task.id },
            data: { notificationSent: true },
          });
        }
      } else {
        summary.failed += 1;
      }
    }

    return summary;
  }

  async sendTestNotification(tenantId: string, taskId: string) {
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, tenantId },
      include: {
        assignedTo: { select: { email: true } },
        createdBy: { select: { email: true } },
        matter: { select: { title: true } },
      },
    });

    if (!task || !task.dueAt) {
      throw new NotFoundException('Tarefa com prazo não encontrada.');
    }

    const email = task.assignedTo?.email || task.createdBy.email;
    const result = await this.sendDeadlineEmail({
      to: email,
      title: task.title,
      matterTitle: task.matter.title,
      daysRemaining: this.daysUntil(this.startOfDay(new Date()), task.dueAt),
    });

    await this.prisma.auditLog.create({
      data: {
        tenantId,
        userId: task.assignedToId || task.createdById,
        action: result.success ? 'NOTIFICATION_TEST_SENT' : 'NOTIFICATION_TEST_FAILED',
        resourceType: 'TASK',
        resourceId: task.id,
        oldValue: Prisma.JsonNull,
        newValue: {
          to: email,
          dry_run: result.dryRun,
          message_id: result.messageId || null,
          error: result.error || null,
        },
      },
    });

    return {
      task_id: task.id,
      success: result.success,
      dry_run: result.dryRun,
      error: result.error || null,
    };
  }

  private async sendDeadlineEmail(input: {
    to: string;
    title: string;
    matterTitle: string;
    daysRemaining: number;
  }) {
    if (!this.resend) {
      return { success: true, dryRun: true, messageId: null, error: null };
    }

    try {
      const response = await this.resend.emails.send({
        from: this.fromEmail,
        to: input.to,
        subject: `[Advocatus] Prazo em ${input.daysRemaining} dia(s): ${input.title}`,
        text: `Tarefa: ${input.title}\nProcesso: ${input.matterTitle}\nPrazo em ${input.daysRemaining} dia(s).`,
      });
      return { success: true, dryRun: false, messageId: response.data?.id || null, error: null };
    } catch (error) {
      return {
        success: false,
        dryRun: false,
        messageId: null,
        error: (error as Error).message || 'Erro ao enviar email',
      };
    }
  }

  private async hasAuditForToday(
    tenantId: string,
    taskId: string,
    action: string,
    todayStart: Date,
  ) {
    const existing = await this.prisma.auditLog.findFirst({
      where: {
        tenantId,
        resourceType: 'TASK',
        resourceId: taskId,
        action,
        timestamp: { gte: todayStart },
      },
      select: { id: true },
    });
    return Boolean(existing);
  }

  private startOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0, 0);
  }

  private endOfDay(date: Date) {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);
  }

  private daysUntil(todayStart: Date, dueDate: Date) {
    const dueStart = this.startOfDay(dueDate);
    const diff = dueStart.getTime() - todayStart.getTime();
    return Math.round(diff / 86_400_000);
  }
}
