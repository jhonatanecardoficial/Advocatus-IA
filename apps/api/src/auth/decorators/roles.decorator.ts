import { SetMetadata } from '@nestjs/common'
import { UserRole } from '@advocatus/types'

export const ROLES_KEY = 'roles'

/**
 * Decorator para definir roles permitidos numa rota
 * @example @Roles('SOCIO', 'ADMIN')
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)
