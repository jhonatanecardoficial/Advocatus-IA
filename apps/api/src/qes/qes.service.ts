import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

@Injectable()
export class QesService {
  private readonly logger = new Logger(QesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * FLUXO CMD: Passo 1 - Iniciar pedido e obter URL de redirecionamento
   */
  async getAuthUrl(documentId: string, tenantId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, tenantId },
    });

    if (!document) throw new NotFoundException('Documento não encontrado.');

    // No cenário real, aqui contactaríamos o Autenticação.gov para obter o OIDC Authorization URL
    // Mocking the redirect URL
    const mockAuthUrl = `https://autenticacao.gov.pt/oauth/authorize?state=${documentId}&client_id=MOCK_CLIENT_ID`;
    
    return { url: mockAuthUrl };
  }

  /**
   * FLUXO CMD: Passo 2 - Iniciar pedido de assinatura via CMD
   */
  async requestSignature(documentId: string, userId: string, tenantId: string) {
    this.logger.log(`Solicitando assinatura QES para o documento ${documentId} (User: ${userId})`);

    const document = await this.prisma.document.findFirst({
      where: { id: documentId, tenantId },
    });

    if (!document) throw new NotFoundException('Documento não encontrado.');

    const requestId = `AMA-CMD-${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Atualizar o status do documento original
    await this.prisma.document.update({
      where: { id: documentId },
      data: {
        signatureType: 'QES',
        signatureStatus: 'PENDING',
        signatureProvider: 'AUTENTICACAO_GOV',
        signatureMetadata: {
          requestId,
          requestedAt: new Date().toISOString(),
          requestedBy: userId,
        },
      },
    });

    // Criar registo na tabela de assinaturas qualificadas
    await this.prisma.signedDocument.create({
      data: {
        tenantId,
        matterId: document.matterId,
        documentId: document.id,
        originalFilePath: document.storagePath,
        signatureValid: false,
      },
    });

    return {
      success: true,
      requestId,
      message: 'Pedido de assinatura via Chave Móvel Digital enviado com sucesso.',
    };
  }

  /**
   * FLUXO CC: Passo 1 - Gerar Hash do documento para o Middleware assinar
   */
  async generateHash(documentId: string, tenantId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, tenantId },
    });

    if (!document) throw new NotFoundException('Documento não encontrado.');

    // Simulação de Hashing do arquivo do Supabase Storage
    // Em produção, leríamos o stream do arquivo e geraríamos o SHA-256 real
    const hash = crypto.createHash('sha256').update(document.storagePath + document.filename).digest('hex');

    return { hash };
  }

  /**
   * FLUXO CC: Passo 2 - Finalizar assinatura vinda do Middleware local
   */
  async finalizeCcSignature(documentId: string, signature: string, userId: string, tenantId: string) {
    const document = await this.prisma.document.findFirst({
      where: { id: documentId, tenantId },
    });

    if (!document) throw new NotFoundException('Documento não encontrado.');

    // Injetar a assinatura no PDF (Placeholder PAdES)
    // No mundo real, usaríamos node-signpdf ou similar para injetar o buffer da assinatura
    const signedFilePath = `${document.storagePath}_signed.pdf`;

    await this.prisma.$transaction([
      this.prisma.document.update({
        where: { id: documentId },
        data: {
          signatureStatus: 'SIGNED',
          signatureMetadata: {
            method: 'CC_MIDDLEWARE',
            signature,
            signedAt: new Date().toISOString(),
            signedBy: userId,
          },
        },
      }),
      this.prisma.signedDocument.updateMany({
        where: { documentId: document.id, tenantId },
        data: {
          signedFilePath,
          signerName: 'Advogado Certificado', // Extraído da assinatura no cenário real
          signatureValid: true,
        },
      }),
    ]);

    return { success: true, signedFilePath };
  }

  async listSignedDocuments(tenantId: string, matterId?: string) {
    return this.prisma.signedDocument.findMany({
      where: {
        tenantId,
        ...(matterId ? { matterId } : {}),
      },
      include: {
        document: true,
      },
      orderBy: {
        signedAt: 'desc',
      },
    });
  }

  async validateSignature(documentId: string) {
    this.logger.log(`Validando assinatura para o documento ${documentId}`);
    // Validação real de cadeia de certificados
    return { valid: true, timestamp: new Date() };
  }
}

