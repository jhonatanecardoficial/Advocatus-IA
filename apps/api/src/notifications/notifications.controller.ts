import { Body, Controller, HttpCode, HttpStatus, Post, UseGuards, UsePipes } from '@nestjs/common';
import { z } from 'zod';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { RequestUser } from '../auth/strategies/jwt.strategy';
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe';
import { DeadlineRunSummary, NotificationsService } from './notifications.service';

const TestNotificationSchema = z.object({
  task_id: z.string().cuid(),
});

@Controller('notifications/deadlines')
@UseGuards(JwtAuthGuard, RolesGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post('run')
  @Roles('ADMIN', 'SOCIO', 'SECRETARIA', 'ADVOGADO')
  @HttpCode(HttpStatus.OK)
  run(@CurrentUser() user: RequestUser): Promise<DeadlineRunSummary> {
    return this.notificationsService.runDeadlineSweep(user.tenantId);
  }

  @Post('test')
  @Roles('ADMIN', 'SOCIO', 'SECRETARIA', 'ADVOGADO')
  @HttpCode(HttpStatus.OK)
  @UsePipes(new ZodValidationPipe(TestNotificationSchema))
  sendTest(@CurrentUser() user: RequestUser, @Body() body: { task_id: string }) {
    return this.notificationsService.sendTestNotification(user.tenantId, body.task_id);
  }
}
