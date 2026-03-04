import { createParamDecorator, ExecutionContext } from '@nestjs/common'

/**
 * Decorator para extrair o utilizador autenticado do request
 * @example async getProfile(@CurrentUser() user: RequestUser) {}
 */
export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest()
        return request.user
    },
)
