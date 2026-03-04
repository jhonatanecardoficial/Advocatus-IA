# PLAN-advocatus-ia.md
# Advocatus IA — Plano de Implementação Completo

> **Agentes Ativos:** `project-planner` · `backend-specialist` · `frontend-specialist` · `security-auditor` · `database-architect` · `product-owner`
> **Tipo de Projeto:** WEB + BACKEND (SaaS Jurídico)
> **Data:** Março 2026

---

## 🎯 Visão Executiva

O **Advocatus IA** é uma plataforma SaaS de gestão jurídica com Inteligência Artificial, desenhada especificamente para o mercado jurídico português. Combina gestão de processos, documentos com assinatura digital qualificada (eIDAS/QES), automação IA, e pesquisa jurídica sobre fontes oficiais portuguesas.

---

## 🔍 Análise Crítica do Estado Atual

### O que já existe (bem-feito)
| Documento | Ponto Forte |
|-----------|-------------|
| `backend_advocacia_portugal.md` | Análise de mercado profunda, stack técnica sólida, modelo de dados inicial |
| `relatorio_assinaturas_digitais_portugal.md` | Requisitos legais completos (eIDAS, QES, CMD, PKI) |
| `report_sections/arquitetura_tecnica_seguranca.md` | Requisitos não-funcionais bem mapeados |

### O que FALTA e deve ser corrigido (análise crítica)

> [!CAUTION]
> **LACUNAS CRÍTICAS** — O plano existente não responde a estas questões fundamentais:

1. **Não define o modelo de negócio**: SaaS por assinatura mensal? Freemium? Por utilizador? Por *matter*? Sem isso, a arquitetura de multi-tenancy é impossível de definir.
2. **Não existe UI/UX definida**: Nenhum wireframe, sistema de design, ou fluxo de utilizador.
3. **A camada de IA está vaga**: "LLM + RAG" não é uma arquitetura. Qual modelo? Que dados de treino? Como garantir que não alucina em contexto jurídico?
4. **CITIUS é um bloqueio não resolvido**: O plano diz "sem API pública" mas não propõe alternativa viável.
5. **Modelo de receita não existe**: Sem pricing definido, não há como estimar CAC, LTV, payback.
6. **Ausência de estratégia de go-to-market**: Como chegar aos primeiros 50 clientes?
7. **Stack tecnológica sugerida é demasiado complexa para MVP**: Kubernetes + Kafka + Elasticsearch + Redis é stack de empresa Fortune 500, não de MVP.

---

## 🌍 Estudo de Caso: Lições do Brasil para Portugal

### Cases de Sucesso que Devemos Estudar

#### 1. JusBrasil — O Modelo de Referência
- **O que fez certo:** Centralizou 1,2 bilhão de documentos de +1.400 fontes. Hoje tem 80% dos advogados brasileiros cadastrados.
- **Receita:** Freemium + planos pagos B2B e B2G.
- **Lição para PT:** Começar pelo problema da **pesquisa jurídica** (Diário da República, jurisprudência) antes de tentar gerir processos. A adoção é mais fácil quando não exige mudança de fluxo de trabalho.

#### 2. STF VICTOR — Validação da IA no Contexto Jurídico
- **O que fez certo:** IA treinada especificamente em dados jurídicos brasileiros. Foco em **classificação**, não em **síntese livre**.
- **Lição para PT:** A IA jurídica segura é especializada, não genérica. O Advocatus IA deve fazer o mesmo: modelos fine-tuned para direito português, com citações verificáveis.

#### 3. Advbox (Brasil) — Gestão de Processos para Advogados
- **O que fez certo:** Interface simples, intuitiva, foco em produtividade. Integração com sistemas de tribunais brasileiros.
- **Precificação:** A partir de ~R$150/mês (~€25/mês) por utilizador.
- **Lição para PT:** O advogado não quer complexidade. A UX tem que ser tão intuitiva como o WhatsApp. O preço tem que ser acessível para escritórios solo.

#### 4. Dra. Luzia (Legal Labs, Brasil) — IA Jurídica Aplicada
- **O que fez certo:** Automatização de processos de execução judicial, em parceria com o Governo (Procuradoria do DF).
- **Lição para PT:** Governos e tribunais são clientes B2G com contratos grandes. É uma via alternativa ao B2B puro.

#### 5. ROSS Intelligence — O Erro a Não Repetir
- **O que fez errado:** Usou dados proprietários (Westlaw) para treinar a IA sem licença → processo judicial perdido.
- **Lição crítica para PT:** O Advocatus IA **NUNCA** pode treinar a IA com dados de clientes ou com fontes jurídicas sem licença clara (CC BY 4.0, Open Data). Usar apenas `dados.gov.pt` e `dados.justica.gov.pt`.

---

## 📊 Análise de Mercado Portugal — Dados Reais

> Fontes: `Relatorio_Adocao_Tecnologia_Advocacia_Portugal_PME_2023_2024_2025.md` + `report_sections/1_introducao.md`

| Métrica | Valor | Fonte |
|---------|-------|-------|
| Advogados inscritos na OA | ~30.000 | OA 2024 |
| Escritórios solo/pequenos | ~70-80% do total | Estimativa |
| Adoção de cloud em PME (2021) | **29%** pequenas / **18%** micro | Observatório Cloud PT |
| Adoção de CRM em PME (2024) | **24,4%** (vs 53,9% das grandes) | Liminal 2024 |
| Advogados com falta de competências tech | **41,7%** (2024) | Retrato Advocacia OA |
| Desafio: mudanças legislativas constantes | **42,4%** dos advogados (2024) | Retrato Advocacia OA |
| Escrit. que investem tech p/ optimizar gestão | **42%** (778 inquiridos, 2022) | Analise.com |
| Executivos PT que vêem 2025 como estratégico p/ IA | **82%** | Estudo PT 2024 |
| Planeiam criar funções de agentes inteligentes | **78%** dos executivos PT | Estudo PT 2024 |
| Gap perceção vs adoção real | **Profundo desfasamento** documentado | Retrato Advocacia OA |
| Potencial de mercado (TAM) | €15-25M/ano | Estimativa |
| SAM inicial (solo + pequenos) | €3-5M/ano | Estimativa |

> [!IMPORTANT]
> **Janela de oportunidade crítica:** A oferta de soluções de IA e automação deve crescer **exponencialmente nos próximos 24 meses** (a partir de 2024). Entrar agora é entrar antes da saturação competitiva.

### Modelo de Pricing Proposto

| Plano | Preço/mês | Para quem |
|-------|-----------|-----------|
| **Solo** | €29/mês | Advogados solo, 1 utilizador |
| **Pequeno** | €79/mês | Até 5 utilizadores |
| **Escritório** | €199/mês | Até 15 utilizadores + API |
| **Enterprise** | Contactar | Grandes escritórios + on-premise |

---

## 🏗️ Projeto Type & Stack Decisão

**Tipo:** WEB (SaaS multi-tenant)
**Não é:** Mobile-first app (o utilizador principal usa desktop)

### Stack Recomendada (MVP — Pragmática e Escalável)

> [!IMPORTANT]
> A stack deve ser **simples no MVP** e **escalável depois**. Não começar com Kubernetes.

#### Frontend
| Componente | Tecnologia | Justificativa |
|------------|-----------|---------------|
| Framework | **Next.js 15** (App Router) | SSR para SEO, Server Components para performance |
| Linguagem | **TypeScript** (strict) | Tipo seguro em toda a cadeia |
| Estilização | **Tailwind CSS v4** | Velocidade de desenvolvimento, design system |
| UI Components | **Custom + Radix (headless)** | Sem biblioteca genérica, design diferenciado |
| Estado server | **TanStack Query** | Caching, revalidação, optimistic updates |
| Estado global | **Zustand** | Mínimo, apenas quando necessário |
| Formulários | **React Hook Form + Zod** | Validação type-safe |
| Gráficos | **Recharts** | Dashboards de KPIs |
| PDF Viewer | **react-pdf** | Visualização de documentos jurídicos com assinatura |
| Assinatura Digital | **Autenticação.gov SDK** + **MULTICERT API** | QES via CMD/Cartão de Cidadão — SIGNIUS para CITIUS |

#### Backend
| Componente | Tecnologia | Justificativa |
|------------|-----------|---------------|
| Runtime | **Node.js 22** | LTS, suporte nativo TS, edge-ready |
| Framework | **NestJS** | Enterprise: DI, decorators, CQRS, módulos |
| ORM | **Prisma** | Schema-first, migrations seguras |
| Validação | **Zod** (partilhado) | Type-safe end-to-end |
| Queue | **BullMQ + Redis** | Jobs assíncronos (emails, notificações, indexação) |
| Search | **PostgreSQL Full-Text** (MVP) → Elasticsearch (v2) | Simples primeiro, escalável depois |
| Storage | **Supabase Storage** / **S3-compatible (MinIO)** | Documentos com proteção RGPD |

#### Banco de Dados
| Componente | Tecnologia | Justificativa |
|------------|-----------|---------------|
| Principal | **PostgreSQL 16** via **Supabase** | Row-Level Security nativo, PostGIS disponível |
| Cache | **Redis (Upstash)** | Sessões, rate limiting, BullMQ |
| Vetores | **pgvector** (no Supabase) | Embeddings para RAG |

#### Camada de IA
| Componente | Tecnologia | Justificativa |
|------------|-----------|---------------|
| LLM | **GPT-4o** / **Claude 3.5 Sonnet** (API) | MVP: pagar por uso, sem infra |
| Embeddings | **text-embedding-3-large** (OpenAI) | Alta qualidade semântica |
| RAG Framework | **LangChain.js** / **LlamaIndex** | Orquestração de contexto |
| Vector Store | **pgvector** (PostgreSQL) | Simplicidade, sem infra extra |
| Dados Jurídicos PT | **Diário da República (DRE)** + **dados.gov.pt** | Open Data, licença CC BY 4.0 |

#### Infraestrutura (MVP)
| Componente | Tecnologia | Justificativa |
|------------|-----------|---------------|
| Hosting | **Vercel** (frontend) + **Railway/Render** (backend) | Zero config, deploy automático |
| Database | **Supabase** (managed PostgreSQL) | Auth integrada, RLS, Storage |
| Auth | **Supabase Auth** + **MFA obrigatório** | RGPD compliance, 2FA nativo |
| Emails | **Resend** | Emails transacionais, templates React |
| Monitoramento | **Sentry** + **PostHog** | Erros + analytics de produto |
| CI/CD | **GitHub Actions** | Lint, testes, deploy automático |

---

## 🗄️ Modelo de Dados Detalhado

```sql
-- Multi-tenancy: cada firma é um tenant
tenants {
  id, slug, name, plan, logo_url, settings_json,
  billing_status, created_at
}

-- Utilizadores com RBAC granular
users {
  id, tenant_id, email, name, oab_number,
  role: ENUM(socio, advogado, estagiario, secretaria, cliente, admin),
  mfa_enabled, last_login, created_at
}

-- Clientes do escritório
clients {
  id, tenant_id, type: ENUM(singular, coletivo),
  name, nif, email, phone, address,
  conflict_check_status, gdpr_consent_at, created_at
}

-- Processos/Matters
matters {
  id, tenant_id, client_id, responsible_id,
  title, type: ENUM(civel, penal, laboral, administrativo, fiscal, familia, comercial, outro),
  status: ENUM(ativo, encerrado, suspenso, arquivado),
  court_reference, citius_reference,
  opposing_party, opposing_counsel,
  opened_at, deadline_at, closed_at, created_at
}

-- Documentos com versionamento e assinatura digital
documents {
  id, matter_id, tenant_id, uploaded_by,
  filename, mime_type, storage_path, size_bytes,
  version, parent_version_id,
  signature_type: ENUM(none, ses, aes, qes),
  signature_status: ENUM(pending, signed, rejected),
  signature_provider: ENUM(autenticacao_gov, multicert, docusign),
  signature_metadata_json, -- certificado, timestamp, cadeia de validação
  lta_preserved, -- Long Term Archival flag
  tags, metadata_json, created_at
}

-- Time tracking (horas faturáveis)
time_entries {
  id, matter_id, user_id, tenant_id,
  description, hours, rate_per_hour, billable,
  activity_date, invoice_id, created_at
}

-- Faturas
invoices {
  id, matter_id, client_id, tenant_id,
  reference, amount, vat_rate, total,
  status: ENUM(draft, sent, paid, overdue, cancelled),
  due_date, paid_at, notes, created_at
}

-- Tarefas e prazos processuais
tasks {
  id, matter_id, assigned_to, tenant_id,
  title, description, type: ENUM(prazo, audiencia, diligencia, reuniao, outro),
  priority: ENUM(baixa, media, alta, critica),
  due_at, completed_at,
  notification_sent, created_by, created_at
}

-- Logs de auditoria IMUTÁVEIS
audit_logs {
  id, tenant_id, user_id,
  action, resource_type, resource_id,
  old_value_json, new_value_json,
  ip_address, user_agent, timestamp
}

-- Mensagens criptografadas com clientes
messages {
  id, matter_id, sender_id, tenant_id,
  content_encrypted, -- AES-256
  read_at, created_at
}

-- Base de conhecimento para RAG
legal_documents {
  id, source, type: ENUM(lei, decreto, acordao, resolucao, portaria),
  title, reference, content, content_vector,
  published_at, url, ingested_at
}
```

---

## 🎨 Design System & UI/UX

### Identidade Visual

> [!IMPORTANT]
> Seguindo as regras do `frontend-specialist`: **Sem purple/violet. Sem layouts genéricos SaaS. Sem Glassmorphism.**

**Palavra-chave da marca:** *"Confiança Estrutural"*

**Emoção-cor mapping (jurídico):**
- Primária: **Deep Navy** `#0F1D3A` — autoridade, confiança, seriedade
- Acento: **Amber/Gold** `#D4A853` — justiça, valor, premium
- Ação: **Signal Green** `#1A7F5A` — confirmação, aprovação, sucesso
- Alerta: **Deep Red** `#C0392B` — urgência, prazo, atenção
- Neutro: **Slate** `#F8F9FA` — espaço limpo, foco no conteúdo

**Tipografia:**
- Display: **Playfair Display** (serif) — para títulos jurídicos, autoridade
- Body: **Inter** (sans-serif) — legibilidade máxima em texto denso
- Code/Referências: **JetBrains Mono** — referências legais, números de processo

**Geometria:** Sharp (0-2px border-radius para cards jurídicos), sem elementos "amigáveis" — transmite rigor.

### Fluxos de Utilizador Principais

```
1. ONBOARDING
   Registo → Confirmação email → Setup firma/tenant → Convite equipa → Tour guiado

2. INTAKE DE CLIENTE
   Novo Cliente → Formulário → Conflict Check automático → Portal link para cliente → KYC digital

3. GESTÃO DE MATTER
   Novo Processo → Atribuição → Agenda de prazos → Upload documentos → Time tracking → Faturação

4. ASSINATURA DIGITAL QES
   Documento → Escolher signatário → Via CMD ou Cartão de Cidadão → Validação → LTA preservation

5. PESQUISA IA JURÍDICA
   Query em linguagem natural → RAG sobre DRE + Jurisprudência → Resposta com citações verificáveis
```

### Páginas Core

| Página | Rota | Descrição |
|--------|------|-----------|
| Dashboard | `/app` | KPIs, agenda, tarefas urgentes |
| Clientes | `/app/clients` | Lista, search, ficha de cliente |
| Processos | `/app/matters` | Kanban/lista, filtros por tipo/status |
| Matter Detail | `/app/matters/[id]` | Timeline, documentos, horas, notas |
| Documentos | `/app/documents` | Gestão global, versionamento |
| Tempo/Faturação | `/app/billing` | Time tracking, faturas |
| Pesquisa IA | `/app/ai-search` | Chat com jurisprudência |
| Portal Cliente | `/portal/[token]` | Acesso seguro externo |
| Admin/Settings | `/settings` | RBAC, firma, integrações |

---

## 🔒 Segurança & Compliance

> Agente ativo: `security-auditor` — "Assume breach. Trust nothing. Verify everything."

### OWASP Top 10 — Mitigações Específicas para Advocatus IA

| Risco | Mitigação |
|-------|-----------|
| **A01** Broken Access Control | Row-Level Security (RLS) Supabase. Cada query filtra por `tenant_id`. RBAC granular. |
| **A02** Misconfiguration | Helmet.js, CSP headers, CORS restrito. Segredos em Vault/env seguras. Scanner automático. |
| **A03** Supply Chain | `lockfiles` versionados. `npm audit` em CI. Dependabot. Sem deps sem manutenção. |
| **A04** Cryptographic Failures | AES-256 at-rest. TLS 1.3 em trânsito. Prisma Field Encryption para dados sensíveis. Bcrypt/Argon2 para passwords. |
| **A05** Injection | Prisma ORM (sem SQL raw). Zod validation em todas as entradas. Parameterized queries. |
| **A07** Auth Failures | MFA obrigatório para roles `socio` e `admin`. JWT com expiração curta + refresh tokens. Rate limiting em auth endpoints. |

### RGPD — Requisitos Específicos

- [ ] Registo de consentimento explícito (data, IP, versão da política)
- [ ] Direito ao apagamento implementado (soft delete + anonimização)
- [ ] Exportação de dados do cliente em formato legível (JSON/PDF)
- [ ] DPO (Data Protection Officer) nomeado antes do lançamento
- [ ] DPIA (Data Protection Impact Assessment) documentado
- [ ] Contratos de processamento de dados com todos os sub-processadores (Supabase, Vercel, OpenAI)

### Assinaturas Digitais — Fluxo de Integração

```
Nível 1 (SES): Clique "Aceito" → log de IP + timestamp → valor probatório limitado
Nível 2 (AES): Email/SMS OTP + PDF com hash → para documentos internos
Nível 3 (QES): Integração Autenticação.gov (CMD/CC) → para mandatos, contratos formais
Preservação: Formato LTA com selo temporal qualificado após cada assinatura
Entidade: MULTICERT (QTSP na EU Trusted List)
```

---

## 🤖 Camada de IA — Arquitetura Detalhada

### O Problema Central (Crítico)

> [!WARNING]
> **Risco ROSS Intelligence:** Usar dados jurídicos sem licença para treinar IA é ilegal e pode resultar em processo. O Advocatus IA usa APENAS dados com licença CC BY 4.0 ou Open Data.

### Fontes de Dados Jurídicos PT — Mapeamento Real

> Fonte: `integracao_api_ministerio_justica_pt.md` + `integracao_inteligente_ecossistema_juridico_portugues.md`

| Fonte | API Disponível | Licença | O que dá acesso |
|-------|--------------|---------|------------------|
| **dados.gov.pt** | ✅ CKAN `/api/action/datastore_search` | CC BY 4.0 | Insolvências, processos cíveis, laborais, tutelares |
| **dados.justica.gov.pt** | ✅ CKAN (subdomínio) | CC BY 4.0 | Dados de Justiça estruturados |
| **DRE.pt** (Diário da República) | ✅ API + RSS | Open | Toda a legislação consolidada |
| **CITIUS** (processos judiciais) | ❌ Sem API pública | N/A | Acesso apenas via UI para advogados com certificado OA + SIGNIUS |
| **IRN** (Registos/Notariado) | ❌ Proibido scraping | N/A | Scraping expressamente proibido |  
| **Autenticação.gov** (CMD/CC) | ✅ SDK oficial | N/A | Assinaturas qualificadas QES |
| **MULTICERT** | ✅ API comercial | Contrato | Selos temporais, QES, LTA |

> [!CAUTION]
> **CITIUS sem API:** A integração direta com o CITIUS para terceiros **não é possível**. A solução é orientar o advogado a usar o CITIUS diretamente (com SIGNIUS + certificado OA) e importar manualmente as notificações para o Advocatus IA.

> [!WARNING]
> **Licenciamento comercial:** Dados da Justiça sob CC BY 4.0 requerem **atribuição e autorização prévia para uso comercial ou modificação**. Confirmar com a DGPJ antes de usar em produto pago.

### Pipeline RAG Jurídico Português

```
INGESTÃO (Batch diário):
  dados.gov.pt (API CKAN, CC BY 4.0) → Normalização → Chunking (~512 tokens)
  → Embedding (text-embedding-3-large) → pgvector

  DRE.pt (API legislativa) → Parser de diplomas → Chunking semântico
  → Embedding → pgvector

QUERY (Real-time):
  Pergunta do advogado → Query embedding
  → Busca vetorial cosine similarity (top-10 chunks)
  → Prompt engineering com contexto jurídico PT português
  → GPT-4o/Claude 3.5 → Resposta com citações verificáveis
  → Validação humana OBRIGATÓRIA (sem respostas automáticas vinculativas)

GUARDRAILS OBRIGATÓRIOS:
  - Disclaimer: "Orientação informativa, não conselho jurídico vinculativo."
  - Citações com link directo para fonte oficial (DRE, dados.gov.pt)
  - Confiança score visível (Alta/Média/Baixa)
  - Logging imutável de todas as queries (audit trail)
  - Limite 128K tokens de contexto (GPT-4o)
```

### MCP Server — Implementação Base

> Referência de implementação: repositório `agentic-ops/legal-mcp` (GitHub) como ponto de partida, adaptado para fontes portuguesas. Ver também `rgllm/awesome-portugal-data` para datasets PT.

```typescript
// Ferramentas MCP disponíveis para o LLM (Advocatus IA):
tools: [
  { name: "search_dre",          description: "Pesquisa no Diário da República Eletrónico" },
  { name: "search_jurisprudencia", description: "Pesquisa de acórdãos por keywords" },
  { name: "get_insolvencias",     description: "Dados de insolvências via dados.justica.gov.pt" },
  { name: "get_processos_stats",  description: "Estatísticas de processos por tipo via DGPJ" },
  { name: "validate_nif",         description: "Valida NIF português" },
  { name: "get_matter_context",   description: "Contexto completo do processo actual" },
  { name: "search_legislacao",    description: "Pesquisa legislação por área jurídica" }
]
```

---

## 📋 Roadmap de Implementação

### MVP (Meses 1-3) — "Get to 10 paying clients"

**Goal:** Validar o produto com 10 escritórios piloto. Faturar €290-€790/mês.

| Prioridade | Feature | Agente | Complexidade |
|-----------|---------|--------|--------------|
| P0 | Auth multi-tenant + RBAC + MFA | `security-auditor` + `backend-specialist` | Alta |
| P0 | Schema DB + Prisma migrations | `database-architect` | Média |
| P0 | Gestão de Clientes (CRUD + conflict check) | `backend-specialist` + `frontend-specialist` | Média |
| P1 | Gestão de Processos/Matters (CRUD + timeline) | `backend-specialist` + `frontend-specialist` | Alta |
| P1 | Upload e Visualização de Documentos | `backend-specialist` | Média |
| P1 | Dashboard com KPIs básicos | `frontend-specialist` | Média |
| P1 | Gestão de Tarefas + Prazos + Notificações email | `backend-specialist` | Média |
| P2 | Time Tracking básico | `backend-specialist` | Baixa |
| P2 | Geração de Faturas (draft) | `backend-specialist` | Média |
| P2 | Portal do Cliente (read-only) | `frontend-specialist` | Média |

**Critério de saída do MVP:** 10 clientes pagantes ativos por 30 dias consecutivos.

---

### V1.0 (Meses 4-6) — "Produto completo básico"

| Feature | Descrição |
|---------|-----------|
| Assinatura Digital QES | Integração Autenticação.gov (CMD + Cartão de Cidadão) |
| Pesquisa IA Básica | RAG sobre Diário da República (fase 1) |
| Comunicação Segura | Mensagens encriptadas com clientes |
| Faturação Completa | Integração com AT (Autoridade Tributária), PDF automático |
| Versão de Documentos | Histórico de versões, diffs |
| Relatórios | Rentabilidade por matter, por advogado |
| App Mobile | PWA (não app nativa) — para consulta rápida |

---

### V2.0 (Meses 7-12) — "IA como diferenciador"

| Feature | Descrição |
|---------|-----------|
| IA Assistente Completa | MCP Server com todas as fontes PT (DRE, dados.justica.gov.pt) |
| Automação de Templates | Geração de peças processuais com IA + revisão humana obrigatória |
| Jurimetria | Analytics preditivo: probabilidade de sucesso, tempo estimado |
| Monitor CITIUS (manual) | O advogado usa o CITIUS com o seu certificado OA + SIGNIUS; importa notificações para o Advocatus IA por upload ou copy-paste assistido por IA |
| Marketplace de Templates | Templates de peças jurídicas partilhados entre advogados |
| B2G/Enterprise | Versão para departamentos jurídicos de empresas e câmaras municipais |

> [!CAUTION]
> **CITIUS:** Sem API pública para terceiros (confirmado). Scraping de portais do IRN é **expressamente proibido**. A integração é sempre assistida pelo humano (advogado exporta/copia → Advocatus IA processa).

---

## 📐 Estrutura de Ficheiros

```
advocatus-ia/
├── apps/
│   ├── web/                    # Next.js 15 (frontend)
│   │   ├── app/
│   │   │   ├── (auth)/         # Login, registo, recuperação password
│   │   │   ├── (app)/          # Área autenticada (advogados)
│   │   │   │   ├── dashboard/
│   │   │   │   ├── clients/
│   │   │   │   ├── matters/
│   │   │   │   ├── documents/
│   │   │   │   ├── billing/
│   │   │   │   ├── ai-search/
│   │   │   │   └── settings/
│   │   │   └── portal/         # Portal público para clientes
│   │   ├── components/
│   │   │   ├── ui/             # Design system base
│   │   │   ├── matter/         # Componentes de processo
│   │   │   ├── documents/      # Componentes de documentos
│   │   │   └── ai/             # Componentes de IA
│   │   └── lib/
│   │       ├── supabase.ts
│   │       └── api.ts
│   └── api/                    # NestJS (backend)
│       ├── src/
│       │   ├── auth/           # Auth + RBAC + MFA
│       │   ├── tenants/        # Multi-tenancy
│       │   ├── clients/        # Clientes + conflict check
│       │   ├── matters/        # Processos
│       │   ├── documents/      # Gestão documental + assinatura
│       │   ├── billing/        # Time tracking + faturas
│       │   ├── tasks/          # Tarefas + prazos
│       │   ├── ai/             # RAG + MCP + LLM
│       │   ├── notifications/  # Email + push (BullMQ)
│       │   └── audit/          # Logs imutáveis
│       └── prisma/
│           └── schema.prisma
├── packages/
│   ├── shared-types/           # TypeScript types partilhados
│   ├── ui-kit/                 # Design system (Storybook)
│   └── legal-data-fetcher/    # Ingestão DRE + dados.gov.pt
├── docs/
│   └── PLAN-advocatus-ia.md    # Este ficheiro
└── .agent/                     # Sistema de agentes IA do dev
```

---

## ✅ Task Breakdown Detalhado

### 🔴 FASE 0: Fundação (Semana 1)

#### Task 001 — Setup Monorepo
- **Agente:** `devops-engineer`
- **Skill:** `nodejs-best-practices`
- **INPUT:** Requisitos de projeto
- **OUTPUT:** Turborepo + pnpm workspace configurado com `apps/web`, `apps/api`, `packages/`
- **VERIFY:** `pnpm build` em todos os pacotes passa sem erros
- **Rollback:** Git reset

#### Task 002 — Schema Prisma + Supabase
- **Agente:** `database-architect`
- **Skill:** `database-design`, `prisma-expert`
- **INPUT:** Modelo de dados deste documento
- **OUTPUT:** `schema.prisma` completo + migrations + RLS policies no Supabase
- **VERIFY:** `prisma migrate dev` corre sem erros. Seed com dados de teste.
- **Rollback:** `prisma migrate reset`

#### Task 003 — Auth + RBAC + MFA
- **Agente:** `security-auditor` + `backend-specialist`
- **Skill:** `vulnerability-scanner`, `api-patterns`
- **INPUT:** Roles definidos (socio, advogado, estagiario, secretaria, cliente, admin)
- **OUTPUT:** Supabase Auth + MFA obrigatório para roles críticos + middleware RBAC no NestJS
- **VERIFY:** Teste: utilizador sem role adequado recebe 403. MFA obrigado no login de socio.
- **Rollback:** Desativar middleware, restaurar policies

---

### 🟠 FASE 1: Core Features (Semanas 2-6)

#### Task 004 — API de Clientes + Conflict Check
- **Agente:** `backend-specialist`
- **INPUT:** Schema `clients` + regras de conflict of interest
- **OUTPUT:** `POST /clients`, `GET /clients`, `GET /clients/:id`, `PUT /clients/:id`, `DELETE /clients/:id` + endpoint `POST /clients/conflict-check`
- **VERIFY:** Teste: criar 2 clientes com parts opposing → conflict check retorna positivo

#### Task 005 — API de Matters/Processos
- **Agente:** `backend-specialist`
- **INPUT:** Schema `matters` + tipos de processo PT
- **OUTPUT:** CRUD completo + endpoint para alteração de status + timeline de eventos
- **VERIFY:** Criar matter, adicionar documento, verificar timeline

#### Task 006 — Gestão Documental
- **Agente:** `backend-specialist`
- **Skill:** `api-patterns`
- **INPUT:** Schema `documents` + Supabase Storage
- **OUTPUT:** Upload seguro (pre-signed URLs), versionamento, metadados, associação a matters
- **VERIFY:** Upload de PDF 10MB, verificar integridade, versionar, confirmar acesso apenas para utilizadores do tenant

#### Task 007 — UI Dashboard + Matters (Frontend)
- **Agente:** `frontend-specialist`
- **Skill:** `frontend-design`, `tailwind-patterns`
- **INPUT:** Design system definido neste documento (Navy + Amber, Sharp geometry)
- **OUTPUT:** Dashboard com KPIs, lista de matters com filtros, ficha de matter com timeline
- **VERIFY:** Lighthouse score > 90. Testes Playwright nos fluxos críticos.

#### Task 008 — Time Tracking + Faturação
- **Agente:** `backend-specialist` + `frontend-specialist`
- **INPUT:** Schema `time_entries` + `invoices`
- **OUTPUT:** Timer de sessão, registo manual de horas, geração de fatura em PDF
- **VERIFY:** Registar 3 horas em matter, gerar fatura, verificar total correto

#### Task 009 — Sistema de Notificações & Prazos
- **Agente:** `backend-specialist`
- **Skill:** `nodejs-best-practices`
- **INPUT:** Schema `tasks` + BullMQ + Resend
- **OUTPUT:** Cron job para verificar prazos, envio de email 7 dias + 1 dia antes, push notification
- **VERIFY:** Criar task com prazo 7 dias → email enviado imediatamente ao testar. Criar task urgente → email no mesmo dia.

---

### 🟡 FASE 2: V1.0 Features (Semanas 7-12)

#### Task 010 — Assinatura Digital QES (Autenticação.gov)
- **Agente:** `backend-specialist` + `security-auditor`
- **Skill:** `api-patterns`, `vulnerability-scanner`
- **INPUT:** Documentação API Autenticação.gov (CMD) + MULTICERT
- **OUTPUT:** Fluxo completo de assinatura QES com validação LTA, endpoint `POST /documents/:id/sign`
- **VERIFY:** Assinar documento com CMD de teste → verificar certificado, timestamp, cadeia de validação
- **Nota:** Requer conta de desenvolvimento em Autenticação.gov (Portugal)

#### Task 011 — Pesquisa IA (RAG Básico)
- **Agente:** `backend-specialist`
- **Skill:** `api-patterns`, `mcp-builder`
- **INPUT:** API DRE.pt + dados.gov.pt (CC BY 4.0)
- **OUTPUT:** Pipeline de ingestão + endpoint `POST /ai/search` + UI de chat jurídico
- **VERIFY:** Query "quais os requisitos da lei do arrendamento urbano?" retorna resposta com citação verificável
- **Guardrail:** Toda resposta inclui disclaimer obrigatório

#### Task 012 — Portal Seguro do Cliente
- **Agente:** `frontend-specialist`
- **INPUT:** Schema `messages` (encriptadas) + portal route
- **OUTPUT:** Portal via token único, visualização de documentos, comunicação encriptada
- **VERIFY:** Token expirado → acesso negado. Token válido → documentos visíveis apenas do matter associado.

---

### 🟢 FASE X: Verificação Final (Antes de cada release)

```bash
# P0: Segurança
python .agent/skills/vulnerability-scanner/scripts/security_scan.py .

# P1: UX Audit
python .agent/skills/frontend-design/scripts/ux_audit.py .

# P2: Lint + Types
pnpm lint && pnpm tsc --noEmit

# P3: Testes
pnpm test

# P4: Lighthouse (requires running server)
python .agent/skills/performance-profiling/scripts/lighthouse_audit.py http://localhost:3000

# P5: E2E Playwright
python .agent/skills/webapp-testing/scripts/playwright_runner.py http://localhost:3000 --screenshot
```

**Critérios de aceitação:**
- [ ] Zero vulnerabilidades críticas ou altas
- [ ] Lighthouse > 90 em Performance, Acessibilidade e SEO
- [ ] Cobertura de testes > 70%
- [ ] Sem erros TypeScript em modo strict
- [ ] RGPD checklist completo
- [ ] Auditoria de assinaturas digitais completa

---

## 📈 KPIs & Métricas de Sucesso

### Métricas de Produto
| KPI | Baseline | Target 3 meses | Target 6 meses |
|-----|----------|----------------|----------------|
| Clientes ativos pagantes | 0 | 10 | 50 |
| MRR (Monthly Recurring Revenue) | €0 | €500 | €5.000 |
| NPS (Net Promoter Score) | - | >30 | >50 |
| Churn mensal | - | <5% | <3% |
| Adoção do Portal do Cliente | - | >40% dos matters | >70% |

### Métricas de Operação Jurídica (para clientes)
| KPI | Impacto esperado |
|-----|-----------------|
| Prazos perdidos | Redução de >90% |
| Tempo para encontrar documento | De minutos para segundos |
| Horas faturáveis recuperadas | +15-25% |
| Tempo em tarefas administrativas | Redução de 40-60% |
| Incidentes de segurança | Zero |

---

## ⚠️ Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| **API CITIUS sem acesso** (confirmado) | Certeza | Médio | Feature de importação manual; orientar uso directo do CITIUS pelo advogado |
| API Autenticação.gov não disponível p/ testes | Alta | Alto | Implementar sandbox/stub (mock QES) primeiro; conta dev na AMA |
| Regulamentação IA jurídica (EU AI Act 2025) | Média | Alto | Guardrails obrigatórios; disclaimer em todas as respostas IA |
| Adoção lenta (advocacia avessa à mudança — 42% ainda sem tech) | Alta | Médio | Onboarding guiado, formação, suporte dedicado 60 dias, trial gratuito |
| Licenciamento comercial dados.gov.pt (CC BY 4.0) | Média | Alto | Confirmar com DGPJ autorização prévia para uso comercial antes do lançamento |
| ROSS-like: dados sem licença para treino IA | Baixa | Crítico | Protocolo estrito: APENAS open data CC BY 4.0 ou licença obtida |
| Fuga de dados sensíveis de clientes | Baixa | Crítico | RLS Supabase + AES-256 + pentests semestrais + DPO nomeado |
| Concorrência de players internacionais (Clio, MyCase) | Média | Médio | Foco no mercado PT: língua, sistema jurídico, compliance eIDAS/RGPD, preço |
| Scraping IRN/Notariado (expressamente proibido) | Certeza | Crítico | Nunca fazer scraping de portais que o proíbem expressamente — zero tolerância |

---

## 🚀 Go-To-Market Strategy

### Fase 1: Validação (0-3 meses)
1. **Recrutar 10 beta testers** via Ordem dos Advogados, LinkedIn grupos jurídicos PT
2. **Oferecer 3 meses grátis** para feedback estruturado
3. **Parceria piloto** com 1-2 escritórios médios (5-15 advogados)
4. **Métricas de validação:** NPS > 30, retorno no produto > 3x/semana

### Fase 2: Crescimento (3-12 meses)
1. **Content Marketing:** Blog jurídico sobre digitalização PT (SEO)
2. **Parceria OA:** Apresentação em formações da Ordem dos Advogados
3. **Programa de referral:** Desconto de 20% por advogado referenciado
4. **Presença em eventos:** Portugal Legaltech Summit, Encontro Nacional de Advogados

---

## 📌 Próximos Passos Imediatos

### Decisões Confirmadas ✅
| Questão | Decisão |
|---------|--------|
| Equipa técnica | ✅ Equipa completa disponível — avançar imediatamente |
| Prioridade MVP | ✅ CRM jurídico + IA em simultâneo (diferenciador de mercado) |
| Conta Autenticação.gov dev | ⏳ Viabilizar quando iniciar Fase 2 (meses 4-6) |
| Infra/Budget | Estimar ao iniciar setup (previsão: €200-500/mês em fase MVP) |

### Acções Imediatas
1. ✅ **Plano aprovado** — iniciar implementação
2. ⬜ **Setup de contas:** Supabase, Vercel, Railway, OpenAI API, GitHub
3. ⬜ **Correr `/create`** para iniciar o monorepo e estrutura base
4. ⬜ **Contactar DGPJ** para confirmar autorização uso comercial dados CC BY 4.0
5. ⬜ **Solicitar conta dev** Autenticação.gov (AMA) para testes QES (Fase 2)

---

## ✅ PHASE X COMPLIANCE CHECKLIST

- [ ] Purple/violet ausente do design system
- [ ] Design único, não template SaaS genérico
- [ ] Socratic Gate respeitado: questões abertas listadas
- [ ] Sem dados de treino IA sem licença (ROSS-protection)
- [ ] RGPD checklist incluído
- [ ] eIDAS/QES compliance mapeado
- [ ] Stack MVP pragmática (sem Kubernetes no início)
- [ ] Modelo de pricing definido
- [ ] KPIs mensuráveis com baseline
- [ ] Riscos mapeados com mitigações

---

*Criado por: `orchestrator` + `project-planner` + `backend-specialist` + `frontend-specialist` + `security-auditor` + `database-architect` + `product-owner`*
*Última atualização: Março 2026*
