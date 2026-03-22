# PR: Fix Billing Connection and Prisma 7 Initialization

## Objetivo
Corrigir a falha de ligação na página de faturação (`/billing`) causada por erros de inicialização do Prisma 7 e dependências de autenticação no NestJS.

## Alterações Implementadas

### Backend (API)
- **Prisma 7 Migration**: Implementação do driver adapter `@prisma/adapter-pg` no `PrismaService`. O Prisma 7 agora exige explicitamente um adaptador para ligações diretas a PostgreSQL.
- **Monorepo Env Loading**: Correção do `prisma.config.ts` para carregar o ficheiro `.env` da raiz do monorepo (`../../.env`), garantindo que a `DATABASE_URL` está disponível durante a geração do cliente e execução de comandos.
- **Global Auth Architecture**: Refatoração do `AuthModule` para ser `@Global()`. Isto resolve o erro `UnknownDependenciesException` onde diversos módulos (como `TimeEntries` e `Billing`) não conseguiam resolver o `JwtService` necessário para os guards de segurança.
- **Explicit Env Integration**: Adicionado `dotenv` no `main.ts` para assegurar que as variáveis de ambiente são carregadas antes de qualquer serviço NestJS ou Prisma.

### Frontend (Web)
- **Middleware Update**: Garantia de que a rota `/billing` está incluída no matcher do middleware de autenticação.

## Testes Realizados
- **Unit Tests**: Execução de `pnpm test` no pacote `@advocatus/api` (4 suites, 12 testes passados).
- **Linting**: Verificação de conformidade de código com `eslint`.
- **E2E Visual**: Verificação via subagente de browser confirmando que a página `http://localhost:3001/billing` carrega corretamente, exibe o botão "Nova Fatura" e comunica com a API sem erros de "fetch failed".

## Impacto
- Restauro total da funcionalidade de faturação.
- Estabilização da arquitetura de autenticação para todo o monorepo.
- Conformidade com as normas do Prisma 7 e NestJS 11.

## Referências
- Task: Debugging Billing Page Failure
- Branch: `fix/billing-connection-prisma7`
