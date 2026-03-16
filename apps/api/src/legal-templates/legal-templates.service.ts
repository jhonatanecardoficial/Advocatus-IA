import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { DocumentsService } from '../documents/documents.service';
import { CreateLegalTemplateDto, UpdateLegalTemplateDto, GenerateFromTemplateDto, SaveToMatterDto } from './dto/legal-template.dto';
import PDFDocument from 'pdfkit';

@Injectable()
export class LegalTemplatesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly documentsService: DocumentsService,
  ) {}

  async create(tenantId: string, dto: CreateLegalTemplateDto) {
    return this.prisma.legalTemplate.create({
      data: {
        ...dto,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.legalTemplate.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(tenantId: string, id: string) {
    const template = await this.prisma.legalTemplate.findFirst({
      where: { id, tenantId },
    });

    if (!template) {
      throw new NotFoundException('Template não encontrado.');
    }

    return template;
  }

  async update(tenantId: string, id: string, dto: UpdateLegalTemplateDto) {
    await this.findOne(tenantId, id);

    return this.prisma.legalTemplate.update({
      where: { id },
      data: dto,
    });
  }

  async remove(tenantId: string, id: string) {
    await this.findOne(tenantId, id);
    await this.prisma.legalTemplate.delete({ where: { id } });
    return { message: 'Template removido com sucesso.' };
  }

  async generateDocument(tenantId: string, dto: GenerateFromTemplateDto) {
    const template = await this.findOne(tenantId, dto.templateId);
    
    const matter = await this.prisma.matter.findFirst({
      where: { id: dto.matterId, tenantId },
      include: {
        client: true,
      },
    });

    if (!matter) {
      throw new NotFoundException('Processo não encontrado.');
    }

    let generatedContent = template.content;

    // Mapeamento de variáveis básicas
    const variables: Record<string, string> = {
      '{{client_name}}': matter.client?.name || '',
      '{{client_nif}}': (matter.client as any)?.nif || '', // Usando any pois nif pode não estar no tipo básico mas estar no DB
      '{{court_reference}}': matter.courtReference || '',
      '{{citius_reference}}': matter.citiusReference || '',
      '{{opposing_party}}': matter.opposingParty || '',
      '{{matter_title}}': matter.title || '',
      '{{date_today}}': new Date().toLocaleDateString('pt-PT'),
      ...(dto.customVariables || {}),
    };

    // Substituição das variáveis no conteúdo
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
      generatedContent = generatedContent.replace(regex, value);
    }

    return {
      templateId: template.id,
      matterId: matter.id,
      title: `${template.name} - ${matter.title}`,
      content: generatedContent,
      variablesUsed: Object.keys(variables).filter(v => template.content.includes(v)),
    };
  }

  async refineDocument(_tenantId: string, content: string, instruction: string) {
    const prompt = `
      És um assistente jurídico especializado em Portugal.
      Refina o seguinte documento jurídico com base na instrução: "${instruction}".

      REGRAS:
      1. Mantém o rigor jurídico e o Português de Portugal.
      2. Altera apenas o necessário para cumprir a instrução.
      3. Mantém placeholders como {{client_name}} se existirem.

      DOCUMENTO ORIGINAL:
      ${content}

      DOCUMENTO REFINADO (apenas o texto do documento):
    `;

    const refinedContent = await this.aiService.chatWithContext(prompt, 'Refinamento de Templates Jurídicos');
    
    return {
      originalContent: content,
      refinedContent: refinedContent.trim(),
      instruction,
    };
  }

  async generatePdfBuffer(content: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: 'A4' });
      const buffers: Buffer[] = [];

      doc.on('data', (chunk) => buffers.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(buffers)));
      doc.on('error', (err) => reject(err));

      // Estilo simples para documentos jurídicos
      doc.font('Helvetica-Bold').fontSize(16).text('DOCUMENTO JURÍDICO', { align: 'center' });
      doc.moveDown();
      doc.font('Helvetica').fontSize(11).text(content, {
        align: 'justify',
        lineGap: 2,
      });

      doc.end();
    });
  }

  async saveToMatter(tenantId: string, userId: string, dto: SaveToMatterDto) {
    const pdfBuffer = await this.generatePdfBuffer(dto.content);
    
    // Simular o comportamento do upload padrão
    const timestamp = Date.now();
    const safeFilename = dto.filename.toLowerCase().endsWith('.pdf') 
      ? dto.filename.replace(/[^a-zA-Z0-9.-]/g, '_') 
      : `${dto.filename.replace(/[^a-zA-Z0-9.-]/g, '_')}.pdf`;
    
    const storagePath = `${tenantId}/${dto.matterId}/${timestamp}_${safeFilename}`;

    // Upload direto para o Supabase (DocumentsService tem o client mas não expõe upload direto, vamos usar o prisma meta)
    // Precisamos aceder ao cliente supabase do DocumentsService ou expor um método lá.
    // Como o DocumentsService é um provider privado, vamos assumir que ele expõe o que precisamos ou usar o Prisma.
    
    // Melhor abordagem: Adicionar um método `uploadFromBuffer` no DocumentsService se necessário, 
    // ou usar as ferramentas que temos.
    
    // Para simplificar e manter a arquitetura, vamos usar o service de documentos.
    // Mas o DocumentsService atual só gera URLs de upload. Vamos precisar de um novo método lá ou implementar aqui.
    
    // Implementarei o upload aqui usando a store privada se necessário, mas vou tentar injetar se possível.
    const { error } = await (this.documentsService as any).supabase.storage
      .from((this.documentsService as any).storageBucket)
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
      });

    if (error) throw new Error(`Falha no upload para o Storage: ${error.message}`);

    return this.documentsService.confirmUpload(tenantId, userId, {
      matterId: dto.matterId,
      filename: safeFilename,
      storagePath,
      mimeType: 'application/pdf',
      sizeBytes: pdfBuffer.length,
    });
  }
}
