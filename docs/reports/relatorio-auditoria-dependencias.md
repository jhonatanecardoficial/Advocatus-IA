# Relatório de Auditoria de Dependências

## 1. Resumo
Esta nova execução da auditoria reflete o estado do repositório em 21 de março de 2026.

Ecossistemas auditados:
- `apps/api`: NestJS + Fastify + Prisma + Supabase + IA
- `apps/web`: Next.js 16 + React 19
- `packages/mcp-legal-server`: servidor MCP via `stdio`
- `skills/skills/slack-gif-creator/requirements.txt`
- `skills/skills/mcp-builder/scripts/requirements.txt`

Cobertura:
- 62 dependências externas diretas de runtime em Node
- 35 dependências externas diretas de desenvolvimento em Node
- 6 requisitos diretos em Python
- `pnpm-lock.yaml` presente para Node
- sem lockfiles equivalentes para Python

Principais conclusões:
- Houve melhoria material face à auditoria anterior: os riscos diretos de `next`, `fastify`, `@nestjs/platform-fastify`, `@nestjs/common`, `@nestjs/config`, `zod`, `@prisma/client`, `prisma`, `bcryptjs`, `resend`, `react-pdf`, `recharts` e `tailwind-merge` foram tratados no nível de versão direta.
- O risco de runtime passou a concentrar-se quase todo na cadeia transitiva do `Prisma 7`.
- A auditoria de produção (`pnpm audit --prod`) devolveu `0 críticas`, `3 altas`, `8 médias` e `1 baixa`.
- A auditoria completa, incluindo tooling de desenvolvimento, devolveu `0 críticas`, `5 altas`, `9 médias` e `1 baixa`.
- As vulnerabilidades de maior severidade agora aparecem em dependências transitivas puxadas por `@prisma/client`, `prisma` e `@prisma/config`, sobretudo `@hono/node-server` e `effect`.
- Continua a existir um risco estrutural importante: o ficheiro `apps/api/src/auth/strategies/jwt.strategy.ts` importa `@nestjs/passport` e `passport-jwt`, mas esses pacotes já não constam como dependências diretas declaradas em `apps/api/package.json`.
- As licenças Node diretas verificadas continuam permissivas (`MIT`, `Apache-2.0`, `BSD-2-Clause`, `BSD-3-Clause`, `ISC`). Não foi identificado conflito copyleft nas dependências diretas Node verificadas.
- Os requisitos Python continuam sem validação completa de versão mais recente, licença e CVEs.

## 2. Problemas Críticos
### Vulnerabilidades de segurança
| Severidade | Dependência | Problema | Detalhes |
| --- | --- | --- | --- |
| Alta | `@prisma/client` / `prisma` via `@hono/node-server` | `CVE-2026-29087` | Bypass de autorização em ficheiros estáticos protegidos através de encoded slashes. Surge na cadeia `apps__api > prisma > @prisma/dev > @hono/node-server`. Fonte: https://github.com/advisories/GHSA-wc8c-qw6v-h7f6 |
| Alta | `@prisma/config` via `effect` | `CVE-2026-32887` | Contaminação/perda de contexto `AsyncLocalStorage` sob carga concorrente. Surge na cadeia `apps__api > @prisma/config > effect`. Fonte: https://github.com/advisories/GHSA-38f7-945m-qr2g |
| Média | `@prisma/client` / `prisma` via `hono` | Múltiplos CVEs transitivos | Inclui pelo menos `CVE-2026-24771`, `CVE-2026-24472`, `CVE-2026-24398`, `CVE-2026-24473` e `GHSA-v8w9-8mx6-g223`, todos resolvidos a montante em versões mais recentes de `hono`. Fontes: https://github.com/advisories/GHSA-9r54-q6cx-xmh5 , https://github.com/advisories/GHSA-6wqw-2p9w-4vw4 , https://github.com/advisories/GHSA-r354-f388-2fhh , https://github.com/advisories/GHSA-w332-q679-j88p , https://github.com/advisories/GHSA-v8w9-8mx6-g223 |
| Média | `@prisma/client` / `prisma` via `lodash` | `CVE-2025-13465` | `lodash` vulnerável a prototype pollution na cadeia `apps__api > prisma > @prisma/dev > @mrleebo/prisma-ast > chevrotain > lodash`. Fonte: https://github.com/advisories/GHSA-xxjr-mmjv-4gpg |
| Alta | `eslint` via `flatted` | `CVE-2026-32141`, `CVE-2026-33228` | Risco no tooling/CI, não no runtime da aplicação. Fonte: https://github.com/advisories/GHSA-25h7-pfq9-p65f , https://github.com/advisories/GHSA-rf6f-7fwh-wjgh |
| Média | `@nestjs/cli` via `ajv` | `CVE-2025-69873` | ReDoS no tooling de desenvolvimento. Fonte: https://github.com/advisories/GHSA-2g4f-4pwh-qvx6 |

### Problemas estruturais de dependências
| Severidade | Dependência | Problema | Detalhes |
| --- | --- | --- | --- |
| Alta | `apps/api` | Imports diretos não declarados | `apps/api/src/auth/strategies/jwt.strategy.ts` continua a importar `@nestjs/passport` e `passport-jwt`, mas esses pacotes não estão declarados em `apps/api/package.json`. Isto cria build não reprodutível e dependência implícita de hoisting/transitivas. |
| Média | `prisma` / `@prisma/client` | Carga transitiva de segurança | A atualização para Prisma 7 removeu o atraso de versão direta, mas introduziu uma superfície transitiva significativamente mais ruidosa em `@prisma/dev`, `@prisma/config`, `hono` e `effect`. |
| Média | `bull`, `ioredis`, `pino-http` | Potenciais dependências dormentes | Não encontrei imports diretos dessas bibliotecas no código auditado. Podem estar preparadas para uso futuro, mas hoje aumentam a carga de manutenção sem uso local evidente. |

## 3. Dependências
Dependências diretas de runtime apenas.

| Dependência | Versão Atual | Última Versão | Estado |
| --- | --- | --- | --- |
| `jose` | `6.1.3` | `6.2.2` | Desatualizada |
| `@fastify/cookie` | `11.0.2` | `11.0.2` | Atualizada |
| `@google/generative-ai` | `0.24.1` | `0.24.1` | Atualizada |
| `@modelcontextprotocol/sdk` | `1.27.1` | `1.27.1` | Atualizada |
| `@nestjs/bull` | `11.0.4` | `11.0.4` | Atualizada |
| `@nestjs/common` | `11.1.17` | `11.1.17` | Atualizada |
| `@nestjs/config` | `4.0.3` | `4.0.3` | Atualizada |
| `@nestjs/core` | `11.1.17` | `11.1.17` | Atualizada |
| `@nestjs/jwt` | `11.0.2` | `11.0.2` | Atualizada |
| `@nestjs/platform-fastify` | `11.1.17` | `11.1.17` | Atualizada |
| `@nestjs/throttler` | `6.5.0` | `6.5.0` | Atualizada |
| `@opentelemetry/auto-instrumentations-node` | `0.70.1` | `0.71.0` | Desatualizada |
| `@opentelemetry/exporter-logs-otlp-grpc` | `0.213.0` | `0.213.0` | Atualizada |
| `@opentelemetry/exporter-metrics-otlp-grpc` | `0.213.0` | `0.213.0` | Atualizada |
| `@opentelemetry/exporter-trace-otlp-grpc` | `0.213.0` | `0.213.0` | Atualizada |
| `@opentelemetry/instrumentation-fastify` | `0.57.0` | `0.57.0` | Atualizada |
| `@opentelemetry/instrumentation-nestjs-core` | `0.59.0` | `0.59.0` | Atualizada |
| `@opentelemetry/instrumentation-pino` | `0.59.0` | `0.59.0` | Atualizada |
| `@opentelemetry/instrumentation-winston` | `0.56.0` | `0.57.0` | Desatualizada |
| `@opentelemetry/resources` | `2.6.0` | `2.6.0` | Atualizada |
| `@opentelemetry/sdk-logs` | `0.213.0` | `0.213.0` | Atualizada |
| `@opentelemetry/sdk-metrics` | `2.6.0` | `2.6.0` | Atualizada |
| `@opentelemetry/sdk-node` | `0.213.0` | `0.213.0` | Atualizada |
| `@opentelemetry/semantic-conventions` | `1.40.0` | `1.40.0` | Atualizada |
| `@prisma/client` | `7.5.0` | `7.5.0` | Risco Transitivo |
| `@supabase/supabase-js` | `2.98.0` | `2.99.3` | Desatualizada |
| `bcryptjs` | `3.0.3` | `3.0.3` | Atualizada |
| `bull` | `4.16.5` | `4.16.5` | Atualizada |
| `class-validator` | `0.15.1` | `0.15.1` | Atualizada |
| `fastify` | `5.8.2` | `5.8.2` | Atualizada |
| `ioredis` | `5.10.0` | `5.10.1` | Desatualizada |
| `nestjs-pino` | `4.6.0` | `4.6.1` | Desatualizada |
| `openai` | `6.27.0` | `6.32.0` | Desatualizada |
| `pdfkit` | `0.17.2` | `0.18.0` | Desatualizada |
| `pino-http` | `11.0.0` | `11.0.0` | Atualizada |
| `pino-opentelemetry-transport` | `3.0.0` | `3.0.0` | Atualizada |
| `pino-pretty` | `13.1.3` | `13.1.3` | Atualizada |
| `qrcode` | `1.5.4` | `1.5.4` | Atualizada |
| `resend` | `6.9.4` | `6.9.4` | Atualizada |
| `rxjs` | `7.8.2` | `7.8.2` | Atualizada |
| `zod` | `4.3.6` | `4.3.6` | Atualizada |
| `@hookform/resolvers` | `5.2.2` | `5.2.2` | Atualizada |
| `@tanstack/react-query` | `5.90.21` | `5.94.5` | Desatualizada |
| `clsx` | `2.1.1` | `2.1.1` | Atualizada |
| `date-fns` | `4.1.0` | `4.1.0` | Atualizada |
| `framer-motion` | `12.36.0` | `12.38.0` | Desatualizada |
| `lucide-react` | `0.577.0` | `0.577.0` | Atualizada |
| `next` | `16.2.1` | `16.2.1` | Atualizada |
| `react` | `19.2.4` | `19.2.4` | Atualizada |
| `react-dom` | `19.2.4` | `19.2.4` | Atualizada |
| `react-hook-form` | `7.71.2` | `7.71.2` | Atualizada |
| `react-pdf` | `10.4.1` | `10.4.1` | Atualizada |
| `recharts` | `3.8.0` | `3.8.0` | Atualizada |
| `sonner` | `2.0.7` | `2.0.7` | Atualizada |
| `tailwind-merge` | `3.5.0` | `3.5.0` | Atualizada |
| `zustand` | `5.0.11` | `5.0.12` | Desatualizada |
| `dotenv` (`packages/mcp-legal-server`) | `17.3.1` | `17.3.1` | Atualizada |

## 4. Análise de Risco
| Severidade | Dependência | Problema | Detalhes |
| --- | --- | --- | --- |
| Alta | `@prisma/client` / `prisma` | Ponto único de falha + superfície transitiva vulnerável | Toda a persistência da API continua centralizada em Prisma, e os advisories atuais concentram-se precisamente nesta cadeia. |
| Alta | `@prisma/config` | Vulnerabilidade transitiva em `effect` | O advisory `CVE-2026-32887` afeta contexto concorrente e é relevante em stacks modernas com ALS. |
| Alta | `apps/api/src/auth/strategies/jwt.strategy.ts` | Dependências diretas não declaradas | Uso explícito de `@nestjs/passport` e `passport-jwt` sem declaração no manifest. |
| Média | `@supabase/supabase-js` | Dependência externa ainda desatualizada | Continua no caminho de documentos e partilha, embora apenas com atraso menor. |
| Média | `openai` | Dependência direta desatualizada | Integração de IA permanece com atraso de versão, concentrada em `apps/api/src/ai/ai.service.ts`. |
| Média | `pdfkit` | Dependência direta desatualizada em fluxo fiscal | Continua no caminho de geração de faturas e PDFs. |
| Média | `nestjs-pino` | Dependência direta desatualizada e transversal | Afeta logging/observabilidade de toda a API. |
| Média | `@opentelemetry/auto-instrumentations-node` / `@opentelemetry/instrumentation-winston` | Atraso em dependências operacionais | O acoplamento é transversal e de infra, não funcional. |
| Média | `@tanstack/react-query`, `framer-motion`, `zustand` | Desatualizações no frontend | Não são riscos de segurança identificados nesta execução, mas continuam a acrescentar custo de manutenção. |
| Baixa | Licenças Node diretas verificadas | Compatibilidade legal | Mantêm-se permissivas; sem conflito copyleft identificado. |
| Baixa | Requisitos Python sem lockfile | Reprodutibilidade | A resolução futura pode divergir sem controlo fino de versões. |

## 5. Dependências Não Verificadas
| Dependência | Versão Atual | Motivo da Não Verificação |
| --- | --- | --- |
| `pillow` | `>=10.0.0` | O requirement define apenas versão mínima; a validação completa de versão mais recente, licença e CVEs não foi fechada com os metadados locais. PyPI: https://pypi.org/project/Pillow/ |
| `imageio` | `>=2.31.0` | O requirement define apenas versão mínima; a validação completa no registo ficou incompleta. PyPI: https://pypi.org/project/imageio/ |
| `imageio-ffmpeg` | `>=0.4.9` | O requirement define apenas versão mínima; a validação completa no registo ficou incompleta. PyPI: https://pypi.org/project/imageio-ffmpeg/ |
| `numpy` | `>=1.24.0` | O requirement define apenas versão mínima; a validação completa no registo ficou incompleta. PyPI: https://pypi.org/project/numpy/ |
| `anthropic` | `>=0.39.0` | O requirement define apenas versão mínima; a validação completa no registo ficou incompleta. PyPI: https://pypi.org/project/anthropic/ |
| `mcp` | `>=1.1.0` | O requirement define apenas versão mínima; a validação do pacote PyPI ficou inconclusiva com o acesso disponível. |

## 6. Análise de Ficheiros Críticos
1. `apps/api/src/prisma/prisma.service.ts`
   É o ponto central de persistência e isolamento por tenant. Qualquer problema em `@prisma/client` afeta praticamente toda a API.

2. `apps/api/src/app.module.ts`
   Raiz de composição da aplicação; centraliza `@nestjs/config`, `nestjs-pino`, throttling e todos os módulos funcionais.

3. `apps/api/src/main.ts`
   Entry point HTTP com `@nestjs/platform-fastify`, `fastify` e cookies. Continua a ser um ficheiro de alto impacto operacional.

4. `apps/api/src/auth/auth.service.ts`
   Fluxo crítico de autenticação com `bcryptjs`, JWT e Prisma.

5. `apps/api/src/auth/strategies/jwt.strategy.ts`
   Ficheiro crítico porque depende de imports não declarados (`@nestjs/passport`, `passport-jwt`) e controla a autenticação das rotas protegidas.

6. `apps/api/src/documents/documents.service.ts`
   Integração principal com `@supabase/supabase-js` para upload, download e assinatura documental.

7. `apps/api/src/billing/billing.service.ts`
   Usa Prisma, `pdfkit` e `qrcode` para faturação e SAF-T. É um fluxo de negócio sensível.

8. `apps/api/src/ai/ai.service.ts`
   Concentra `openai`, `@google/generative-ai`, Prisma e o cliente MCP. É a superfície principal de IA.

9. `apps/api/src/telemetry.ts`
   Centraliza `@opentelemetry/*` e auto-instrumentação. Tem acoplamento operacional largo com dependências ainda ligeiramente desatualizadas.

10. `apps/web/components/MatterDetail.tsx`
    É um fluxo funcional importante do frontend e depende de `framer-motion`, que continua desatualizada face à última versão estável.

## 7. Notas de Integração
- `Prisma` continua a ser a abstração dominante no backend. O perfil de risco atual está mais ligado às transitivas da toolchain Prisma do que à versão direta do cliente em si.
- `Supabase` permanece no centro do módulo documental.
- `Zod` foi regularizado para a versão atual e deixou de ser risco principal.
- `Next.js` foi atualizado para `16.2.1`, eliminando o risco direto observado na auditoria anterior.
- `Resend`, `bcryptjs`, `react-pdf`, `recharts`, `tailwind-merge`, `dotenv` e vários pacotes Nest foram atualizados para versões correntes.
- `bull`, `ioredis` e `pino-http` continuam declarados, mas não encontrei imports diretos no código auditado; isto sugere dependências preparatórias, indiretas ou já obsoletas.
- O servidor MCP usa `@modelcontextprotocol/sdk`, `dotenv` e `zod` em versões atuais; não identifiquei risco direto relevante aí nesta nova execução.
- Os requisitos Python em `skills/` continuam fora do grafo principal Node, mas contam para a superfície total de manutenção.

## 8. Plano de Ação
- Priorizar a mitigação dos advisories transitivos associados a `prisma`, `@prisma/client` e `@prisma/config`, porque são hoje o principal núcleo de risco em produção.
- Corrigir a divergência entre código e manifesto em `apps/api`: declarar explicitamente `@nestjs/passport` e `passport-jwt` ou remover o uso.
- Rever se `bull`, `ioredis` e `pino-http` são efetivamente necessários; se não forem, representam custo de manutenção evitável.
- Reduzir o pequeno atraso remanescente em `@supabase/supabase-js`, `openai`, `pdfkit`, `nestjs-pino`, `@opentelemetry/auto-instrumentations-node`, `@opentelemetry/instrumentation-winston`, `@tanstack/react-query`, `framer-motion` e `zustand`.
- Manter separação operacional entre risco de runtime e risco de tooling: `eslint`/`flatted` e `@nestjs/cli`/`ajv` afetam desenvolvimento e CI, mas não o caminho principal de produção.
- Executar uma auditoria dedicada de vulnerabilidades e licenças para as seis dependências Python não verificadas.
