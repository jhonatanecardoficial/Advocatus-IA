import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { randomBytes } from 'crypto';

@Injectable()
export class PortalService {
  constructor(private readonly prisma: PrismaService) {}

  async generatePortalLink(matterId: string, tenantId: string, userId: string) {
    const matter = await this.prisma.matter.findFirst({
      where: { id: matterId, tenantId },
    });

    if (!matter) {
      throw new NotFoundException('Processo não encontrado ou sem acesso.');
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days default

    const portalAccess = await this.prisma.portalAccess.create({
      data: {
        token,
        matterId,
        tenantId,
        createdBy: userId,
        expiresAt,
        isActive: true,
      },
    });

    return {
      token: portalAccess.token,
      expiresAt: portalAccess.expiresAt,
      url: `/portal/${portalAccess.token}`,
    };
  }

  async getPortalData(token: string) {
    const access = await this.prisma.portalAccess.findUnique({
      where: { token },
      include: {
        matter: {
          include: {
            client: { select: { name: true, type: true } },
            documents: {
              where: { isSharedWithClient: true },
              select: { id: true, filename: true, sizeBytes: true, createdAt: true, mimeType: true },
            },
            messages: {
              select: { 
                id: true, 
                contentEncrypted: true, 
                createdAt: true, 
                isFromClient: true, 
                sender: { select: { name: true, role: true } } 
              },
              orderBy: { createdAt: 'asc' }
            }
          },
        },
        tenant: {
          select: { name: true, logoUrl: true },
        },
      },
    });

    if (!access || !access.isActive) {
      throw new ForbiddenException('Link de portal inválido ou revogado.');
    }

    if (access.expiresAt < new Date()) {
      throw new ForbiddenException('Este link de portal expirou.');
    }

    return {
      tenant: access.tenant,
      matter: {
        id: access.matter.id,
        title: access.matter.title,
        status: access.matter.status,
        type: access.matter.type,
        courtReference: access.matter.courtReference,
        clientName: access.matter.client.name,
        documents: access.matter.documents,
        messages: access.matter.messages,
      },
      expiresAt: access.expiresAt,
    };
  }

  async revokeAccess(tokenId: string, tenantId: string) {
    const access = await this.prisma.portalAccess.findUnique({
      where: { id: tokenId },
    });

    if (!access || access.tenantId !== tenantId) {
      throw new NotFoundException('Acesso não encontrado.');
    }

    return this.prisma.portalAccess.update({
      where: { id: tokenId },
      data: { isActive: false },
    });
  }

  async sendMessage(token: string, contentEncrypted: string) {
    const access = await this.prisma.portalAccess.findUnique({
      where: { token },
      include: { matter: true },
    });

    if (!access || !access.isActive || access.expiresAt < new Date()) {
      throw new ForbiddenException('Acesso inválido ou expirado.');
    }

    return this.prisma.message.create({
      data: {
        matterId: access.matterId,
        tenantId: access.tenantId,
        contentEncrypted,
        isFromClient: true,
      },
    });
  }
}
