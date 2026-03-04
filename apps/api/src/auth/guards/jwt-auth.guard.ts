import { Injectable } from '@nestjs/common'
import { AuthGuard } from '@nestjs/passport'

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
export class JwtAuthGuard extends AuthGuard('jwt') { }
