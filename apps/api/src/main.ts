// ==========================================
// 1. INJEÇÃO DO OPENTELEMETRY SDK (DEVE VIR ANTES DE EXPLÍCITAMENTE IMPORTARMOS QQ OUTRO PACOTE)
// ==========================================
import { otelSDK } from './telemetry'
otelSDK.start()

import { NestFactory } from '@nestjs/core'
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { AppModule } from './app.module'
import { Catch, ArgumentsHost, HttpException, HttpStatus, ExceptionFilter } from '@nestjs/common';
import fastifyCookie from '@fastify/cookie';

@Catch()
class AllExceptionsFilter implements ExceptionFilter {
    catch(exception: any, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        console.error('API ERROR:', exception);
        response.status(status).send({
            statusCode: status,
            message: exception?.message || 'Internal server error',
            error: exception?.response || exception,
            stack: process.env.NODE_ENV !== 'production' ? exception?.stack : undefined
        });
    }
}

import { Logger } from 'nestjs-pino';

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({ logger: false }), // Desativado para usar o nestjs-pino
    )

    // Injetar o Pino Logger como logger global do Nest
    app.useLogger(app.get(Logger));

    // Register fastify-cookie
    await app.register(fastifyCookie, {
        secret: process.env.COOKIE_SECRET || 'advocatus-secure-cookie-secret',
    });

    // Prefixo global de API
    app.setGlobalPrefix('api/v1')

    // CORS — apenas origens configuradas
    app.enableCors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
        credentials: true,
    })

    // DEBUGFILTER: Retornar a stack trace real nos erros 500 para diagnosticar a falha nos testes
    app.useGlobalFilters(new AllExceptionsFilter());

    const port = process.env.PORT ?? 4000
    await app.listen(port, '0.0.0.0')

    console.log(`🚀 Advocatus IA API running on: http://localhost:${port}/api/v1`)
}

bootstrap()
