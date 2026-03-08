import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
  UsePipes,
} from '@nestjs/common';
import { InvoiceStatus } from '@prisma/client';
import { z } from 'zod';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequestUser } from '../auth/strategies/jwt.strategy';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { BillingService, CreateInvoiceDraftDto } from './billing.service';

const CreateInvoiceDraftSchema = z.object({
  matter_id: z.string().cuid(),
  vat_rate: z.number().min(0).max(100).optional(),
  due_date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  notes: z.string().max(2000).optional(),
});

const InvoiceQuerySchema = z.object({
  matter_id: z.string().cuid().optional(),
  client_id: z.string().cuid().optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
});

@Controller('invoices')
@UseGuards(JwtAuthGuard, RolesGuard)
export class BillingController {
  constructor(private readonly billingService: BillingService) {}

  @Post('draft')
  @Roles('ADVOGADO', 'SECRETARIA', 'SOCIO', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateInvoiceDraftSchema))
  createDraft(@CurrentUser() user: RequestUser, @Body() dto: CreateInvoiceDraftDto) {
    return this.billingService.createDraft(user.tenantId, dto);
  }

  @Get()
  @Roles('ADVOGADO', 'SECRETARIA', 'SOCIO', 'ADMIN')
  @UsePipes(new ZodValidationPipe(InvoiceQuerySchema))
  list(@CurrentUser() user: RequestUser, @Query() query: { matter_id?: string; client_id?: string; status?: InvoiceStatus }) {
    return this.billingService.list(user.tenantId, query);
  }

  @Get(':id')
  @Roles('ADVOGADO', 'SECRETARIA', 'SOCIO', 'ADMIN')
  findOne(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.billingService.findOne(user.tenantId, id);
  }

  @Get(':id/pdf')
  @Roles('ADVOGADO', 'SECRETARIA', 'SOCIO', 'ADMIN')
  getDraftPdf(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.billingService.getDraftPdf(user.tenantId, id);
  }
}
