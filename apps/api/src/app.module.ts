import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { ThrottlerModule } from '@nestjs/throttler'
import { PrismaModule } from './prisma/prisma.module'
import { AuthModule } from './auth/auth.module'
import { TenantsModule } from './tenants/tenants.module'
import { ClientsModule } from './clients/clients.module'
import { MattersModule } from './matters/matters.module'
import { TasksModule } from './tasks/tasks.module'

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 100 }]),
        PrismaModule,
        AuthModule,
        TenantsModule,
        // Fase 1 — MVP Core (activo)
        ClientsModule,
        MattersModule,
        TasksModule,
        // TODO Fase 1 seguinte: DocumentsModule, TimeTrackingModule, BillingModule
        // TODO Fase 2: AiModule, NotificationsModule, SignaturesModule
        // TODO Fase 3: ReportsModule, JurimetricsModule, ClientPortalModule
    ],
})
export class AppModule { }

