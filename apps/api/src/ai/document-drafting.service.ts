import { Injectable } from '@nestjs/common';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { DocumentsService } from '../documents/documents.service';

@Injectable()
export class DocumentDraftingService {
  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
    private readonly documentsService: DocumentsService,
  ) {}

  async generateDraft(tenantId: string, matterId: string, type: string): Promise<string> {
    const matter = await this.prisma.matter.findFirst({
      where: { id: matterId, tenantId },
      include: {
        client: true,
      },
    });

    if (!matter) throw new Error('Processo não encontrado');

    // 1. Buscar Contexto Legal via RAG (Baseado no tipo e descrição do processo)
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

  async saveDraft(tenantId: string, userId: string, matterId: string, filename: string, htmlContent: string) {
    // 1. Upload do rascunho para o Storage
    const { storagePath, size } = await this.documentsService.uploadAiDraft(tenantId, matterId, filename, htmlContent);

    // 2. Criar registo na base de dados
    return this.prisma.document.create({
      data: {
        tenantId,
        matterId,
        uploadedById: userId,
        filename: filename.endsWith('.html') ? filename : `${filename}.html`,
        mimeType: 'text/html',
        sizeBytes: size,
        storagePath: storagePath,
        version: 1,
        signatureType: 'NONE',
      },
    });
  }
}
