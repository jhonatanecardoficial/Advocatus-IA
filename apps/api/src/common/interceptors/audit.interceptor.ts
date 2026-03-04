import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common'
import { Observable, tap } from 'rxjs'
import { PrismaService } from '../../prisma/prisma.service'
import { RequestUser } from '../../auth/strategies/jwt.strategy'

/**
 * Interceptor global de auditoria — regista todas as operações mutativas (POST, PUT, PATCH, DELETE)
 * nos audit_logs para rastreabilidade e conformidade RGPD / OA.
 *
 * Append-only: os logs nunca são modificados ou eliminados via API.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
    constructor(private readonly prisma: PrismaService) { }

    intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
        const request = context.switchToHttp().getRequest()
        const { method, url } = request
        const user: RequestUser | undefined = request.user

        // Só audita operações mutativas
        const isMutative = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)

        return next.handle().pipe(
            tap(async () => {
                if (!isMutative || !user) return

                try {
                    await this.prisma.auditLog.create({
                        data: {
                            tenantId: user.tenantId,
                            userId: user.id,
                            action: method,
                            resourceType: this.extractResource(url),
                            resourceId: this.extractResourceId(url),
                            ipAddress: request.ip,
                            userAgent: request.headers['user-agent'],
                        },
                    })
                } catch {
                    // Auditoria nunca deve bloquear o fluxo principal
                }
            }),
        )
    }

    private extractResource(url: string): string {
        const parts = url.split('/').filter(Boolean)
        return parts[2] ?? 'unknown' // /api/v1/{resource}/...
    }

    private extractResourceId(url: string): string {
        const parts = url.split('/').filter(Boolean)
        return parts[3] ?? 'list'
    }
}
