import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    async onModuleInit() {
        await this.$connect()
    }

    async onModuleDestroy() {
        await this.$disconnect()
    }

    /**
     * Cria e retorna uma Prisma Client Extension ligada a um Tenant específico.
     * Interceta todas as operações na base de dados, colocando-as dentro de
     * uma transação onde o `app.current_tenant_id` é ativado.
     * Isto invoca de forma segura a Row Level Security (RLS) do Supabase/PostgreSQL.
     */
    withTenant(tenantId: string) {
        // Note: Guardamos a referência da instância root PrismaClient para invocar transactions
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const rootClient = this

        return rootClient.$extends({
            name: 'rls_tenant_isolation',
            query: {
                $allModels: {
                    async $allOperations({ args, query }: any) {
                        // PrismaPromise array permite executar o set_config primeiro
                        // e logo de seguida a query na MAIS absoluta mesma conexão db.
                        const [, result] = await rootClient.$transaction([
                            rootClient.$executeRaw`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`,
                            query(args),
                        ])
                        return result
                    },
                },
            },
        })
    }
}
