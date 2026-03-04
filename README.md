# Advocatus IA

> Plataforma SaaS de gestão jurídica com Inteligência Artificial para escritórios de advocacia portugueses.

## Estrutura do Monorepo

```
advocatus-ia/
├── apps/
│   ├── web/          # Next.js 15 — Dashboard (advogados) + Portal (clientes)
│   └── api/          # NestJS + Fastify — API REST + BullMQ + Prisma
├── packages/
│   ├── types/        # TypeScript types partilhados
│   └── config/
│       └── tsconfig/ # Configurações TypeScript base
└── docs/
    └── PLAN-advocatus-ia.md  # Plano de implementação completo
```

## Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| Frontend | Next.js 15, React 19, Tailwind CSS v4 |
| Backend | NestJS, Fastify, Node.js 22 |
| Database | PostgreSQL via Supabase + Prisma |
| Auth | Supabase Auth + MFA obrigatório |
| IA / RAG | GPT-4o, pgvector, LangChain.js |
| Queue | BullMQ + Redis |
| Email | Resend |
| Assinaturas | Autenticação.gov (CMD/CC) + MULTICERT |

## Requisitos

- Node.js >= 22.0.0
- pnpm >= 9.0.0

## Setup Local

```bash
# 1. Instalar dependências
pnpm install

# 2. Configurar variáveis de ambiente
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
# Editar os ficheiros .env com os valores reais

# 3. Gerar o cliente Prisma
pnpm db:generate

# 4. Correr migrações
pnpm db:migrate

# 5. Iniciar em modo desenvolvimento
pnpm dev
```

## Documentação

Ver [docs/PLAN-advocatus-ia.md](./docs/PLAN-advocatus-ia.md) para o plano completo de implementação.

---

> ⚖️ Desenvolvido para o mercado jurídico português — compliant com eIDAS, RGPD e Lei n.º 58/2019
