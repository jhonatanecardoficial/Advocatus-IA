import { Controller, Post, Body, Get, Query, UseGuards, Request } from '@nestjs/common';
import { QesService } from './qes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('qes')
@UseGuards(JwtAuthGuard)
export class QesController {
  constructor(private readonly qesService: QesService) {}

  @Get('auth-url')
  async getAuthUrl(@Request() req: any, @Query('documentId') documentId: string) {
    return this.qesService.getAuthUrl(documentId, req.user.tenantId);
  }

  @Post('request')
  async requestSignature(
    @Request() req: any,
    @Body() body: { documentId: string }
  ) {
    return this.qesService.requestSignature(
      body.documentId,
      req.user.id,
      req.user.tenantId
    );
  }

  @Post('cc/hash')
  async generateHash(
    @Request() req: any,
    @Body() body: { documentId: string }
  ) {
    return this.qesService.generateHash(body.documentId, req.user.tenantId);
  }

  @Post('cc/finalize')
  async finalizeCcSignature(
    @Request() req: any,
    @Body() body: { documentId: string; signature: string }
  ) {
    return this.qesService.finalizeCcSignature(
      body.documentId,
      body.signature,
      req.user.id,
      req.user.tenantId
    );
  }

  @Get('signed')
  async listSigned(
    @Request() req: any,
    @Query('matterId') matterId?: string
  ) {
    return this.qesService.listSignedDocuments(req.user.tenantId, matterId);
  }
}

