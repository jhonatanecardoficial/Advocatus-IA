import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { TenantsModule } from './tenants/tenants.module';
import { ClientsModule } from './clients/clients.module';
import { MattersModule } from './matters/matters.module';
import { TasksModule } from './tasks/tasks.module';
import { DocumentsModule } from './documents/documents.module';
import { TimeEntriesModule } from './time-entries/time-entries.module';
import { ExpensesModule } from './expenses/expenses.module';
import { BillingModule } from './billing/billing.module';

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
        LoggerModule.forRoot({
            pinoHttp: {
                level: process.env.NODE_ENV !== 'production' ? 'debug' : 'info',
                autoLogging: false,
                transport: {
                    targets: [
                        {
                            target: 'pino-pretty',
                            options: { singleLine: true },
                        },
                        {
                            target: 'pino-opentelemetry-transport',
                            options: { loggerName: 'advocatus-api' },
                        },
                    ],
                },
            },
        }),
        ...(process.env.NODE_ENV === 'test'
            ? [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 10000 }])]
            : [ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }])]),
        PrismaModule,
        AuthModule,
        TenantsModule,
        // Fase 1 — MVP Core (activo)
        ClientsModule,
        MattersModule,
        TasksModule,
        DocumentsModule,
        TimeEntriesModule,
        ExpensesModule,
        BillingModule,
        // TODO Fase 2: AiModule, NotificationsModule, SignaturesModule
        // TODO Fase 3: ReportsModule, JurimetricsModule, ClientPortalModule
    ],
})
export class AppModule { }

