import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'
import { JwtPayload } from '../interfaces/auth.interface'

/**
 * Guard de autenticação JWT — requer Bearer token válido.
 * Usar em conjunto com RolesGuard para RBAC completo.
 *
 * @example
 * @UseGuards(JwtAuthGuard, RolesGuard)
 * @Roles('ADVOGADO', 'SOCIO')
 * async getMatters() {}
 */
@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly prisma: PrismaService,
        private readonly config: ConfigService
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest()
        let token = this.extractTokenFromHeader(request)
        
        if (!token && request.cookies) {
            token = request.cookies['access_token'] || request.cookies['accessToken']
        }

        if (!token) {
            throw new UnauthorizedException('Sessão inválida. Inicie sessão novamente.')
        }

        try {
            const secret = this.config.getOrThrow<string>('SUPABASE_JWT_SECRET')
            const payload = await this.jwtService.verifyAsync<JwtPayload>(token, { secret })

            const user = await this.prisma.user.findFirst({
                where: {
                    OR: [
                        { id: payload.sub },
                        { supabaseUserId: payload.sub }
                    ]
                },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    tenantId: true,
                    supabaseUserId: true,
                    mfaEnabled: true,
                },
            })

            if (!user) {
                throw new UnauthorizedException('Sessão inválida. Inicie sessão novamente.')
            }

            request.user = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                tenantId: user.tenantId,
                supabaseUserId: user.supabaseUserId || '',
                mfaEnabled: user.mfaEnabled,
            }

            return true
        } catch (error: any) {

            throw new UnauthorizedException('Sessão inválida. Inicie sessão novamente.')
        }
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers?.authorization?.split(' ') ?? []
        return type === 'Bearer' ? token : undefined
    }
}
