import { Controller, Get, Param, Patch, Body, UseGuards, UsePipes } from '@nestjs/common'
import { TenantsService } from './tenants.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { RequestUser } from '../auth/strategies/jwt.strategy'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { UpdateTenantSchema, UpdateTenantDto } from './dto/tenant.dto'

@Controller('tenants')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TenantsController {
    constructor(private readonly tenantsService: TenantsService) { }

    /**
     * GET /api/v1/tenants/me
     * Retorna o escritório do utilizador autenticado
     */
    @Get('me')
    async getMyTenant(@CurrentUser() user: RequestUser) {
        return {
            data: await this.tenantsService.findById(user.tenantId),
        }
    }

    /**
     * PATCH /api/v1/tenants/me
     * Atualiza dados do escritório — só SOCIO ou ADMIN
     */
    @Patch('me')
    @Roles('SOCIO', 'ADMIN')
    @UsePipes(new ZodValidationPipe(UpdateTenantSchema))
    async updateMyTenant(
        @CurrentUser() user: RequestUser,
        @Body() dto: UpdateTenantDto,
    ) {
        return {
            data: await this.tenantsService.update(user.tenantId, dto),
        }
    }

    /**
     * GET /api/v1/tenants/:slug
     * Retorna um escritório pelo slug — só ADMIN global
     */
    @Get(':slug')
    @Roles('ADMIN')
    async findBySlug(@Param('slug') slug: string) {
        return {
            data: await this.tenantsService.findBySlug(slug),
        }
    }
}
