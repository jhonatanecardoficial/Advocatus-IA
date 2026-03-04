import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'

@Module({
    imports: [
        // Variáveis de ambiente globais
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        // TODO: Adicionar módulos conforme implementação
        // AuthModule,
        // TenantsModule,
        // ClientsModule,
        // MattersModule,
        // DocumentsModule,
        // BillingModule,
        // TasksModule,
        // AiModule,
        // NotificationsModule,
        // AuditModule,
    ],
})
export class AppModule { }
