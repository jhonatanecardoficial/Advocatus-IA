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
        const extractors = [
            ExtractJwt.fromAuthHeaderAsBearerToken(),
            (req: any) => {
                let token = null;
                if (req && req.cookies) {
                    // Try both common cookie names for consistency
                    token = req.cookies['access_token'] || req.cookies['accessToken'];
                }
                return token;
            },
        ];

        super({
            jwtFromRequest: ExtractJwt.fromExtractors(extractors),
            ignoreExpiration: false,
            // Supabase JWT secret â€” JWT_SECRET no env
            secretOrKey: config.getOrThrow<string>('SUPABASE_JWT_SECRET'),
        })
    }

    async validate(payload: JwtPayload): Promise<RequestUser> {
        // Buscar o utilizador na nossa DB pelo ID (local) ou pelo supabaseUserId (Supabase)
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
            // Token may be valid but user row is missing (e.g. DB reset).
            throw new UnauthorizedException('Sessao invalida. Inicie sessao novamente.')
        }

        return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            tenantId: user.tenantId,
            supabaseUserId: user.supabaseUserId || '',
            mfaEnabled: user.mfaEnabled,
        }
    }
}


