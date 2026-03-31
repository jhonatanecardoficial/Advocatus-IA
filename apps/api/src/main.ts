// ==========================================
// 1. CARREGAMENTO DE VARIÁVEIS DE AMBIENTE (DEVE VIR ANTES DE TUDO)
// ==========================================
import * as dotenv from 'dotenv';
import * as path from 'path';

// Tenta carregar do diretório local ou da raiz do monorepo
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

// ==========================================
// 2. INJEÇÃO DO OPENTELEMETRY SDK
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

        const isProd = process.env.NODE_ENV === 'production';
        response.status(status).send({
            statusCode: status,
            message: isProd && status === HttpStatus.INTERNAL_SERVER_ERROR
                ? 'Internal server error'
                : (exception?.message || 'Internal server error'),
            ...(isProd ? {} : {
                error: exception?.response || exception,
                stack: exception?.stack,
            }),
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
    const cookieSecret = process.env.COOKIE_SECRET;
    if (!cookieSecret && process.env.NODE_ENV === 'production') {
        throw new Error('COOKIE_SECRET environment variable is required in production');
    }
    await app.register(fastifyCookie, {
        secret: cookieSecret || 'advocatus-secure-cookie-secret',
    });

    // Prefixo global de API
    app.setGlobalPrefix('api/v1')

    // CORS — apenas origens configuradas
    const allowedOrigins = process.env.ALLOWED_ORIGINS
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:3001'];
    app.enableCors({
        origin: process.env.NODE_ENV === 'production'
            ? allowedOrigins
            : true, // Em desenvolvimento, permitir todos
        credentials: true,
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
        allowedHeaders: 'Content-Type,Accept,Authorization,X-Requested-With',
    })

    // DEBUGFILTER: Retornar a stack trace real nos erros 500 para diagnosticar a falha nos testes
    app.useGlobalFilters(new AllExceptionsFilter());

    const port = process.env.PORT ?? 4000
    await app.listen(port, '0.0.0.0')

    console.log(`🚀 Advocatus IA API running on: http://localhost:${port}/api/v1`)
}

bootstrap()
