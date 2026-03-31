import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common'
import { PrismaClient } from '@prisma/client'
import { Pool } from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
    constructor() {
        const pool = new Pool({ connectionString: process.env.DATABASE_URL })
        const adapter = new PrismaPg(pool)
        super({ adapter })
    }

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
                        // Prisma 7 Fix: 'omit' option cannot be null. 
                        // If Prisma is internally setting it to null or it's coming from an invalid transform,
                        // we must ensure it's undefined before passing it to query(args).
                        if (args && args.omit === null) {
                            args.omit = undefined;
                        }

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
