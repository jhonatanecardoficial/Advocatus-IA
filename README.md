# ⚖️ Advocatus IA

> Plataforma SaaS de gestão jurídica com Inteligência Artificial, desenvolvida para escritórios de advocacia portugueses.

[![Node.js](https://img.shields.io/badge/Node.js-≥22.0.0-339933?logo=node.js)](https://nodejs.org/)
[![pnpm](https://img.shields.io/badge/pnpm-≥9.0.0-F69220?logo=pnpm)](https://pnpm.io/)
[![License](https://img.shields.io/badge/License-Proprietary-blue)]()

---

## 📋 Sobre o Projeto

O **Advocatus IA** é uma plataforma SaaS que combina gestão jurídica com inteligência artificial para automatizar e otimizar o dia-a-dia de escritórios de advocacia em Portugal. Inclui gestão de processos, clientes, prazos judiciais (Art. 138.º CPC), faturação, assinaturas digitais qualificadas (eIDAS) e pesquisa jurídica com RAG.

### Conformidade Legal
- 🇵🇹 **RGPD** — Lei n.º 58/2019
- 🇪🇺 **eIDAS** — Assinaturas Digitais Qualificadas
- ⚖️ **CPC** — Cálculo de prazos processuais (Art. 138.º)
- 🧾 **SAF-T** — Formato de faturação português

---

## 🏗️ Arquitetura

```
advocatus-ia/                    # Monorepo (Turborepo + pnpm)
├── apps/
│   ├── api/                     # NestJS + Fastify — API REST + BullMQ + Prisma
│   │   ├── src/
│   │   │   ├── ai/              # IA / RAG (embeddings, pesquisa semântica)
│   │   │   ├── auth/            # Autenticação (JWT, guards, bcrypt)
│   │   │   ├── billing/         # Faturação (proformas, SAF-T)
│   │   │   ├── clients/         # Gestão de clientes
│   │   │   ├── documents/       # Gestão documental
│   │   │   ├── matters/         # Processos jurídicos
│   │   │   ├── tasks/           # Tarefas e prazos (CPC)
│   │   │   ├── portal/          # Portal do cliente
│   │   │   ├── qes/             # Assinaturas qualificadas
│   │   │   └── ...              # Outros módulos (expenses, reports, etc.)
│   │   └── prisma/              # Schema e migrações
│   └── web/                     # Next.js 15 — Dashboard + Portal
│       ├── app/                 # App Router (rotas, server actions)
│       ├── components/          # Componentes React
│       └── middleware.ts        # Proteção de rotas
├── packages/
│   ├── types/                   # TypeScript types partilhados
│   ├── config/tsconfig/         # Configurações TypeScript base
│   ├── ui/                      # Componentes UI partilhados
│   └── mcp-legal-server/        # MCP server para IA jurídica
├── docs/                        # Documentação do projeto
├── tests/                       # Testes (API, E2E, unit)
└── supabase/                    # Configuração Supabase
```

---

## 🛠️ Stack Tecnológica

| Camada | Tecnologia |
|--------|------------|
| **Frontend** | Next.js 15, React 19, Tailwind CSS v4 |
| **Backend** | NestJS, Fastify, Node.js 22 |
| **Database** | PostgreSQL via Supabase + Prisma ORM |
| **Auth** | JWT + bcrypt (autenticação própria) |
| **IA / RAG** | GPT-4o, pgvector, LangChain.js |
| **Queue** | BullMQ + Redis |
| **Email** | Resend |
| **Observabilidade** | OpenTelemetry + Pino Logger |
| **Assinaturas** | Autenticação.gov (CMD/CC) + MULTICERT |
| **Monorepo** | Turborepo + pnpm workspaces |

---

## 🚀 Setup Local

### Pré-requisitos

- [Node.js](https://nodejs.org/) ≥ 22.0.0
- [pnpm](https://pnpm.io/) ≥ 9.0.0
- [Docker](https://www.docker.com/) (para Redis)
- Conta [Supabase](https://supabase.com/) (base de dados)

### Instalação

```bash
# 1. Clonar o repositório
git clone https://github.com/your-org/advocatus-ia.git
cd advocatus-ia

# 2. Instalar dependências
pnpm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
cp .env.example apps/api/.env
cp .env.example apps/web/.env.local
# ⚠️ Editar os ficheiros .env com os valores reais

# 4. Iniciar Redis (necessário para BullMQ)
docker-compose up -d

# 5. Gerar o cliente Prisma
pnpm db:generate

# 6. Correr migrações
pnpm db:migrate

# 7. Iniciar em modo desenvolvimento
pnpm dev
```

Após o `pnpm dev`, os serviços estarão disponíveis em:
- **Frontend:** http://localhost:3000
- **API:** http://localhost:4000/api/v1

---

## 📜 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | Inicia ambos os servidores (web + api) em modo desenvolvimento |
| `pnpm build` | Build de produção de todos os packages |
| `pnpm lint` | Executa ESLint em todo o monorepo |
| `pnpm test` | Executa testes unitários + API |
| `pnpm test:unit` | Testes unitários (Jest) |
| `pnpm test:api` | Testes da API (Playwright) |
| `pnpm test:web` | Testes E2E do frontend (Playwright) |
| `pnpm type-check` | Verificação de tipos TypeScript |
| `pnpm format` | Formata código com Prettier |
| `pnpm db:generate` | Gera o Prisma Client |
| `pnpm db:migrate` | Aplica migrações pendentes |

---

## 🔐 Variáveis de Ambiente

Consultar `.env.example` para a lista completa. Variáveis principais:

| Variável | Obrigatória | Descrição |
|----------|:-----------:|-----------|
| `DATABASE_URL` | ✅ | URL de conexão PostgreSQL (via PgBouncer) |
| `DIRECT_URL` | ✅ | URL directa PostgreSQL (para migrações) |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL pública do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Chave anónima do Supabase |
| `JWT_SECRET` | ✅ | Segredo para assinatura JWT |
| `COOKIE_SECRET` | ✅ prod | Segredo para cookies (obrigatório em produção) |
| `OPENAI_API_KEY` | ✅ | Chave da API OpenAI |
| `REDIS_URL` | ✅ | URL do Redis para BullMQ |
| `ALLOWED_ORIGINS` | ✅ prod | Origins permitidos para CORS |

---

## 🧪 Testes

```bash
# Todos os testes
pnpm test

# Apenas testes da API
pnpm test:api

# Testes E2E do frontend
pnpm test:web
```

Os testes da API utilizam Playwright para validar endpoints REST. Os testes E2E cobrem fluxos do frontend (login, clientes, processos, agenda).

---

## 📚 Documentação

| Documento | Descrição |
|-----------|-----------|
| [PLAN-advocatus-ia.md](./docs/PLAN-advocatus-ia.md) | Plano de implementação completo |
| [backend_advocacia_portugal.md](./docs/backend_advocacia_portugal.md) | Especificações de negócio |
| [ENVIRONMENT.md](./docs/ENVIRONMENT.md) | Guia de variáveis de ambiente |
| [UI-GUIDELINES.md](./docs/UI-GUIDELINES.md) | Guia de estilo visual |
| [relatorio_assinaturas_digitais_portugal.md](./docs/relatorio_assinaturas_digitais_portugal.md) | Conformidade de assinaturas |
| [visao_negocio_roadmap.md](./docs/visao_negocio_roadmap.md) | Roadmap de negócio |

---

## 🤝 Boas Práticas

1. **Branches:** Usar `feature/`, `fix/`, `chore/` — nunca commit directo na `main`
2. **Commits:** Mensagens em inglês, formato convencional (`feat:`, `fix:`, `chore:`)
3. **Testes:** Rodar `pnpm test` antes de submeter PRs
4. **Linting:** `pnpm lint` deve passar sem erros
5. **Tipos:** `pnpm type-check` deve compilar sem erros

---

> ⚖️ Desenvolvido para o mercado jurídico português — compliant com eIDAS, RGPD e Lei n.º 58/2019
