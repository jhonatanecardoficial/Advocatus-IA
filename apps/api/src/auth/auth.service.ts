import { Injectable, UnauthorizedException } from '@nestjs/common'
import { PrismaService } from '../prisma/prisma.service'
import { RequestUser } from './strategies/jwt.strategy'
import * as bcrypt from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'
import { RegisterDto } from './dto/register.dto'
import { LoginDto } from './dto/login.dto'

@Injectable()
export class AuthService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly jwtService: JwtService
    ) { }

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

    /**
     * POST /auth/register
     */
    async register(dto: RegisterDto) {
        // Verificar se já existe email
        const existingUser = await this.prisma.user.findFirst({
            where: { email: dto.email }
        });
        if (existingUser) {
            throw new UnauthorizedException('Email já está em uso.');
        }

        const passwordHash = await bcrypt.hash(dto.password, 10);
        const tenantSlug = dto.tenantName.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + Math.floor(Math.random() * 10000);

        // Criar Tenant e User na mesma transacção
        const user = await this.prisma.$transaction(async (tx) => {
            const tenant = await tx.tenant.create({
                data: {
                    name: dto.tenantName,
                    slug: tenantSlug,
                    plan: 'SOLO'
                }
            });

            return tx.user.create({
                data: {
                    email: dto.email,
                    name: dto.name,
                    passwordHash,
                    tenantId: tenant.id,
                    role: 'ADMIN', // Quem cria o tenant é admin dele
                }
            });
        });

        const token = this.generateToken(user);
        return { user, token };
    }

    /**
     * POST /auth/login
     */
    async login(dto: LoginDto) {
        const user = await this.prisma.user.findFirst({
            where: { email: dto.email }
        });

        if (!user || !user.passwordHash) {
            throw new UnauthorizedException('Credenciais inválidas.');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
        if (!isPasswordValid) {
            throw new UnauthorizedException('Credenciais inválidas.');
        }

        // Atualizar last login (não bloquear a resposta)
        this.prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() }
        }).catch((err: Error) => console.error('Erro ao atualizar last login:', err));

        const token = this.generateToken(user);
        return { user, token };
    }

    private generateToken(user: any) {
        const payload = {
            sub: user.id, // ID do nosso User invés do SupabaseUserId
            email: user.email,
            tenantId: user.tenantId,
            role: user.role
        };
        return this.jwtService.sign(payload);
    }
}
