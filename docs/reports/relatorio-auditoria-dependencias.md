# Relatório de Auditoria de Dependências

## 1. Resumo
Esta auditoria reflete o estado atual do repositório em 22 de março de 2026.

Ecossistemas auditados:
- `apps/api`: NestJS + Fastify + Prisma + Supabase + integrações de IA
- `apps/web`: Next.js 16 + React 19
- `packages/mcp-legal-server`: servidor MCP via `stdio`
- `skills/skills/slack-gif-creator/requirements.txt`
- `skills/skills/mcp-builder/scripts/requirements.txt`

Cobertura:
- 65 dependências externas diretas de runtime em Node.js
- 35 dependências externas diretas de desenvolvimento em Node.js
- 6 requisitos diretos em Python
- `pnpm-lock.yaml` presente para o ecossistema Node.js
- sem lockfiles equivalentes para os requisitos Python

Principais conclusões:
- Houve melhoria material face à auditoria anterior: os atrasos diretos de `next`, `fastify`, `@nestjs/platform-fastify`, `@nestjs/common`, `@nestjs/config`, `@prisma/client`, `prisma`, `zod`, `bcryptjs`, `resend`, `react-pdf`, `recharts`, `tailwind-merge`, `dotenv`, `openai`, `pdfkit`, `nestjs-pino`, `ioredis`, `framer-motion`, `zustand` e `@tanstack/react-query` foram tratados.
- O problema estrutural anterior em `apps/api/src/auth/strategies/jwt.strategy.ts` também foi resolvido: `@nestjs/passport` e `passport-jwt` agora estão declarados em `apps/api/package.json`.
- No runtime de produção, o risco remanescente ficou concentrado quase todo na cadeia transitiva do `Prisma 7`, sobretudo em `@prisma/dev`, `@prisma/config`, `hono`, `@hono/node-server`, `effect` e `lodash`.
- A auditoria de produção (`pnpm audit --prod`) devolveu `0 críticas`, `3 altas`, `8 médias` e `1 baixa`.
- A auditoria completa, incluindo tooling de desenvolvimento, devolveu `0 críticas`, `5 altas`, `9 médias` e `1 baixa`.
- As dependências diretas de runtime em Node.js estão, em geral, atualizadas para a versão estável mais recente. O atraso visível está hoje quase todo em dependências de desenvolvimento.
- As licenças diretas Node.js verificadas continuam permissivas (`MIT`, `Apache-2.0`, `BSD-2-Clause`, `BSD-3-Clause`, `ISC`). Não foi identificado conflito copyleft nas dependências diretas Node.js verificadas.
- Os requisitos Python continuam sem validação completa de versão mais recente, licenças e CVEs a partir do material local disponível.

## 2. Problemas Críticos
### Vulnerabilidades de segurança
| Severidade | Dependência | Problema | Detalhes |
| --- | --- | --- | --- |
| Alta | `@prisma/client` / `prisma` via `@hono/node-server` | `CVE-2026-29087` | Bypass de autorização em ficheiros estáticos protegidos através de encoded slashes. Surge na cadeia `apps__api > prisma > @prisma/dev > @hono/node-server`. Fonte: https://github.com/advisories/GHSA-wc8c-qw6v-h7f6 |
| Alta | `@prisma/config` via `effect` | `CVE-2026-32887` | Contaminação ou perda de contexto `AsyncLocalStorage` sob concorrência. Surge na cadeia `apps__api > @prisma/config > effect`. Fonte: https://github.com/advisories/GHSA-38f7-945m-qr2g |
| Alta | `@prisma/client` / `prisma` via `lodash` | `CVE-2025-13465` | `prototype pollution` na cadeia `apps__api > prisma > @prisma/dev > @mrleebo/prisma-ast > chevrotain > lodash`. Fonte: https://github.com/advisories/GHSA-xxjr-mmjv-4gpg |
| Média | `@prisma/client` / `prisma` via `hono` | Múltiplos CVEs transitivos | Inclui `CVE-2026-24771`, `CVE-2026-24472`, `CVE-2026-24398`, `CVE-2026-24473`, `CVE-2026-29086` e `GHSA-v8w9-8mx6-g223`. As ocorrências vêm da toolchain transitiva do Prisma. Fontes: https://github.com/advisories/GHSA-9r54-q6cx-xmh5 , https://github.com/advisories/GHSA-6wqw-2p9w-4vw4 , https://github.com/advisories/GHSA-r354-f388-2fhh , https://github.com/advisories/GHSA-w332-q679-j88p , https://github.com/advisories/GHSA-v8w9-8mx6-g223 |
| Alta | `eslint` via `flatted` | `CVE-2026-32141`, `CVE-2026-33228` | Risco restrito a tooling e CI; não aparece no caminho principal de produção. Fontes: https://github.com/advisories/GHSA-25h7-pfq9-p65f , https://github.com/advisories/GHSA-rf6f-7fwh-wjgh |
| Média | `@nestjs/cli` via `ajv` | `CVE-2025-69873` | ReDoS em tooling de desenvolvimento. Fonte: https://github.com/advisories/GHSA-2g4f-4pwh-qvx6 |

### Dependências legadas, obsoletas ou com manutenção fraca
| Severidade | Dependência | Problema | Detalhes |
| --- | --- | --- | --- |
| Média | `@nestjs/passport` | Manutenção estagnada | Está na versão atual `11.0.5`, mas o metadata do npm indica última modificação em `2025-01-23`, mais de um ano antes desta auditoria. |
| Média | `passport-jwt` | Manutenção estagnada | Está na versão atual `4.0.1`, com última modificação em `2025-01-10`. É parte do caminho de autenticação. |
| Média | `passport` | Manutenção estagnada | Está na versão atual `0.7.0`, com última modificação em `2025-01-10`. Continua crítico por ser parte da autenticação. |

## 3. Dependências
Dependências diretas de runtime apenas.

| Dependência | Versão Atual | Última Versão | Estado |
| --- | --- | --- | --- |
| `jose` | `6.2.2` | `6.2.2` | Atualizada |
| `@fastify/cookie` | `11.0.2` | `11.0.2` | Atualizada |
| `@google/generative-ai` | `0.24.1` | `0.24.1` | Atualizada |
| `@modelcontextprotocol/sdk` | `1.27.1` | `1.27.1` | Atualizada |
| `@nestjs/bull` | `11.0.4` | `11.0.4` | Atualizada |
| `@nestjs/common` | `11.1.17` | `11.1.17` | Atualizada |
| `@nestjs/config` | `4.0.3` | `4.0.3` | Atualizada |
| `@nestjs/core` | `11.1.17` | `11.1.17` | Atualizada |
| `@nestjs/jwt` | `11.0.2` | `11.0.2` | Atualizada |
| `@nestjs/passport` | `11.0.5` | `11.0.5` | Atualizada com sinal de manutenção fraca |
| `@nestjs/platform-fastify` | `11.1.17` | `11.1.17` | Atualizada |
| `@nestjs/throttler` | `6.5.0` | `6.5.0` | Atualizada |
| `@opentelemetry/auto-instrumentations-node` | `0.71.0` | `0.71.0` | Atualizada |
| `@opentelemetry/exporter-logs-otlp-grpc` | `0.213.0` | `0.213.0` | Atualizada |
| `@opentelemetry/exporter-metrics-otlp-grpc` | `0.213.0` | `0.213.0` | Atualizada |
| `@opentelemetry/exporter-trace-otlp-grpc` | `0.213.0` | `0.213.0` | Atualizada |
| `@opentelemetry/instrumentation-fastify` | `0.57.0` | `0.57.0` | Atualizada |
| `@opentelemetry/instrumentation-nestjs-core` | `0.59.0` | `0.59.0` | Atualizada |
| `@opentelemetry/instrumentation-pino` | `0.59.0` | `0.59.0` | Atualizada |
| `@opentelemetry/instrumentation-winston` | `0.57.0` | `0.57.0` | Atualizada |
| `@opentelemetry/resources` | `2.6.0` | `2.6.0` | Atualizada |
| `@opentelemetry/sdk-logs` | `0.213.0` | `0.213.0` | Atualizada |
| `@opentelemetry/sdk-metrics` | `2.6.0` | `2.6.0` | Atualizada |
| `@opentelemetry/sdk-node` | `0.213.0` | `0.213.0` | Atualizada |
| `@opentelemetry/semantic-conventions` | `1.40.0` | `1.40.0` | Atualizada |
| `@prisma/client` | `7.5.0` | `7.5.0` | Atualizada com risco transitivo |
| `@supabase/supabase-js` | `2.99.3` | `2.99.3` | Atualizada |
| `bcryptjs` | `3.0.3` | `3.0.3` | Atualizada |
| `bull` | `4.16.5` | `4.16.5` | Atualizada |
| `class-validator` | `0.15.1` | `0.15.1` | Atualizada |
| `fastify` | `5.8.2` | `5.8.2` | Atualizada |
| `ioredis` | `5.10.1` | `5.10.1` | Atualizada |
| `nestjs-pino` | `4.6.1` | `4.6.1` | Atualizada |
| `openai` | `6.32.0` | `6.32.0` | Atualizada |
| `passport` | `0.7.0` | `0.7.0` | Atualizada com sinal de manutenção fraca |
| `passport-jwt` | `4.0.1` | `4.0.1` | Atualizada com sinal de manutenção fraca |
| `pdfkit` | `0.18.0` | `0.18.0` | Atualizada |
| `pino-http` | `11.0.0` | `11.0.0` | Atualizada |
| `pino-opentelemetry-transport` | `3.0.0` | `3.0.0` | Atualizada |
| `pino-pretty` | `13.1.3` | `13.1.3` | Atualizada |
| `qrcode` | `1.5.4` | `1.5.4` | Atualizada |
| `resend` | `6.9.4` | `6.9.4` | Atualizada |
| `rxjs` | `7.8.2` | `7.8.2` | Atualizada |
| `zod` | `4.3.6` | `4.3.6` | Atualizada |
| `@hookform/resolvers` | `5.2.2` | `5.2.2` | Atualizada |
| `@supabase/ssr` | `0.9.0` | `0.9.0` | Atualizada |
| `@tanstack/react-query` | `5.94.5` | `5.94.5` | Atualizada |
| `clsx` | `2.1.1` | `2.1.1` | Atualizada |
| `date-fns` | `4.1.0` | `4.1.0` | Atualizada |
| `framer-motion` | `12.38.0` | `12.38.0` | Atualizada |
| `lucide-react` | `0.577.0` | `0.577.0` | Atualizada |
| `next` | `16.2.1` | `16.2.1` | Atualizada |
| `react` | `19.2.4` | `19.2.4` | Atualizada |
| `react-dom` | `19.2.4` | `19.2.4` | Atualizada |
| `react-hook-form` | `7.71.2` | `7.71.2` | Atualizada |
| `react-pdf` | `10.4.1` | `10.4.1` | Atualizada |
| `recharts` | `3.8.0` | `3.8.0` | Atualizada |
| `sonner` | `2.0.7` | `2.0.7` | Atualizada |
| `tailwind-merge` | `3.5.0` | `3.5.0` | Atualizada |
| `zustand` | `5.0.12` | `5.0.12` | Atualizada |
| `dotenv` (`packages/mcp-legal-server`) | `17.3.1` | `17.3.1` | Atualizada |
| `zod` (`packages/mcp-legal-server`) | `4.3.6` | `4.3.6` | Atualizada |

## 4. Análise de Risco
| Severidade | Dependência | Problema | Detalhes |
| --- | --- | --- | --- |
| Alta | `@prisma/client` / `prisma` | Ponto único de falha com cadeia transitiva vulnerável | Toda a persistência da API continua centralizada em Prisma, e os advisories atuais concentram-se precisamente nessa cadeia. |
| Alta | `@prisma/config` | Vulnerabilidade transitiva em `effect` | O advisory `CVE-2026-32887` afeta contexto concorrente e pode ser relevante em stacks modernas com `AsyncLocalStorage`. |
| Alta | `@prisma/dev` | Exposição transitiva via `@hono/node-server` e `hono` | A toolchain interna do Prisma introduz múltiplas superfícies HTTP auxiliares vulneráveis. |
| Média | `@nestjs/passport` / `passport` / `passport-jwt` | Dependências críticas com manutenção estagnada | São pacotes centrais para autenticação e mostram metadata do npm sem atualizações há mais de um ano. |
| Média | `eslint` | Vulnerabilidade em dependência dev `flatted` | Impacta CI, linting e segurança do ambiente de desenvolvimento, não o runtime principal. |
| Média | `@nestjs/cli` | Vulnerabilidade em dependência dev `ajv` | Risco restrito ao tooling local e pipelines. |
| Média | `bull`, `ioredis`, `pino-http` | Potencial carga de manutenção sem uso evidente | Não encontrei imports diretos locais dessas bibliotecas no código auditado; podem estar preparadas para uso indireto ou futuro. |
| Baixa | Licenças diretas Node.js verificadas | Compatibilidade legal | Mantêm-se permissivas; sem conflito copyleft identificado nas dependências diretas verificadas. |
| Baixa | Requisitos Python sem lockfile | Reprodutibilidade | A resolução futura pode divergir sem controlo fino de versões. |

## 5. Dependências Não Verificadas
| Dependência | Versão Atual | Motivo da Não Verificação |
| --- | --- | --- |
| `pillow` | `>=10.0.0` | O requirement define apenas versão mínima; a validação completa de versão mais recente, licença e CVEs não foi fechada com os metadados locais disponíveis. PyPI: https://pypi.org/project/Pillow/ |
| `imageio` | `>=2.31.0` | O requirement define apenas versão mínima; a validação completa no registo ficou incompleta. PyPI: https://pypi.org/project/imageio/ |
| `imageio-ffmpeg` | `>=0.4.9` | O requirement define apenas versão mínima; a validação completa no registo ficou incompleta. PyPI: https://pypi.org/project/imageio-ffmpeg/ |
| `numpy` | `>=1.24.0` | O requirement define apenas versão mínima; a validação completa no registo ficou incompleta. PyPI: https://pypi.org/project/numpy/ |
| `anthropic` | `>=0.39.0` | O requirement define apenas versão mínima; a validação completa no registo ficou incompleta. PyPI: https://pypi.org/project/anthropic/ |
| `mcp` | `>=1.1.0` | O requirement define apenas versão mínima; a validação do pacote no PyPI ficou inconclusiva com o acesso disponível. |

## 6. Análise de Ficheiros Críticos
1. `apps/api/src/prisma/prisma.service.ts`
   É o ponto central de persistência e isolamento por tenant. Qualquer problema em `@prisma/client` afeta praticamente toda a API.

2. `apps/api/src/app.module.ts`
   Raiz de composição da aplicação; centraliza `@nestjs/config`, `nestjs-pino`, throttling e todos os módulos funcionais.

3. `apps/api/src/main.ts`
   Entry point HTTP com `@nestjs/platform-fastify`, `fastify` e cookies. Continua a ser um ficheiro de alto impacto operacional.

4. `apps/api/src/auth/auth.service.ts`
   Fluxo crítico de autenticação com `bcryptjs`, JWT, Prisma e a stack `passport`.

5. `apps/api/src/auth/strategies/jwt.strategy.ts`
   Controla a autenticação das rotas protegidas e depende diretamente de `@nestjs/passport` e `passport-jwt`, que continuam críticos apesar de já estarem corretamente declarados.

6. `apps/api/src/documents/documents.service.ts`
   Integração principal com `@supabase/supabase-js` para upload, download e assinatura documental.

7. `apps/api/src/billing/billing.service.ts`
   Usa Prisma, `pdfkit` e `qrcode` para faturação e SAF-T. É um fluxo de negócio sensível.

8. `apps/api/src/ai/ai.service.ts`
   Concentra `openai`, `@google/generative-ai`, Prisma e o cliente MCP. É a superfície principal de IA.

9. `apps/api/src/telemetry.ts`
   Centraliza `@opentelemetry/*` e auto-instrumentação. Tem acoplamento operacional largo com a infraestrutura observável.

10. `apps/web/middleware.ts`
    É um ponto de controlo de requisições no frontend e continua crítico por estar no caminho de entrada da aplicação web.

## 7. Notas de Integração
- `Prisma` continua a ser a abstração dominante no backend. O perfil de risco atual está mais ligado às suas transitivas do que à versão direta do cliente.
- `Supabase` permanece no centro do módulo documental.
- `Next.js`, `Zod`, `Resend`, `bcryptjs`, `react-pdf`, `recharts`, `tailwind-merge`, `dotenv` e os pacotes principais do Nest foram regularizados para versões atuais.
- A stack de autenticação voltou a ficar consistente no manifest, mas `passport`, `passport-jwt` e `@nestjs/passport` continuam a concentrar risco de manutenção por estarem sem atividade recente.
- `bull`, `ioredis` e `pino-http` continuam declarados, mas não encontrei imports diretos no código auditado; isto sugere dependências preparatórias, indiretas ou já obsoletas.
- O servidor MCP usa `@modelcontextprotocol/sdk`, `dotenv` e `zod` em versões atuais; não identifiquei risco direto relevante nesse pacote nesta nova execução.
- Os requisitos Python em `skills/` continuam fora do grafo principal Node.js, mas contam para a superfície total de manutenção do repositório.

## 8. Plano de Ação
- Priorizar a mitigação dos advisories transitivos associados a `prisma`, `@prisma/client` e `@prisma/config`, porque são hoje o principal núcleo de risco em produção.
- Tratar separadamente risco de runtime e risco de tooling: `eslint`/`flatted` e `@nestjs/cli`/`ajv` afetam desenvolvimento e CI, mas não o caminho principal de produção.
- Rever a dependência operacional da stack `passport`, `passport-jwt` e `@nestjs/passport`, porque está correta do ponto de vista declarativo, mas continua com sinais de manutenção fraca.
- Validar se `bull`, `ioredis` e `pino-http` são efetivamente necessários; se não forem, representam custo de manutenção evitável e potencial ponto único de falha futuro.
- Executar uma auditoria dedicada de vulnerabilidades e licenças para as seis dependências Python não verificadas.
