import { Controller, Get, Param, UseGuards } from '@nestjs/common'
import { TenantsService } from './tenants.service'
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard'
import { RolesGuard } from '../auth/guards/roles.guard'
import { Roles } from '../auth/decorators/roles.decorator'
import { CurrentUser } from '../auth/decorators/current-user.decorator'
import { RequestUser } from '../auth/strategies/jwt.strategy'

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
