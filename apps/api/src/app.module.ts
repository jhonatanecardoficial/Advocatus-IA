import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { TenantsModule } from './tenants/tenants.module'

@Module({
    imports: [
        // Variáveis de ambiente globais
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),

        // Rate limiting — proteção contra brute force (OWASP)
        ThrottlerModule.forRoot([
            {
                ttl: 60_000,  // 1 minuto
                limit: 100,   // max 100 requests por IP por janela
            },
        ]),

        // Core modules
        PrismaModule,
        AuthModule,
        TenantsModule,

        // TODO Fase 1 (Meses 1-3):
        // ClientsModule,
        // MattersModule,
        // DocumentsModule,
        // TimeTrackingModule,
        // BillingModule,
        // TasksModule,

        // TODO Fase 2 (Meses 4-6):
        // AiModule,
        // NotificationsModule,
        // SignaturesModule,

        // TODO Fase 3 (Meses 7-12):
        // ReportsModule,
        // JurimetricsModule,
        // ClientPortalModule,
    ],
})
export class AppModule { }
