import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  UsePipes,
} from '@nestjs/common';
import { z } from 'zod';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { TimeEntriesService, CreateTimeEntryDto, UpdateTimeEntryDto } from './time-entries.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequestUser } from '../auth/strategies/jwt.strategy';

const CreateTimeEntrySchema = z.object({
  matter_id: z.string().cuid(),
  description: z.string().min(1).max(500),
  hours: z.number().min(0.25).max(24),
  rate_per_hour: z.number().optional(),
  billable: z.boolean().optional(),
  activity_date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)),
});

const UpdateTimeEntrySchema = z.object({
  description: z.string().min(1).max(500).optional(),
  hours: z.number().min(0.25).max(24).optional(),
  rate_per_hour: z.number().optional(),
  billable: z.boolean().optional(),
  activity_date: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
});

@Controller('time-entries')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TimeEntriesController {
  constructor(private readonly timeEntriesService: TimeEntriesService) {}

  @Post()
  @Roles('ADVOGADO', 'SECRETARIA', 'SOCIO', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  @UsePipes(new ZodValidationPipe(CreateTimeEntrySchema))
  create(@CurrentUser() user: RequestUser, @Body() dto: CreateTimeEntryDto) {
    return this.timeEntriesService.create(user.tenantId, user.sub, dto);
  }

  @Get('matter/:matterId')
  @Roles('ADVOGADO', 'SECRETARIA', 'SOCIO', 'ADMIN')
  findByMatter(@CurrentUser() user: RequestUser, @Param('matterId') matterId: string) {
    return this.timeEntriesService.findByMatter(user.tenantId, matterId);
  }

  @Get('matter/:matterId/summary')
  @Roles('ADVOGADO', 'SECRETARIA', 'SOCIO', 'ADMIN')
  getSummaryByMatter(@CurrentUser() user: RequestUser, @Param('matterId') matterId: string) {
    return this.timeEntriesService.getTotalHoursByMatter(user.tenantId, matterId);
  }

  @Get(':id')
  @Roles('ADVOGADO', 'SECRETARIA', 'SOCIO', 'ADMIN')
  findOne(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.timeEntriesService.findOne(user.tenantId, id);
  }

  @Put(':id')
  @Roles('ADVOGADO', 'SECRETARIA', 'SOCIO', 'ADMIN')
  @UsePipes(new ZodValidationPipe(UpdateTimeEntrySchema))
  update(
    @CurrentUser() user: RequestUser,
    @Param('id') id: string,
    @Body() dto: UpdateTimeEntryDto,
  ) {
    return this.timeEntriesService.update(user.tenantId, id, dto);
  }

  @Delete(':id')
  @Roles('ADVOGADO', 'SECRETARIA', 'SOCIO', 'ADMIN')
  delete(@CurrentUser() user: RequestUser, @Param('id') id: string) {
    return this.timeEntriesService.delete(user.tenantId, id);
  }
}
