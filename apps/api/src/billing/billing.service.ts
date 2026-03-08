import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface CreateInvoiceDraftDto {
  matter_id: string;
  vat_rate?: number;
  due_date?: string;
  notes?: string;
}

@Injectable()
export class BillingService {
  constructor(private readonly prisma: PrismaService) {}

  async createDraft(tenantId: string, dto: CreateInvoiceDraftDto) {
    const matter = await this.prisma.matter.findFirst({
      where: { id: dto.matter_id, tenantId },
      include: { client: true },
    });

    if (!matter) {
      throw new NotFoundException('Processo não encontrado.');
    }

    const [timeEntries, expenses, invoiceCount] = await Promise.all([
      this.prisma.timeEntry.findMany({
        where: { tenantId, matterId: dto.matter_id, billable: true, invoiceId: null },
      }),
      this.prisma.expense.findMany({
        where: { tenantId, matterId: dto.matter_id, billable: true, invoiceId: null },
      }),
      this.prisma.invoice.count({ where: { tenantId } }),
    ]);

    if (timeEntries.length === 0 && expenses.length === 0) {
      throw new BadRequestException('Não existem itens faturáveis pendentes para este processo.');
    }

    const feesSubtotal = this.roundMoney(
      timeEntries.reduce((sum, entry) => {
        const hours = Number(entry.hours || 0);
        const rate = Number(entry.ratePerHour || 0);
        return sum + hours * rate;
      }, 0),
    );
    const expensesSubtotal = this.roundMoney(
      expenses.reduce((sum, expense) => sum + Number(expense.amount || 0), 0),
    );

    const amount = this.roundMoney(feesSubtotal + expensesSubtotal);
    const vatRate = this.roundMoney(dto.vat_rate ?? 23);
    const vatAmount = this.roundMoney((amount * vatRate) / 100);
    const total = this.roundMoney(amount + vatAmount);
    const reference = this.generateReference(invoiceCount + 1);

    const invoice = await this.prisma.invoice.create({
      data: {
        tenantId,
        matterId: matter.id,
        clientId: matter.clientId,
        reference,
        amount,
        vatRate,
        total,
        dueDate: dto.due_date ? new Date(dto.due_date) : null,
        notes: dto.notes || null,
      },
    });

    await Promise.all([
      this.prisma.timeEntry.updateMany({
        where: { tenantId, matterId: matter.id, billable: true, invoiceId: null },
        data: { invoiceId: invoice.id },
      }),
      this.prisma.expense.updateMany({
        where: { tenantId, matterId: matter.id, billable: true, invoiceId: null },
        data: { invoiceId: invoice.id },
      }),
    ]);

    return {
      ...invoice,
      breakdown: {
        fees_subtotal: feesSubtotal,
        expenses_subtotal: expensesSubtotal,
        vat_amount: vatAmount,
      },
    };
  }

  async list(
    tenantId: string,
    query: { matter_id?: string; client_id?: string; status?: InvoiceStatus },
  ) {
    return this.prisma.invoice.findMany({
      where: {
        tenantId,
        ...(query.matter_id ? { matterId: query.matter_id } : {}),
        ...(query.client_id ? { clientId: query.client_id } : {}),
        ...(query.status ? { status: query.status } : {}),
      },
      include: {
        client: { select: { id: true, name: true } },
        matter: { select: { id: true, title: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: {
        client: { select: { id: true, name: true, nif: true } },
        matter: { select: { id: true, title: true, courtReference: true } },
      },
    });

    if (!invoice) {
      throw new NotFoundException('Fatura não encontrada.');
    }

    return invoice;
  }

  async getDraftPdf(tenantId: string, id: string) {
    const invoice = await this.findOne(tenantId, id);
    const [entries, expenses] = await Promise.all([
      this.prisma.timeEntry.findMany({
        where: { tenantId, invoiceId: id },
        select: { description: true, hours: true, ratePerHour: true },
      }),
      this.prisma.expense.findMany({
        where: { tenantId, invoiceId: id },
        select: { description: true, amount: true, category: true },
      }),
    ]);

    const previewLines = [
      `FATURA DRAFT ${invoice.reference}`,
      `Cliente: ${invoice.client.name}`,
      `Processo: ${invoice.matter.title}`,
      `Subtotal: EUR ${Number(invoice.amount).toFixed(2)}`,
      `IVA (${Number(invoice.vatRate).toFixed(2)}%): EUR ${this.roundMoney(
        Number(invoice.total) - Number(invoice.amount),
      ).toFixed(2)}`,
      `Total: EUR ${Number(invoice.total).toFixed(2)}`,
      '',
      'Itens de honorários:',
      ...entries.map(
        (entry) =>
          `- ${entry.description} | ${Number(entry.hours).toFixed(2)}h @ EUR ${Number(
            entry.ratePerHour || 0,
          ).toFixed(2)}`,
      ),
      'Itens de despesas:',
      ...expenses.map(
        (expense) =>
          `- ${expense.description} | ${expense.category} | EUR ${Number(expense.amount).toFixed(2)}`,
      ),
    ].join('\n');

    return {
      invoice_id: invoice.id,
      filename: `${invoice.reference}-draft.pdf`,
      mime_type: 'application/pdf',
      content_base64: Buffer.from(previewLines, 'utf8').toString('base64'),
      preview: previewLines,
    };
  }

  private generateReference(sequence: number) {
    const date = new Date();
    const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(
      date.getDate(),
    ).padStart(2, '0')}`;
    const seqPart = String(sequence).padStart(4, '0');
    return `INV-${datePart}-${seqPart}`;
  }

  private roundMoney(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
