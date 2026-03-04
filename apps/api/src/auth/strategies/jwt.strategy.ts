import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PassportStrategy } from '@nestjs/passport'
import { ExtractJwt, Strategy } from 'passport-jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '../../prisma/prisma.service'

export interface JwtPayload {
    sub: string        // Supabase user ID
    email: string
    tenantId?: string
    iat?: number
    exp?: number
}

export interface RequestUser {
    id: string
    email: string
    name: string
    role: string
    tenantId: string
    supabaseUserId: string
    mfaEnabled: boolean
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        config: ConfigService,
        private readonly prisma: PrismaService,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            // Supabase JWT secret — JWT_SECRET no env
            secretOrKey: config.getOrThrow<string>('SUPABASE_JWT_SECRET'),
        })
    }

    async validate(payload: JwtPayload): Promise<RequestUser> {
        // Buscar o utilizador na nossa DB pelo supabaseUserId
        const user = await this.prisma.user.findUnique({
            where: { supabaseUserId: payload.sub },
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
            throw new UnauthorizedException('Utilizador não encontrado ou sem acesso.')
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
            supabaseUserId: user.supabaseUserId!,
            mfaEnabled: user.mfaEnabled,
        }
    }
}
