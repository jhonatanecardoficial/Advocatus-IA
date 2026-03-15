import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { BillingCertificationService } from './billing-certification.service';
import * as PDFDocument from 'pdfkit';
import * as QRCode from 'qrcode';

export interface CreateInvoiceDraftDto {
  matter_id: string;
  vat_rate?: number;
  due_date?: string;
  notes?: string;
}

@Injectable()
export class BillingService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly certification: BillingCertificationService,
  ) {}

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
        series: 'A', // Série padrão inicial
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

  async generateInvoicePdf(tenantId: string, invoiceId: string) {
    const [invoice, tenant] = await Promise.all([
      this.prisma.invoice.findFirst({
        where: { id: invoiceId, tenantId },
        include: { 
          client: true,
          matter: true
        },
      }),
      this.prisma.tenant.findUnique({
        where: { id: tenantId }
      })
    ]);

    if (!invoice) {
        throw new NotFoundException('Fatura não encontrada.');
    }

    const { isCertified } = invoice;
    const entries = await this.prisma.timeEntry.findMany({ where: { invoiceId } });
    const expenses = await this.prisma.expense.findMany({ where: { invoiceId } });

    // 1. Calcular Totais
    const subtotal = Number(invoice.amount);
    const vatRate = Number(invoice.vatRate);
    const vatAmount = this.roundMoney(subtotal * (vatRate / 100));
    const total = Number(invoice.total);

    // 2. Gerar QR Code String (Simplificada para conformidade AT)
    const qrString = [
      `A:${(tenant as any)?.nif || '999999990'}`,
      `B:${invoice.client.nif || '999999990'}`,
      `C:PT`,
      `D:FT`,
      `E:${isCertified ? 'N' : 'D'}`,
      `F:${invoice.createdAt.toISOString().split('T')[0].replace(/-/g, '')}`,
      `G:${invoice.reference}`,
      `H:${(invoice as any).atcud || '0'}`,
      `I1:PT`,
      `I7:${subtotal.toFixed(2)}`,
      `I8:${vatAmount.toFixed(2)}`,
      `N:${total.toFixed(2)}`,
      `O:${total.toFixed(2)}`,
      `Q:${isCertified ? (invoice as any).hashControl : ''}`
    ].join('*');

    const qrCodeDataUrl = await QRCode.toDataURL(qrString);

    // 3. Gerar PDF com PDFKit
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', (chunk: any) => buffers.push(chunk));

    return new Promise((resolve, reject) => {
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(buffers);
        resolve({
          invoice_id: invoice.id,
          filename: `${invoice.reference}${isCertified ? '' : '-draft'}.pdf`,
          mime_type: 'application/pdf',
          content_base64: pdfBuffer.toString('base64'),
        });
      });

      try {
        // --- Cabeçalho ---
        doc.fontSize(20).text(tenant?.name || 'ADVOCATUS IA', { align: 'right' });
        doc.fontSize(10).text((tenant as any)?.address || 'Endereço não configurado', { align: 'right' });
        doc.text(`${(tenant as any)?.postalCode || ''} ${(tenant as any)?.city || ''}`, { align: 'right' });
        doc.text(`NIF: ${(tenant as any)?.nif || '---'}`, { align: 'right' });
        doc.moveDown();

        // --- Título e Info do Documento ---
        doc.rect(50, 150, 500, 2).fill('#f59e0b');
        doc.moveDown();
        doc.fontSize(16).text(isCertified ? 'FATURA' : 'PROFORMA / DRAFT', 50, 170);
        doc.fontSize(10).text(`Referência: ${invoice.reference}`, 50, 190);
        doc.text(`Data: ${invoice.createdAt.toLocaleDateString('pt-PT')}`, 50, 205);
        if (isCertified && (invoice as any).atcud) {
          doc.text(`ATCUD: ${(invoice as any).atcud}`, 50, 220);
        }

        // --- Cliente ---
        doc.text('Dados do Cliente:', 350, 170, { underline: true });
        doc.text(invoice.client.name, 350, 185);
        if (invoice.client.email) doc.text(invoice.client.email, 350, 198);
        doc.text(`NIF: ${invoice.client.nif || 'Consumidor Final'}`, 350, 211);

        doc.moveDown(4);

        // --- Tabela de Itens ---
        const tableTop = 280;
        doc.font('Helvetica-Bold').fontSize(10).text('Descrição', 50, tableTop);
        doc.text('Quantidade/Horas', 250, tableTop, { align: 'right' });
        doc.text('Preço Unit.', 350, tableTop, { align: 'right' });
        doc.text('Total', 450, tableTop, { align: 'right' });

        let currentY = tableTop + 20;

        // Honorários
        entries.forEach(entry => {
          doc.fontSize(9).text(entry.description, 50, currentY, { width: 180 });
          doc.text(`${Number(entry.hours).toFixed(2)}h`, 250, currentY, { align: 'right' });
          doc.text(`${Number(entry.ratePerHour || 0).toFixed(2)} €`, 350, currentY, { align: 'right' });
          const rowTotal = Number(entry.hours) * Number(entry.ratePerHour || 0);
          doc.text(`${rowTotal.toFixed(2)} €`, 450, currentY, { align: 'right' });
          currentY += 15;
        });

        // Despesas
        expenses.forEach(expense => {
          doc.fontSize(9).text(`[Despesa] ${expense.description}`, 50, currentY, { width: 180 });
          doc.text('1.00', 250, currentY, { align: 'right' });
          doc.text(`${Number(expense.amount).toFixed(2)} €`, 350, currentY, { align: 'right' });
          doc.text(`${Number(expense.amount).toFixed(2)} €`, 450, currentY, { align: 'right' });
          currentY += 15;
        });

        // --- Totais ---
        doc.moveDown(2);
        const totalsY = currentY + 30;
        doc.fontSize(10).text('Subtotal:', 350, totalsY, { align: 'right' });
        doc.text(`${subtotal.toFixed(2)} €`, 450, totalsY, { align: 'right' });
        
        doc.text(`IVA (${vatRate}%):`, 350, totalsY + 15, { align: 'right' });
        doc.text(`${vatAmount.toFixed(2)} €`, 450, totalsY + 15, { align: 'right' });

        doc.font('Helvetica-Bold').fontSize(12).text('TOTAL:', 350, totalsY + 35, { align: 'right' });
        doc.text(`${total.toFixed(2)} €`, 450, totalsY + 35, { align: 'right' });

        // --- QR Code e Rodapé Fiscal ---
        if (isCertified) {
          doc.image(qrCodeDataUrl, 50, 680, { width: 80 });
          doc.fontSize(8).text(`Hash: ${(invoice as any).hashControl} - Processado por programa certificado n.º 9999/AT`, 140, 700);
          doc.text('Os bens/serviços foram colocados à disposição do adquirente na data e local deste documento.', 140, 715);
        } else {
          doc.fontSize(12).fillColor('red').text('ESTE DOCUMENTO NÃO SERVE DE FATURA', 50, 700, { align: 'center' });
        }

        doc.end();
      } catch (err) {
        console.error('ERRO NA GERAÇÃO DO PDF:', err);
        reject(err);
      }
    }) as Promise<any>;
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

    const isCertified = !!invoice.isCertified;
    const previewLines = [
      isCertified ? `FATURA ${invoice.reference}` : `PROFORMA / DRAFT ${invoice.reference}`,
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
      '',
      isCertified ? 'Documento processado por programa certificado n.º 9999/AT' : 'Documento proforma - Não serve de fatura',
      isCertified ? `Assinatura: ${(invoice as any).hashControl}-Processado por programa certificado n.º 9999/AT` : '',
      (invoice as any).atcud ? `ATCUD: ${(invoice as any).atcud}` : '',
    ].join('\n');

    return {
      invoice_id: invoice.id,
      filename: `${invoice.reference}-draft.pdf`,
      mime_type: 'application/pdf',
      content_base64: Buffer.from(previewLines, 'utf8').toString('base64'),
      preview: previewLines,
    };
  }

  async finalizeInvoice(tenantId: string, id: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, tenantId },
      include: { client: true },
    });

    if (!invoice) {
      throw new NotFoundException('Fatura não encontrada.');
    }

    if (invoice.isCertified) {
      throw new BadRequestException('Esta fatura já foi certificada.');
    }

    // 1. Obter ou Criar Série
    const series = await this.findOrCreateSeries(tenantId, invoice.series);

    // 2. Incrementar número na série (Atómico)
    const updatedSeries = await this.prisma.invoiceSeries.update({
      where: { id: series.id },
      data: { nextNumber: { increment: 1 } },
    });

    const invoiceNumber = updatedSeries.nextNumber - 1;
    const reference = `${updatedSeries.code} ${invoiceNumber}`;

    // 3. Obter hash da última fatura da mesma série
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: { tenantId, series: updatedSeries.code, isCertified: true },
      orderBy: { number: 'desc' },
      select: { hash: true },
    });

    // 4. Gerar Assinatura
    const systemEntryDate = new Date().toISOString().split('.')[0]; // Formato AT: YYYY-MM-DDTHH:mm:ss
    const invoiceDate = invoice.createdAt.toISOString().split('T')[0];
    
    const message = this.certification.createSignatureMessage(
      invoiceDate,
      systemEntryDate,
      reference,
      Number(invoice.total),
      lastInvoice?.hash || undefined,
    );

    const signature = this.certification.sign(message);
    const hashControl = this.certification.getHashControl(signature);

    // 5. Atualizar Fatura
    return this.prisma.invoice.update({
      where: { id },
      data: {
        number: invoiceNumber,
        reference,
        signature,
        hash: signature, // Na prática da AT, o hash é a própria assinatura (ou parte dela)
        hashControl,
        isCertified: true,
        certDate: new Date(),
        status: InvoiceStatus.SENT, // Marcar como enviada/emitida
        atcud: `MOCK-${reference}`, // Código Único de Documento
      },
    });
  }

  async findOrCreateSeries(tenantId: string, code: string) {
    let series = await (this.prisma as any).invoiceSeries.findUnique({
      where: { tenantId_code: { tenantId, code } },
    });

    if (!series) {
      series = await (this.prisma as any).invoiceSeries.create({
        data: {
          tenantId,
          code,
          type: 'FT',
        },
      });
    }

    return series;
  }

  async updateTenantBillingDetails(tenantId: string, details: any) {
    return (this.prisma as any).tenant.update({
      where: { id: tenantId },
      data: {
        nif: details.nif,
        address: details.address,
        postalCode: details.postalCode,
        city: details.city,
        phone: details.phone,
        email: details.email,
        commercialRegistration: details.commercialRegistration,
      },
    });
  }

  async generateSaft(tenantId: string, startDate: string, endDate: string) {
    const [tenant, invoices] = await Promise.all([
      (this.prisma as any).tenant.findUnique({ where: { id: tenantId } }),
      this.prisma.invoice.findMany({
        where: {
          tenantId,
          certDate: { gte: new Date(startDate), lte: new Date(endDate) },
          isCertified: true,
        },
        include: { client: true },
      }),
    ]);

    if (!tenant) throw new NotFoundException('Empresa não encontrada');

    // Minimal SAF-T PT structure v1.04
    const xml = `<?xml version="1.0" encoding="Windows-1252"?>
<AuditFile xmlns="urn:OECD:StandardAuditFile-Tax:PT_1.04_01">
  <Header>
    <AuditFileVersion>1.04_01</AuditFileVersion>
    <CompanyID>${tenantId}</CompanyID>
    <TaxRegistrationNumber>${tenant.nif || '999999990'}</TaxRegistrationNumber>
    <TaxAccountingBasis>P</TaxAccountingBasis>
    <CompanyName>${tenant.name}</CompanyName>
    <BusinessName>${tenant.name}</BusinessName>
    <CompanyAddress>
      <AddressDetail>${tenant.address || 'Sem morada'}</AddressDetail>
      <City>${tenant.city || 'Sem cidade'}</City>
      <PostalCode>${tenant.postalCode || '0000-000'}</PostalCode>
      <Country>PT</Country>
    </CompanyAddress>
    <FiscalYear>${new Date(startDate).getFullYear()}</FiscalYear>
    <StartDate>${startDate}</StartDate>
    <EndDate>${endDate}</EndDate>
    <CurrencyCode>EUR</CurrencyCode>
    <DateCreated>${new Date().toISOString().split('T')[0]}</DateCreated>
    <TaxEntity>Global</TaxEntity>
    <ProductCompanyID>${tenant.commercialRegistration || 'Registo Comercial'}</ProductCompanyID>
    <SoftwareCertificateNumber>9999</SoftwareCertificateNumber>
    <ProductID>Advocatus-IA/0.1</ProductID>
    <ProductVersion>0.1</ProductVersion>
  </Header>
  <MasterFiles>
    <Customer>
      ${[...new Set(invoices.map(inv => inv.client))].map(client => `
      <CustomerID>${client.id}</CustomerID>
      <AccountID>Desconhecido</AccountID>
      <RegistrationNumber>${client.nif || '999999990'}</RegistrationNumber>
      <CompanyName>${client.name}</CompanyName>
      <BillingAddress>
        <AddressDetail>${client.address || 'Sem morada'}</AddressDetail>
        <City>Desconhecida</City>
        <PostalCode>0000-000</PostalCode>
        <Country>PT</Country>
      </BillingAddress>
      <SelfBillingIndicator>0</SelfBillingIndicator>`).join('')}
    </Customer>
  </MasterFiles>
  <SourceDocuments>
    <SalesInvoices>
      <NumberOfEntries>${invoices.length}</NumberOfEntries>
      <TotalDebit>0.00</TotalDebit>
      <TotalCredit>${invoices.reduce((sum, inv) => sum + Number(inv.total), 0).toFixed(2)}</TotalCredit>
      ${invoices.map(inv => `
      <Invoice>
        <InvoiceNo>${inv.reference}</InvoiceNo>
        <atcud>${inv.atcud || '0'}</atcud>
        <Hash>${inv.hash}</Hash>
        <HashControl>1</HashControl>
        <Period>${new Date(inv.certDate!).getMonth() + 1}</Period>
        <InvoiceDate>${inv.createdAt.toISOString().split('T')[0]}</InvoiceDate>
        <InvoiceType>FT</InvoiceType>
        <SourceID>${inv.tenantId}</SourceID>
        <SystemEntryDate>${inv.certDate?.toISOString().split('.')[0]}</SystemEntryDate>
        <InvoiceStatus>N</InvoiceStatus>
        <CustomerID>${inv.clientId}</CustomerID>
        <Line>
          <LineNumber>1</LineNumber>
          <ProductCode>SERV</ProductCode>
          <ProductDescription>Serviços Jurídicos</ProductDescription>
          <Quantity>1</Quantity>
          <UnitPrice>${Number(inv.amount).toFixed(2)}</UnitPrice>
          <CreditAmount>${Number(inv.amount).toFixed(2)}</CreditAmount>
          <Tax>
            <TaxType>IVA</TaxType>
            <TaxCountryRegion>PT</TaxCountryRegion>
            <TaxCode>NOR</TaxCode>
            <TaxPercentage>${inv.vatRate}</TaxPercentage>
          </Tax>
        </Line>
        <DocumentTotals>
          <TaxPayable>${(Number(inv.total) - Number(inv.amount)).toFixed(2)}</TaxPayable>
          <NetTotal>${Number(inv.amount).toFixed(2)}</NetTotal>
          <GrossTotal>${Number(inv.total).toFixed(2)}</GrossTotal>
        </DocumentTotals>
      </Invoice>`).join('')}
    </SalesInvoices>
  </SourceDocuments>
</AuditFile>`;

    return {
      xml,
      filename: `SAF-T_PT_${startDate}_${endDate}.xml`,
    };
  }

  private generateReference(sequence: number) {
    // Deprecated for certified invoices, but kept for drafts
    const date = new Date();
    const datePart = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(
      date.getDate(),
    ).padStart(2, '0')}`;
    const seqPart = String(sequence).padStart(4, '0');
    return `DRAFT-${datePart}-${seqPart}`;
  }

  private roundMoney(value: number) {
    return Math.round((value + Number.EPSILON) * 100) / 100;
  }
}
