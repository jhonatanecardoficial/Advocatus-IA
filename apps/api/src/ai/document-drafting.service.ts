import { Injectable } from '@nestjs/common';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DocumentDraftingService {
  constructor(
    private readonly aiService: AiService,
    private readonly prisma: PrismaService,
  ) {}

  async generateDraft(tenantId: string, matterId: string, type: string): Promise<string> {
    const matter = await this.prisma.matter.findFirst({
      where: { id: matterId, tenantId },
      include: {
        client: true,
      },
    });

    if (!matter) throw new Error('Processo não encontrado');

    const context = `
      PROCESSO: ${matter.title}
      NÚMERO: ${matter.id}
      CLIENTE: ${matter.client.name} (${matter.client.type})
      TIPO DE PROCESSO: ${matter.type}
      FACTOS RELEVANTES: ${matter.description || 'Consulta de rotina'}
    `;

    const prompt = `
      Gera um rascunho de um documento jurídico do tipo "${type}".
      
      REQUISITOS:
      1. Linguagem formal e jurídica de Portugal.
      2. Incluir placeholders para [Data], [Localidade] e [Assinatura].
      3. Basear o rascunho no contexto do processo fornecido abaixo.
      4. Se for uma Notificação, focar no cumprimento de prazos ou interpelação.
      5. Se for uma Petição, estruturar com "Exmo. Senhor Juiz", "Factos" e "Direito".

      CONTEXTO DO PROCESSO:
      ${context}
    `;

    return this.aiService.chatWithContext(prompt, "Criação de Peças Jurídicas");
  }
}
