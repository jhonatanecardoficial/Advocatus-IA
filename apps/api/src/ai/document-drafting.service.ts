import { Injectable } from '@nestjs/common';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentsService } from '../documents/documents.service';
const PDFDocument = require('pdfkit');

@Injectable()
export class DocumentDraftingService {
  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
    private readonly documentsService: DocumentsService,
  ) {}

  // ---------------------------------------------------------------
  // GERAÇÃO DE RASCUNHO — lógica original, não alterada
  // ---------------------------------------------------------------
  async generateDraft(tenantId: string, matterId: string, type: string): Promise<string> {
    const matter = await this.prisma.matter.findFirst({
      where: { id: matterId, tenantId },
      include: { client: true },
    });

    if (!matter) throw new Error('Processo não encontrado');

    // 1. Buscar Contexto Legal via RAG
    const searchQuery = `${type} para ${matter.type} em Portugal. ${matter.description || ''}`;
    const ragResults = await this.aiService.searchLegalDocuments(searchQuery, 3);

    const legalContext = ragResults.results
      .map(r => `[${r.title}]: ${r.content}`)
      .join('\n\n');

    // 2. Montar Contexto do Processo
    const matterContext = `
      PROCESSO: ${matter.title}
      CLIENTE: ${matter.client.name}
      TIPO: ${matter.type}
      DESCRIÇÃO: ${matter.description || 'N/A'}
    `;

    const finalContext = `
      CONTEXTO DO PROCESSO:
      ${matterContext}
      
      REFERÊNCIAS LEGAIS ENCONTRADAS:
      ${legalContext}
    `;

    // 3. Gerar Rascunho Profissional
    return this.aiService.generateDraft(type, finalContext);
  }

  // ---------------------------------------------------------------
  // REFINAMENTO — lógica original, não alterada
  // ---------------------------------------------------------------
  async refineDraft(tenantId: string, matterId: string, currentContent: string, instruction: string): Promise<string> {
    const matter = await this.prisma.matter.findFirst({
      where: { id: matterId, tenantId },
      include: { client: true },
    });

    if (!matter) throw new Error('Processo não encontrado');

    // Buscar contexto adicional baseado na instrução de refinamento
    const ragResults = await this.aiService.searchLegalDocuments(instruction, 2);
    const legalContext = ragResults.results.map(r => `[${r.title}]: ${r.content}`).join('\n\n');

    return this.aiService.refineDraft(currentContent, instruction, legalContext);
  }

  // ---------------------------------------------------------------
  // GUARDAR RASCUNHO — ALTERADO: agora gera PDF real (em vez de HTML)
  // ---------------------------------------------------------------
  async saveDraft(tenantId: string, userId: string, matterId: string, filename: string, htmlContent: string) {
    // 1. Identificar partes do processo para o cabeçalho do PDF
    const matter = await this.prisma.matter.findFirst({
      where: { id: matterId, tenantId },
      include: { client: true },
    });

    if (!matter) throw new Error('Processo não encontrado');

    const parties = {
      autor: matter.client?.name || '[AUTOR]',
      reu: matter.opposingParty || '[RÉU]',
      processo: matter.courtReference || '[REFERÊNCIA_JUDICIAL]',
      tribunal: 'Tribunal Judicial competente de Portugal',
    };

    // 2. Converter HTML → PDF binário via PDFKit
    const pdfBuffer = await this.renderLegalPdf(htmlContent, parties);

    // 3. Upload do binário para o Storage
    const pdfFilename = filename.toLowerCase().endsWith('.pdf') ? filename : `${filename}.pdf`;
    const { storagePath, size } = await this.documentsService.uploadAiDraft(
      tenantId,
      matterId,
      pdfFilename,
      pdfBuffer,
      'application/pdf',
    );

    // 4. Criar registo na base de dados
    return this.prisma.document.create({
      data: {
        tenantId,
        matterId,
        uploadedById: userId,
        filename: pdfFilename,
        mimeType: 'application/pdf',
        sizeBytes: size,
        storagePath: storagePath,
        version: 1,
        signatureType: 'NONE',
        tags: ['AI_GENERATED'],
      },
    });
  }

  // ---------------------------------------------------------------
  // RENDERIZAÇÃO PDF — formatação jurídica profissional
  // ---------------------------------------------------------------
  private renderLegalPdf(html: string, context: { autor: string; reu: string; processo: string; tribunal: string }): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: { top: 72, bottom: 72, left: 72, right: 72 },
        });

        const chunks: Buffer[] = [];
        doc.on('data', (chunk: Buffer) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', (err: Error) => reject(err));

        doc.font('Times-Roman');

        // Cabeçalho: Tribunal e Referência
        doc.fontSize(10).text(context.tribunal.toUpperCase(), { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(10).text(`Proc. N.º: ${context.processo}`, { align: 'center' });
        doc.moveDown(2);

        // Identificação das Partes
        doc.fontSize(11).font('Times-Bold').text(context.autor.toUpperCase(), { align: 'left' });
        doc.font('Times-Roman').fontSize(9).text('(Autor/Requerente)', { align: 'left' });
        doc.moveDown(0.5);
        doc.fontSize(10).text('contra', { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(11).font('Times-Bold').text(context.reu.toUpperCase(), { align: 'right' });
        doc.font('Times-Roman').fontSize(9).text('(Réu/Requerido)', { align: 'right' });
        doc.moveDown(2);

        // Linha separadora
        doc
          .moveTo(72, doc.y)
          .lineTo(doc.page.width - 72, doc.y)
          .strokeColor('#cccccc')
          .stroke();
        doc.moveDown(1.5);

        // Corpo do documento — convertendo HTML para texto limpo
        const cleanText = (html || '')
          .replace(/<br\s*\/?>/gi, '\n')
          .replace(/<\/p>/gi, '\n\n')
          .replace(/<\/div>/gi, '\n')
          .replace(/<\/h[1-6]>/gi, '\n\n')
          .replace(/<[^>]*>/g, '')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/&quot;/g, '"')
          .replace(/\n{3,}/g, '\n\n')
          .trim();

        doc.font('Times-Roman').fontSize(12).text(cleanText, {
          align: 'justify',
          lineGap: 4,
          paragraphGap: 10,
        });

        // Fecho: Pede Deferimento
        doc.moveDown(3);
        doc.fontSize(12).text('Pede Deferimento,', { align: 'right' });
        doc.moveDown(4);
        doc.fontSize(11).text('_________________________________________', { align: 'center' });
        doc.moveDown(0.3);
        doc.fontSize(9).text('(Advogado/a — Nº Ordem: ________)', { align: 'center' });

        doc.end();
      } catch (err) {
        reject(err);
      }
    });
  }
}
