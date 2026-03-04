import { Controller, Get, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { CurrentUser } from './decorators/current-user.decorator'
import { RequestUser } from './strategies/jwt.strategy'

@Controller('auth')
export class AuthController {
    constructor() { }

    /**
     * GET /api/v1/auth/me
     * Retorna o perfil do utilizador autenticado
     */
    @Get('me')
    @UseGuards(JwtAuthGuard)
    @HttpCode(HttpStatus.OK)
    async getProfile(@CurrentUser() user: RequestUser) {
        return {
            data: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                tenantId: user.tenantId,
                mfaEnabled: user.mfaEnabled,
            },
        }
    }

    /**
     * GET /api/v1/auth/health
     * Endpoint de verificação de saúde — sem autenticação
     */
    @Get('health')
    @HttpCode(HttpStatus.OK)
    health() {
        return { status: 'ok', timestamp: new Date().toISOString() }
    }
}
