import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RequestUser } from './strategies/jwt.strategy'

@Injectable()
export class AuthService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Regista (ou actualiza) o perfil de um utilizador após o sign-in via Supabase.
     * Chamado num webhook ou após a primeira autenticação.
     */
    async syncSupabaseUser(supabaseUserId: string, email: string, tenantId: string) {
        return this.prisma.user.upsert({
            where: { supabaseUserId },
            update: { email },
            create: {
                supabaseUserId,
                email,
                name: email.split('@')[0], // Nome temporário até o utilizador completar o perfil
                tenantId,
                role: 'ADVOGADO', // Role padrão
            },
        })
    }

    /**
     * Valida que o utilizador pertence ao tenant indicado.
     * Usado internamente pelos guards para evitar cross-tenant data access.
     */
    async validateTenantAccess(user: RequestUser, resourceTenantId: string): Promise<void> {
        if (user.tenantId !== resourceTenantId && user.role !== 'ADMIN') {
            throw new UnauthorizedException('Acesso negado: recurso pertence a outro escritório.')
        }
    }
}
