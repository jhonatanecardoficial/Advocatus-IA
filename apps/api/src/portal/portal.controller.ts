import { Controller, Post, Get, Param, UseGuards, Delete, Body, BadRequestException } from '@nestjs/common';
import { PortalService } from './portal.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequestUser } from '../auth/strategies/jwt.strategy';

@Controller('portal')
export class PortalController {
  constructor(private readonly portalService: PortalService) {}

  // 1. Geração de Link (Protegido - Apenas Advogados/Sócios/Admins)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADVOGADO', 'SOCIO', 'ADMIN')
  @Post('matters/:matterId/generate')
  async generateLink(@Param('matterId') matterId: string, @CurrentUser() user: RequestUser) {
    return this.portalService.generatePortalLink(matterId, user.tenantId, user.id);
  }

  // 2. Revogação de acesso (Protegido)
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADVOGADO', 'SOCIO', 'ADMIN')
  @Delete(':tokenId/revoke')
  async revokeAccess(@Param('tokenId') tokenId: string, @CurrentUser() user: RequestUser) {
    return this.portalService.revokeAccess(tokenId, user.tenantId);
  }

  // 3. Acesso Público pelo Cliente (Validado pelo Token Exato)
  // Sem JwtAuthGuard porque é acedido externamente pelo cliente.
  @Get('access/:token')
  async getPortalData(@Param('token') token: string) {
    return this.portalService.getPortalData(token);
  }

  // 4. Envio de Mensagem pelo Cliente Pelo Portal
  @Post('access/:token/messages')
  async sendMessage(
    @Param('token') token: string,
    @Body('contentEncrypted') contentEncrypted: string,
  ) {
    if (!contentEncrypted) {
      throw new BadRequestException('O conteúdo da mensagem é obrigatório.');
    }
    return this.portalService.sendMessage(token, contentEncrypted);
  }
}
