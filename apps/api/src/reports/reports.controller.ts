import { Controller, Get, UseGuards } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequestUser } from '../auth/strategies/jwt.strategy';

@Controller('reports')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard-metrics')
  async getMetrics(@CurrentUser() user: RequestUser) {
    return {
      data: await this.reportsService.getDashboardMetrics(user.tenantId),
    };
  }

  @Get('profitability')
  @Roles('SOCIO', 'ADMIN')
  async getProfitability(@CurrentUser() user: RequestUser) {
    return {
      data: await this.reportsService.getProfitabilityReport(user.tenantId),
    };
  }
}
