# Relatório de Auditoria de Dependências

## 1. Resumo
Este repositório é um monorepo `pnpm` com três áreas Node.js auditadas e dois ficheiros Python `requirements.txt` em `skills/`:

- `apps/api`: NestJS + Fastify + Prisma + Supabase + fornecedores de IA
- `apps/web`: Next.js 15 + React 19
- `packages/mcp-legal-server`: servidor MCP via `stdio`
- `skills/skills/slack-gif-creator/requirements.txt`
- `skills/skills/mcp-builder/scripts/requirements.txt`

Âmbito revisto:
- 68 dependências externas diretas de runtime em Node
- 34 dependências externas diretas de desenvolvimento em Node
- 6 requisitos diretos em Python
- `pnpm-lock.yaml` está presente para Node, o que ajuda na reprodutibilidade
- Os requisitos Python não estão bloqueados por lockfile, o que aumenta o risco de deriva

Principais conclusões:
- Não foram encontradas vulnerabilidades confirmadas de nível `Crítico`.
- A auditoria de runtime encontrou `1 Alta` e `6 Médias` em dependências Node.
- A auditoria completa da instalação, incluindo tooling de desenvolvimento, encontrou `3 Altas` e `7 Médias`.
- O problema de maior risco em runtime é `@nestjs/platform-fastify` com `CVE-2026-33011`.
- Várias dependências diretas estão materialmente atrás das versões estáveis atuais: `next`, `@prisma/client`, `prisma`, `zod`, `recharts`, `react-pdf`, `resend`, `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `@nestjs/bull`, `bcryptjs`.
- Dependências diretas confirmadamente estagnadas ou sem manutenção incluem `class-transformer` e, pela última atualização de metadados npm com mais de um ano em 20 de março de 2026, `@nestjs/passport`, `passport`, `passport-jwt` e `reflect-metadata`.
- As licenças Node verificadas são todas permissivas (`MIT`, `Apache-2.0`, `BSD-2-Clause`, `BSD-3-Clause`, `ISC`). Não foi identificado conflito de licenciamento copyleft nas dependências diretas Node verificadas.
- Os pacotes Python não puderam ser verificados completamente quanto à versão mais recente, licença ou CVEs com os metadados locais disponíveis e aparecem em `Dependências Não Verificadas`.

## 2. Problemas Críticos
### Vulnerabilidades de segurança
| Severidade | Dependência | Problema | Detalhes |
| --- | --- | --- | --- |
| Alta | `@nestjs/platform-fastify` | `CVE-2026-33011` | Pedidos HEAD podem contornar middleware GET em versões vulneráveis. Atual: `11.1.15`, corrigido a partir de `11.1.16`. Fonte: https://github.com/advisories/GHSA-wf42-42fg-fg84 |
| Média | `fastify` | `CVE-2026-3419` | Cabeçalhos `Content-Type` malformados podem contornar validação. Atual: `5.7.4`, corrigido a partir de `5.8.1`. Fonte: https://github.com/advisories/GHSA-573f-x89g-hqp9 |
| Média | `@nestjs/common` via `file-type` | `CVE-2026-31808` | DoS por loop infinito no parser ASF. Afeta a dependência transitiva `file-type` `21.3.0`. Fonte: https://github.com/advisories/GHSA-5v7r-6r5c-r473 |
| Média | `@nestjs/common` via `file-type` | `CVE-2026-32630` | DoS por bomba de descompressão ZIP em `file-type`. Fonte: https://github.com/advisories/GHSA-j47w-4g3g-c36v |
| Média | `@nestjs/config` via `lodash` | `CVE-2025-13465` | Poluição de protótipo em `lodash` `<4.17.23`. Fonte: https://github.com/advisories/GHSA-xxjr-mmjv-4gpg |
| Média | `next` | `CVE-2026-29057` | Request smuggling em rewrites. Atual: `15.5.12`, corrigido a partir de `15.5.13`. O repositório não define rewrites em `apps/web/next.config.ts`, pelo que a aplicabilidade é menor, mas não nula se a infraestrutura os adicionar a montante. Fonte: https://github.com/advisories/GHSA-ggv3-7p47-pfv8 |
| Média | `next` | `CVE-2026-27980` | Crescimento ilimitado da cache de imagens em disco. Atual: `15.5.12`, corrigido a partir de `15.5.14`. O código local não aparenta usar `next/image`, o que reduz a exposição prática. Fonte: https://github.com/advisories/GHSA-3x4c-7xq6-9pq8 |

### Dependências core depreciadas ou legacy
| Severidade | Dependência | Problema | Detalhes |
| --- | --- | --- | --- |
| Alta | `@types/bcryptjs` | Depreciada | Pacote de tipos stub; `bcryptjs` já inclui as próprias definições de tipos. Fonte: texto de depreciação nos metadados npm. |
| Alta | `@prisma/client` / `prisma` | Grande desfasamento de major version | Atual `6.19.2`, mais recente `7.5.0`. Infraestrutura core de persistência. |
| Alta | `next` | Grande desfasamento de major version | Atual `15.5.12`, mais recente `16.2.0`, além de advisories de segurança ativos. |
| Alta | `zod` | Grande desfasamento de major version | Atual `3.25.76`, mais recente `4.3.6`. Usado em API, web e validação do MCP. |
| Média | `@nestjs/config` | Grande desfasamento de major version | Atual `3.3.0`, mais recente `4.0.3`, além de risco transitivo por `lodash`. |
| Média | `@nestjs/jwt` | Grande desfasamento de major version | Atual `10.2.0`, mais recente `11.0.2`. |
| Média | `@nestjs/passport` | Legacy + estagnada | Atual `10.0.3`, mais recente `11.0.5`; metadados npm atualizados pela última vez a 23 de janeiro de 2025. |
| Média | `@nestjs/bull` | Grande desfasamento de major version | Atual `10.2.3`, mais recente `11.0.4`. |
| Média | `recharts` | Grande desfasamento de major version | Atual `2.15.4`, mais recente `3.8.0`. |
| Média | `react-pdf` | Grande desfasamento de major version | Atual `9.2.1`, mais recente `10.4.1`. |
| Média | `resend` | Grande desfasamento de major version | Atual `4.8.0`, mais recente `6.9.4`. |
| Média | `bcryptjs` | Grande desfasamento de major version | Atual `2.4.3`, mais recente `3.0.3`. |
| Média | `class-transformer` | Sem manutenção | A versão mais recente continua a ser `0.5.1`; metadados npm atualizados pela última vez em 9 de dezembro de 2022. |

## 3. Dependências
Dependências diretas de runtime apenas.

| Dependência | Versão Atual | Última Versão | Estado |
| --- | --- | --- | --- |
| `jose` | `6.1.3` | `6.2.2` | Desatualizada |
| `@fastify/cookie` | `11.0.2` | `11.0.2` | Atualizada |
| `@google/generative-ai` | `0.24.1` | `0.24.1` | Atualizada |
| `@modelcontextprotocol/sdk` | `1.27.1` | `1.27.1` | Atualizada |
| `@nestjs/bull` | `10.2.3` | `11.0.4` | Legacy |
| `@nestjs/common` | `11.1.15` | `11.1.17` | Risco Transitivo |
| `@nestjs/config` | `3.3.0` | `4.0.3` | Legacy |
| `@nestjs/core` | `11.1.15` | `11.1.17` | Desatualizada |
| `@nestjs/jwt` | `10.2.0` | `11.0.2` | Legacy |
| `@nestjs/passport` | `10.0.3` | `11.0.5` | Legacy |
| `@nestjs/platform-fastify` | `11.1.15` | `11.1.17` | Vulnerável |
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
| `@prisma/client` | `6.19.2` | `7.5.0` | Legacy |
| `@supabase/supabase-js` | `2.98.0` | `2.99.3` | Desatualizada |
| `bcryptjs` | `2.4.3` | `3.0.3` | Legacy |
| `bull` | `4.16.5` | `4.16.5` | Atualizada |
| `class-transformer` | `0.5.1` | `0.5.1` | Sem Manutenção |
| `class-validator` | `0.15.1` | `0.15.1` | Atualizada |
| `fastify` | `5.7.4` | `5.8.2` | Vulnerável |
| `ioredis` | `5.10.0` | `5.10.1` | Desatualizada |
| `nestjs-pino` | `4.6.0` | `4.6.1` | Desatualizada |
| `openai` | `6.27.0` | `6.32.0` | Desatualizada |
| `passport` | `0.7.0` | `0.7.0` | Sem Manutenção |
| `passport-jwt` | `4.0.1` | `4.0.1` | Sem Manutenção |
| `pdfkit` | `0.17.2` | `0.18.0` | Desatualizada |
| `pino-http` | `11.0.0` | `11.0.0` | Atualizada |
| `pino-opentelemetry-transport` | `3.0.0` | `3.0.0` | Atualizada |
| `pino-pretty` | `13.1.3` | `13.1.3` | Atualizada |
| `qrcode` | `1.5.4` | `1.5.4` | Atualizada |
| `reflect-metadata` | `0.2.2` | `0.2.2` | Sem Manutenção |
| `resend` | `4.8.0` | `6.9.4` | Legacy |
| `rxjs` | `7.8.2` | `7.8.2` | Atualizada |
| `zod` | `3.25.76` | `4.3.6` | Legacy |
| `@hookform/resolvers` | `5.2.2` | `5.2.2` | Atualizada |
| `@supabase/ssr` | `0.5.2` | `0.9.0` | Desatualizada |
| `@tanstack/react-query` | `5.90.21` | `5.91.3` | Desatualizada |
| `clsx` | `2.1.1` | `2.1.1` | Atualizada |
| `date-fns` | `4.1.0` | `4.1.0` | Atualizada |
| `framer-motion` | `12.36.0` | `12.38.0` | Desatualizada |
| `lucide-react` | `0.577.0` | `0.577.0` | Atualizada |
| `next` | `15.5.12` | `16.2.0` | Vulnerável |
| `react` | `19.2.4` | `19.2.4` | Atualizada |
| `react-dom` | `19.2.4` | `19.2.4` | Atualizada |
| `react-hook-form` | `7.71.2` | `7.71.2` | Atualizada |
| `react-pdf` | `9.2.1` | `10.4.1` | Legacy |
| `recharts` | `2.15.4` | `3.8.0` | Legacy |
| `sonner` | `2.0.7` | `2.0.7` | Atualizada |
| `tailwind-merge` | `2.6.1` | `3.5.0` | Legacy |
| `zustand` | `5.0.11` | `5.0.12` | Desatualizada |
| `dotenv` (`packages/mcp-legal-server`) | `16.6.1` | `17.3.1` | Desatualizada |
| `zod` (`packages/mcp-legal-server`) | `3.25.76` | `4.3.6` | Legacy |

## 4. Análise de Risco
| Severidade | Dependência | Problema | Detalhes |
| --- | --- | --- | --- |
| Alta | `@nestjs/platform-fastify` | Vulnerabilidade em runtime | `CVE-2026-33011`; esta é a camada de entrada da API usada em `apps/api/src/main.ts`. |
| Alta | `@prisma/client` / `prisma` | Ponto único de falha + grande desfasamento de major version | Usado como camada central de persistência em toda a API. O atraso em major versions aumenta a pressão futura e acumula risco de quebra. |
| Alta | `next` | Segurança + atraso de major version | Dois CVEs médios e um desfasamento até `16.2.0`. Dependência core do frontend. |
| Alta | `zod` | Dependência transversal de validação | Usado em DTOs da API, formulários web e parsing do MCP. Isso concentra risco de manutenção. |
| Média | `fastify` | Vulnerabilidade em runtime | `CVE-2026-3419`; afeta o tratamento de `content-type` malformado na camada HTTP. |
| Média | `@nestjs/config` | Vulnerabilidade transitiva + atraso de major version | Puxa `lodash` vulnerável e está uma major version atrás. |
| Média | `@nestjs/common` | Vulnerabilidade transitiva | Puxa `file-type` vulnerável; relevante se forem exercitados caminhos com deteção de tipo em ficheiros não confiáveis. |
| Média | `class-transformer` | Dependência direta sem manutenção | Não existe release estável mais recente e os metadados npm não mudam desde 9 de dezembro de 2022. |
| Média | `passport` / `passport-jwt` / `@nestjs/passport` | Risco de manutenção na autenticação | A autenticação é crítica para o negócio e estes pacotes mostram sinais de manutenção fraca. |
| Média | `resend` | Atraso grande no caminho de notificações | O envio de email está isolado a um único fornecedor e o SDK está duas major versions atrás. |
| Média | `@supabase/supabase-js` / `@supabase/ssr` | Acoplamento a serviço externo | Upload/storage e integração SSR/auth dependem da Supabase; `@supabase/ssr` está bastante atrás (`0.5.2` para `0.9.0`). |
| Média | `react-pdf` / `recharts` / `tailwind-merge` | Carga de manutenção no frontend | Estão materialmente atrás das versões atuais, aumentando a superfície de breaking changes futura. |
| Baixa | Licenças Node diretas verificadas | Compatibilidade legal | Todas as licenças Node diretas verificadas são permissivas; não foi encontrado conflito tipo GPL/AGPL. |
| Baixa | Ficheiros Python de requirements | Risco de reprodutibilidade | Requisitos com versões mínimas e sem lockfile permitem deriva ampla de resolução. |

## 5. Dependências Não Verificadas
| Dependência | Versão Atual | Motivo da Não Verificação |
| --- | --- | --- |
| `pillow` | `>=10.0.0` | O requirement é apenas um limite mínimo; a versão estável mais recente, licença e estado de CVEs não foram totalmente validados a partir dos metadados locais. PyPI: https://pypi.org/project/Pillow/ |
| `imageio` | `>=2.31.0` | O requirement é apenas um limite mínimo; a validação completa no registo ficou incompleta. PyPI: https://pypi.org/project/imageio/ |
| `imageio-ffmpeg` | `>=0.4.9` | O requirement é apenas um limite mínimo; a validação completa no registo ficou incompleta. PyPI: https://pypi.org/project/imageio-ffmpeg/ |
| `numpy` | `>=1.24.0` | O requirement é apenas um limite mínimo; a validação completa no registo ficou incompleta. PyPI: https://pypi.org/project/numpy/ |
| `anthropic` | `>=0.39.0` | O requirement é apenas um limite mínimo; a validação completa no registo ficou incompleta. PyPI: https://pypi.org/project/anthropic/ |
| `mcp` | `>=1.1.0` | O requirement é apenas um limite mínimo; a validação do pacote PyPI ficou inconclusiva com o acesso disponível. |

## 6. Análise de Ficheiros Críticos
1. `apps/api/src/main.ts`
   Usa `@nestjs/platform-fastify`, `fastify` e `@fastify/cookie`. É o entrypoint HTTP, por isso vulnerabilidades na framework afetam imediatamente todo o tráfego da API.

2. `apps/api/src/app.module.ts`
   Raiz central de composição para `@nestjs/config`, `nestjs-pino`, `pino-opentelemetry-transport` e todos os módulos funcionais. Qualquer quebra aqui afeta todo o backend.

3. `apps/api/src/prisma/prisma.service.ts`
   Estende `PrismaClient` e injeta lógica de isolamento por tenant. É um ponto único de falha para toda a persistência e para as garantias de multitenancy.

4. `apps/api/src/auth/auth.service.ts`
   Usa `bcryptjs` e `@nestjs/jwt`. Trata registo, verificação de passwords e emissão de tokens, por isso deriva ou falhas nesta área têm impacto direto nos clientes.

5. `apps/api/src/auth/strategies/jwt.strategy.ts`
   Usa `passport-jwt`, `@nestjs/passport` e `@nestjs/config`. Controla o acesso às rotas protegidas e a extração de tokens por cookie/bearer.

6. `apps/api/src/documents/documents.service.ts`
   Usa `@supabase/supabase-js` para URLs assinadas de upload/download. É a integração central de armazenamento documental para processos e partilha com clientes.

7. `apps/api/src/billing/billing.service.ts`
   Usa `@prisma/client`, `pdfkit` e `qrcode`. Está no fluxo de faturação e gera PDFs fiscais e SAF-T, o que lhe dá elevado impacto de negócio.

8. `apps/api/src/notifications/notifications.service.ts`
   Usa `resend` e Prisma. É o único caminho visível de entrega de notificações no repositório, sendo simultaneamente um ponto único de fornecedor e uma dependência operacional.

9. `apps/api/src/ai/ai.service.ts`
   Usa `openai`, `@google/generative-ai`, Prisma e o cliente MCP. Concentra a superfície funcional de IA e o acoplamento a fornecedores externos.

10. `apps/web/middleware.ts`
    Usa middleware de pedidos do Next.js na fronteira da aplicação. Como `next` tem advisories ativos, este ficheiro é um ponto crítico de tratamento de pedidos web.

## 7. Notas de Integração
- `Prisma` é a abstração dominante no backend. A maioria dos serviços da API passa por `PrismaService`, pelo que o risco desta dependência está altamente concentrado.
- `Fastify` e `@nestjs/platform-fastify` formam a stack única de transporte da API.
- `Supabase` é usada para storage documental e provavelmente para integração de plataforma mais ampla; o fluxo de upload/download documental depende diretamente dela.
- `Zod` é uma camada transversal de validação que abrange DTOs da API, formulários web e o servidor MCP. Isto multiplica o esforço de manutenção.
- `OpenAI` e `@google/generative-ai` estão ambos ligados em `AiService`, com seleção de fornecedor em runtime por configuração.
- `Resend` é o fornecedor visível de email transacional; não existe caminho alternativo implementado no código auditado.
- `PDFKit` e `QRCode` estão embutidos na geração de faturação e templates, pelo que regressões aqui afetam diretamente a produção documental.
- `OpenTelemetry` mais `nestjs-pino` são usados de forma central para observabilidade e logging; são dependências operacionais de largo alcance.
- `@supabase/ssr` está declarado em `apps/web`, mas não encontrei uma importação direta no código web auditado. Isso aumenta a probabilidade de ser dependência não usada ou prevista para uso futuro.
- As dependências Python em `skills/` não fazem parte da build principal Node, mas aumentam a superfície total de manutenção do repositório.

## 8. Plano de Ação
- Priorizar a mitigação de segurança em runtime para `@nestjs/platform-fastify`, `fastify`, `@nestjs/common`, `@nestjs/config` e `next`.
- Tratar `@types/bcryptjs` como dependência morta por estar depreciada e não necessária.
- Rever com prioridade as dependências com atraso material em componentes core: `next`, `@prisma/client`, `prisma`, `zod`, `@nestjs/config`, `@nestjs/jwt`, `@nestjs/passport`, `@nestjs/bull`, `recharts`, `react-pdf`, `resend`, `bcryptjs`.
- Tratar `class-transformer`, `passport`, `passport-jwt`, `@nestjs/passport` e `reflect-metadata` como dependências com risco de manutenção devido a sinais de estagnação e papel em fluxos críticos.
- Verificar se `@supabase/ssr` é efetivamente usada; se não for, representa apenas carga de manutenção.
- Adicionar manifests bloqueados para Python se as pastas `skills/` fizerem parte da superfície oficialmente suportada do produto.
- Executar uma auditoria dedicada de vulnerabilidades e licenças para as seis dependências Python não verificadas.
- Separar operacionalmente risco de runtime e risco de tooling: `eslint`/`flatted` e `@nestjs/cli`/`ajv` não são problemas de produção, mas afetam CI e ambiente de desenvolvimento.
