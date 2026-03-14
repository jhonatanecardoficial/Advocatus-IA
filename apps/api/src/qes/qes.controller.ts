import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { QesService } from './qes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('qes')
@UseGuards(JwtAuthGuard)
export class QesController {
  constructor(private readonly qesService: QesService) {}

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
}
