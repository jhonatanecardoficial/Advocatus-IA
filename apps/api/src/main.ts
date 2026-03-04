import { NestFactory } from '@nestjs/core'
import {
    FastifyAdapter,
    NestFastifyApplication,
} from '@nestjs/platform-fastify'
import { AppModule } from './app.module'

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({ logger: true }),
    )

    // Prefixo global de API
    app.setGlobalPrefix('api/v1')

    // CORS — apenas origens configuradas
    app.enableCors({
        origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:3000'],
        credentials: true,
    })

    const port = process.env.PORT ?? 4000
    await app.listen(port, '0.0.0.0')

    console.log(`🚀 Advocatus IA API running on: http://localhost:${port}/api/v1`)
}

bootstrap()
