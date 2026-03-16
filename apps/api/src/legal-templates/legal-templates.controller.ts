import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { LegalTemplatesService } from './legal-templates.service';
import { CreateLegalTemplateDto, UpdateLegalTemplateDto, GenerateFromTemplateDto, SaveToMatterDto, DownloadPdfDto } from './dto/legal-template.dto';
import { Response } from 'express';
import { Res } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

interface RequestWithUser extends Request {
  user: {
    id: string;
    tenantId: string;
  };
}

@Controller('legal-templates')
@UseGuards(JwtAuthGuard)
export class LegalTemplatesController {
  constructor(private readonly legalTemplatesService: LegalTemplatesService) {}

  @Post()
  create(@Request() req: RequestWithUser, @Body() createLegalTemplateDto: CreateLegalTemplateDto) {
    return this.legalTemplatesService.create(req.user.tenantId, createLegalTemplateDto);
  }

  @Get()
  findAll(@Request() req: RequestWithUser) {
    return this.legalTemplatesService.findAll(req.user.tenantId);
  }

  @Get(':id')
  findOne(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.legalTemplatesService.findOne(req.user.tenantId, id);
  }

  @Patch(':id')
  update(@Request() req: RequestWithUser, @Param('id') id: string, @Body() updateLegalTemplateDto: UpdateLegalTemplateDto) {
    return this.legalTemplatesService.update(req.user.tenantId, id, updateLegalTemplateDto);
  }

  @Delete(':id')
  remove(@Request() req: RequestWithUser, @Param('id') id: string) {
    return this.legalTemplatesService.remove(req.user.tenantId, id);
  }

  @Post('generate')
  generate(@Request() req: RequestWithUser, @Body() generateDto: GenerateFromTemplateDto) {
    return this.legalTemplatesService.generateDocument(req.user.tenantId, generateDto);
  }

  @Post('refine')
  refine(
    @Request() req: RequestWithUser,
    @Body('content') content: string,
    @Body('instruction') instruction: string,
  ) {
    return this.legalTemplatesService.refineDocument(req.user.tenantId, content, instruction);
  }

  @Post('save-to-matter')
  async saveToMatter(
    @Request() req: RequestWithUser,
    @Body() dto: SaveToMatterDto
  ) {
    return this.legalTemplatesService.saveToMatter(req.user.tenantId, req.user.id, dto);
  }

  @Post('download-pdf')
  async downloadPdf(
    @Body() dto: DownloadPdfDto,
    @Res() res: Response
  ) {
    const buffer = await this.legalTemplatesService.generatePdfBuffer(dto.content);
    
    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=${dto.filename}.pdf`,
      'Content-Length': buffer.length,
    });

    res.end(buffer);
  }
}
