import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '../decorators/roles.decorator'
import { UserRole } from '@advocatus/types'

/** Hierarquia de roles — índice mais alto = mais permissões */
const ROLE_HIERARCHY: Record<string, number> = {
    CLIENTE: 0,
    SECRETARIA: 1,
    ESTAGIARIO: 2,
    ADVOGADO: 3,
    SOCIO: 4,
    ADMIN: 5,
}

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ])

        // Sem @Roles() → rota pública (protegida apenas por JwtAuthGuard)
        if (!requiredRoles || requiredRoles.length === 0) return true

        const { user } = context.switchToHttp().getRequest()
        if (!user) throw new ForbiddenException('Sem sessão activa.')

        const userLevel = ROLE_HIERARCHY[user.role] ?? -1
        const hasPermission = requiredRoles.some(
            (role) => userLevel >= (ROLE_HIERARCHY[role as string] ?? 0),
        )

        if (!hasPermission) {
            throw new ForbiddenException(
                `Acesso negado. Role '${user.role}' não tem permissão para esta operação.`,
            )
        }

        return true
    }
}
