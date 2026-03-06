import { Controller, Get, Post, Body, UsePipes, Res, UseGuards, HttpCode, HttpStatus } from '@nestjs/common'
import { FastifyReply } from 'fastify'
import { AuthService } from './auth.service'
import { ZodValidationPipe } from '../common/pipes/zod-validation.pipe'
import { RegisterDto, RegisterSchema } from './dto/register.dto'
import { LoginDto, LoginSchema } from './dto/login.dto'
import { JwtAuthGuard } from './guards/jwt-auth.guard'
import { CurrentUser } from './decorators/current-user.decorator'
import { RequestUser } from './strategies/jwt.strategy'

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

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

    /**
     * POST /api/v1/auth/register
     */
    @Post('register')
    @UsePipes(new ZodValidationPipe(RegisterSchema))
    @HttpCode(HttpStatus.CREATED)
    async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: FastifyReply) {
        const { user, token } = await this.authService.register(dto);
        this.setAuthCookie(res, token);
        return { message: 'Conta criada com sucesso', user, access_token: token };
    }

    /**
     * POST /api/v1/auth/login
     */
    @Post('login')
    @UsePipes(new ZodValidationPipe(LoginSchema))
    @HttpCode(HttpStatus.OK)
    async login(@Body() dto: LoginDto, @Res({ passthrough: true }) res: FastifyReply) {
        const { user, token } = await this.authService.login(dto);
        this.setAuthCookie(res, token);
        return { message: 'Login com sucesso', user, access_token: token };
    }

    /**
     * POST /api/v1/auth/logout
     */
    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Res({ passthrough: true }) res: FastifyReply) {
        res.clearCookie('accessToken', { path: '/' });
        return { message: 'Logout efetuado com sucesso' };
    }

    private setAuthCookie(res: FastifyReply, token: string) {
        res.setCookie('accessToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 dias em segundos
        });
    }
}
