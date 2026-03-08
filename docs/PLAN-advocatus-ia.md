# PLAN-advocatus-ia.md
# Advocatus IA â€” Plano de ImplementaÃ§Ã£o Completo

> **Agentes Ativos:** `project-planner` Â· `backend-specialist` Â· `frontend-specialist` Â· `security-auditor` Â· `database-architect` Â· `product-owner`
> **Tipo de Projeto:** WEB + BACKEND (SaaS JurÃ­dico)
> **Data:** MarÃ§o 2026

---

## ðŸŽ¯ VisÃ£o Executiva

O **Advocatus IA** Ã© uma plataforma SaaS de gestÃ£o jurÃ­dica com InteligÃªncia Artificial, desenhada especificamente para o mercado jurÃ­dico portuguÃªs. Combina gestÃ£o de processos, documentos com assinatura digital qualificada (eIDAS/QES), automaÃ§Ã£o IA, e pesquisa jurÃ­dica sobre fontes oficiais portuguesas.

---

## ðŸ” AnÃ¡lise CrÃ­tica do Estado Atual

### O que jÃ¡ existe (bem-feito)
| Documento | Ponto Forte |
|-----------|-------------|
| `backend_advocacia_portugal.md` | AnÃ¡lise de mercado profunda, stack tÃ©cnica sÃ³lida, modelo de dados inicial |
| `relatorio_assinaturas_digitais_portugal.md` | Requisitos legais completos (eIDAS, QES, CMD, PKI) |
| `report_sections/arquitetura_tecnica_seguranca.md` | Requisitos nÃ£o-funcionais bem mapeados |

### O que FALTA e deve ser corrigido (anÃ¡lise crÃ­tica)

> [!CAUTION]
> **LACUNAS CRÃTICAS** â€” O plano existente nÃ£o responde a estas questÃµes fundamentais:

1. **NÃ£o define o modelo de negÃ³cio**: SaaS por assinatura mensal? Freemium? Por utilizador? Por *matter*? Sem isso, a arquitetura de multi-tenancy Ã© impossÃ­vel de definir.
2. **NÃ£o existe UI/UX definida**: Nenhum wireframe, sistema de design, ou fluxo de utilizador.
3. **A camada de IA estÃ¡ vaga**: "LLM + RAG" nÃ£o Ã© uma arquitetura. Qual modelo? Que dados de treino? Como garantir que nÃ£o alucina em contexto jurÃ­dico?
4. **CITIUS Ã© um bloqueio nÃ£o resolvido**: O plano diz "sem API pÃºblica" mas nÃ£o propÃµe alternativa viÃ¡vel.
5. **Modelo de receita nÃ£o existe**: Sem pricing definido, nÃ£o hÃ¡ como estimar CAC, LTV, payback.
6. **AusÃªncia de estratÃ©gia de go-to-market**: Como chegar aos primeiros 50 clientes?
7. **Stack tecnolÃ³gica sugerida Ã© demasiado complexa para MVP**: Kubernetes + Kafka + Elasticsearch + Redis Ã© stack de empresa Fortune 500, nÃ£o de MVP.

---

## ðŸŒ Estudo de Caso: LiÃ§Ãµes do Brasil para Portugal

### Cases de Sucesso que Devemos Estudar

#### 1. JusBrasil â€” O Modelo de ReferÃªncia
- **O que fez certo:** Centralizou 1,2 bilhÃ£o de documentos de +1.400 fontes. Hoje tem 80% dos advogados brasileiros cadastrados.
- **Receita:** Freemium + planos pagos B2B e B2G.
- **LiÃ§Ã£o para PT:** ComeÃ§ar pelo problema da **pesquisa jurÃ­dica** (DiÃ¡rio da RepÃºblica, jurisprudÃªncia) antes de tentar gerir processos. A adoÃ§Ã£o Ã© mais fÃ¡cil quando nÃ£o exige mudanÃ§a de fluxo de trabalho.

#### 2. STF VICTOR â€” ValidaÃ§Ã£o da IA no Contexto JurÃ­dico
- **O que fez certo:** IA treinada especificamente em dados jurÃ­dicos brasileiros. Foco em **classificaÃ§Ã£o**, nÃ£o em **sÃ­ntese livre**.
- **LiÃ§Ã£o para PT:** A IA jurÃ­dica segura Ã© especializada, nÃ£o genÃ©rica. O Advocatus IA deve fazer o mesmo: modelos fine-tuned para direito portuguÃªs, com citaÃ§Ãµes verificÃ¡veis.

#### 3. Advbox (Brasil) â€” GestÃ£o de Processos para Advogados
- **O que fez certo:** Interface simples, intuitiva, foco em produtividade. IntegraÃ§Ã£o com sistemas de tribunais brasileiros.
- **PrecificaÃ§Ã£o:** A partir de ~R$150/mÃªs (~â‚¬25/mÃªs) por utilizador.
- **LiÃ§Ã£o para PT:** O advogado nÃ£o quer complexidade. A UX tem que ser tÃ£o intuitiva como o WhatsApp. O preÃ§o tem que ser acessÃ­vel para escritÃ³rios solo.

#### 4. Dra. Luzia (Legal Labs, Brasil) â€” IA JurÃ­dica Aplicada
- **O que fez certo:** AutomatizaÃ§Ã£o de processos de execuÃ§Ã£o judicial, em parceria com o Governo (Procuradoria do DF).
- **LiÃ§Ã£o para PT:** Governos e tribunais sÃ£o clientes B2G com contratos grandes. Ã‰ uma via alternativa ao B2B puro.

#### 5. ROSS Intelligence â€” O Erro a NÃ£o Repetir
- **O que fez errado:** Usou dados proprietÃ¡rios (Westlaw) para treinar a IA sem licenÃ§a â†’ processo judicial perdido.
- **LiÃ§Ã£o crÃ­tica para PT:** O Advocatus IA **NUNCA** pode treinar a IA com dados de clientes ou com fontes jurÃ­dicas sem licenÃ§a clara (CC BY 4.0, Open Data). Usar apenas `dados.gov.pt` e `dados.justica.gov.pt`.

---

## ðŸ“Š AnÃ¡lise de Mercado Portugal â€” Dados Reais

> Fontes: `Relatorio_Adocao_Tecnologia_Advocacia_Portugal_PME_2023_2024_2025.md` + `report_sections/1_introducao.md`

| MÃ©trica | Valor | Fonte |
|---------|-------|-------|
| Advogados inscritos na OA | ~30.000 | OA 2024 |
| EscritÃ³rios solo/pequenos | ~70-80% do total | Estimativa |
| AdoÃ§Ã£o de cloud em PME (2021) | **29%** pequenas / **18%** micro | ObservatÃ³rio Cloud PT |
| AdoÃ§Ã£o de CRM em PME (2024) | **24,4%** (vs 53,9% das grandes) | Liminal 2024 |
| Advogados com falta de competÃªncias tech | **41,7%** (2024) | Retrato Advocacia OA |
| Desafio: mudanÃ§as legislativas constantes | **42,4%** dos advogados (2024) | Retrato Advocacia OA |
| Escrit. que investem tech p/ optimizar gestÃ£o | **42%** (778 inquiridos, 2022) | Analise.com |
| Executivos PT que vÃªem 2025 como estratÃ©gico p/ IA | **82%** | Estudo PT 2024 |
| Planeiam criar funÃ§Ãµes de agentes inteligentes | **78%** dos executivos PT | Estudo PT 2024 |
| Gap perceÃ§Ã£o vs adoÃ§Ã£o real | **Profundo desfasamento** documentado | Retrato Advocacia OA |
| Potencial de mercado (TAM) | â‚¬15-25M/ano | Estimativa |
| SAM inicial (solo + pequenos) | â‚¬3-5M/ano | Estimativa |

> [!IMPORTANT]
> **Janela de oportunidade crÃ­tica:** A oferta de soluÃ§Ãµes de IA e automaÃ§Ã£o deve crescer **exponencialmente nos prÃ³ximos 24 meses** (a partir de 2024). Entrar agora Ã© entrar antes da saturaÃ§Ã£o competitiva.

### Modelo de Pricing Proposto

| Plano | PreÃ§o/mÃªs | Para quem |
|-------|-----------|-----------|
| **Solo** | â‚¬29/mÃªs | Advogados solo, 1 utilizador |
| **Pequeno** | â‚¬79/mÃªs | AtÃ© 5 utilizadores |
| **EscritÃ³rio** | â‚¬199/mÃªs | AtÃ© 15 utilizadores + API |
| **Enterprise** | Contactar | Grandes escritÃ³rios + on-premise |

---

## ðŸ—ï¸ Projeto Type & Stack DecisÃ£o

**Tipo:** WEB (SaaS multi-tenant)
**NÃ£o Ã©:** Mobile-first app (o utilizador principal usa desktop)

### Stack Recomendada (MVP â€” PragmÃ¡tica e EscalÃ¡vel)

> [!IMPORTANT]
> A stack deve ser **simples no MVP** e **escalÃ¡vel depois**. NÃ£o comeÃ§ar com Kubernetes.

#### Frontend
| Componente | Tecnologia | Justificativa |
|------------|-----------|---------------|
| Framework | **Next.js 15** (App Router) | SSR para SEO, Server Components para performance |
| Linguagem | **TypeScript** (strict) | Tipo seguro em toda a cadeia |
| EstilizaÃ§Ã£o | **Tailwind CSS v4** | Velocidade de desenvolvimento, design system |
| UI Components | **Custom + Radix (headless)** | Sem biblioteca genÃ©rica, design diferenciado |
| Estado server | **TanStack Query** | Caching, revalidaÃ§Ã£o, optimistic updates |
| Estado global | **Zustand** | MÃ­nimo, apenas quando necessÃ¡rio |
| FormulÃ¡rios | **React Hook Form + Zod** | ValidaÃ§Ã£o type-safe |
| GrÃ¡ficos | **Recharts** | Dashboards de KPIs |
| PDF Viewer | **react-pdf** | VisualizaÃ§Ã£o de documentos jurÃ­dicos com assinatura |
| Assinatura Digital | **AutenticaÃ§Ã£o.gov SDK** + **MULTICERT API** | QES via CMD/CartÃ£o de CidadÃ£o â€” SIGNIUS para CITIUS |

#### Backend
| Componente | Tecnologia | Justificativa |
|------------|-----------|---------------|
| Runtime | **Node.js 22** | LTS, suporte nativo TS, edge-ready |
| Framework | **NestJS** | Enterprise: DI, decorators, CQRS, mÃ³dulos |
| ORM | **Prisma** | Schema-first, migrations seguras |
| ValidaÃ§Ã£o | **Zod** (partilhado) | Type-safe end-to-end |
| Queue | **BullMQ + Redis** | Jobs assÃ­ncronos (emails, notificaÃ§Ãµes, indexaÃ§Ã£o) |
| Search | **PostgreSQL Full-Text** (MVP) â†’ Elasticsearch (v2) | Simples primeiro, escalÃ¡vel depois |
| Storage | **Supabase Storage** / **S3-compatible (MinIO)** | Documentos com proteÃ§Ã£o RGPD |

#### Banco de Dados
| Componente | Tecnologia | Justificativa |
|------------|-----------|---------------|
| Principal | **PostgreSQL 16** via **Supabase** | Row-Level Security nativo, PostGIS disponÃ­vel |
| Cache | **Redis (Upstash)** | SessÃµes, rate limiting, BullMQ |
| Vetores | **pgvector** (no Supabase) | Embeddings para RAG |

#### Camada de IA
| Componente | Tecnologia | Justificativa |
|------------|-----------|---------------|
| LLM | **GPT-4o** / **Claude 3.5 Sonnet** (API) | MVP: pagar por uso, sem infra |
| Embeddings | **text-embedding-3-large** (OpenAI) | Alta qualidade semÃ¢ntica |
| RAG Framework | **LangChain.js** / **LlamaIndex** | OrquestraÃ§Ã£o de contexto |
| Vector Store | **pgvector** (PostgreSQL) | Simplicidade, sem infra extra |
| Dados JurÃ­dicos PT | **DiÃ¡rio da RepÃºblica (DRE)** + **dados.gov.pt** | Open Data, licenÃ§a CC BY 4.0 |

#### Infraestrutura (MVP)
| Componente | Tecnologia | Justificativa |
|------------|-----------|---------------|
| Hosting | **Vercel** (frontend) + **Railway/Render** (backend) | Zero config, deploy automÃ¡tico |
| Database | **Supabase** (managed PostgreSQL) | Auth integrada, RLS, Storage |
| Auth | **Supabase Auth** + **MFA obrigatÃ³rio** | RGPD compliance, 2FA nativo |
| Emails | **Resend** | Emails transacionais, templates React |
| Monitoramento | **Sentry** + **PostHog** | Erros + analytics de produto |
| CI/CD | **GitHub Actions** | Lint, testes, deploy automÃ¡tico |

---

## ðŸ—„ï¸ Modelo de Dados Detalhado

```sql
-- Multi-tenancy: cada firma Ã© um tenant
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

-- Clientes do escritÃ³rio
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
  signature_metadata_json, -- certificado, timestamp, cadeia de validaÃ§Ã£o
  lta_preserved, -- Long Term Archival flag
  tags, metadata_json, created_at
}

-- Time tracking (horas faturÃ¡veis)
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

-- Logs de auditoria IMUTÃVEIS
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

## ðŸŽ¨ Design System & UI/UX

### Identidade Visual

> [!IMPORTANT]
> Seguindo as regras do `frontend-specialist`: **Sem purple/violet. Sem layouts genÃ©ricos SaaS. Sem Glassmorphism.**

**Palavra-chave da marca:** *"ConfianÃ§a Estrutural"*

**EmoÃ§Ã£o-cor mapping (jurÃ­dico):**
- PrimÃ¡ria: **Deep Navy** `#0F1D3A` â€” autoridade, confianÃ§a, seriedade
- Acento: **Amber/Gold** `#D4A853` â€” justiÃ§a, valor, premium
- AÃ§Ã£o: **Signal Green** `#1A7F5A` â€” confirmaÃ§Ã£o, aprovaÃ§Ã£o, sucesso
- Alerta: **Deep Red** `#C0392B` â€” urgÃªncia, prazo, atenÃ§Ã£o
- Neutro: **Slate** `#F8F9FA` â€” espaÃ§o limpo, foco no conteÃºdo

**Tipografia:**
- Display: **Playfair Display** (serif) â€” para tÃ­tulos jurÃ­dicos, autoridade
- Body: **Inter** (sans-serif) â€” legibilidade mÃ¡xima em texto denso
- Code/ReferÃªncias: **JetBrains Mono** â€” referÃªncias legais, nÃºmeros de processo

**Geometria:** Sharp (0-2px border-radius para cards jurÃ­dicos), sem elementos "amigÃ¡veis" â€” transmite rigor.

### Fluxos de Utilizador Principais

```
1. ONBOARDING
   Registo â†’ ConfirmaÃ§Ã£o email â†’ Setup firma/tenant â†’ Convite equipa â†’ Tour guiado

2. INTAKE DE CLIENTE
   Novo Cliente â†’ FormulÃ¡rio â†’ Conflict Check automÃ¡tico â†’ Portal link para cliente â†’ KYC digital

3. GESTÃƒO DE MATTER
   Novo Processo â†’ AtribuiÃ§Ã£o â†’ Agenda de prazos â†’ Upload documentos â†’ Time tracking â†’ FaturaÃ§Ã£o

4. ASSINATURA DIGITAL QES
   Documento â†’ Escolher signatÃ¡rio â†’ Via CMD ou CartÃ£o de CidadÃ£o â†’ ValidaÃ§Ã£o â†’ LTA preservation

5. PESQUISA IA JURÃDICA
   Query em linguagem natural â†’ RAG sobre DRE + JurisprudÃªncia â†’ Resposta com citaÃ§Ãµes verificÃ¡veis
```

### PÃ¡ginas Core

| PÃ¡gina | Rota | DescriÃ§Ã£o |
|--------|------|-----------|
| Dashboard | `/app` | KPIs, agenda, tarefas urgentes |
| Clientes | `/app/clients` | Lista, search, ficha de cliente |
| Processos | `/app/matters` | Kanban/lista, filtros por tipo/status |
| Matter Detail | `/app/matters/[id]` | Timeline, documentos, horas, notas |
| Documentos | `/app/documents` | GestÃ£o global, versionamento |
| Tempo/FaturaÃ§Ã£o | `/app/billing` | Time tracking, faturas |
| Pesquisa IA | `/app/ai-search` | Chat com jurisprudÃªncia |
| Portal Cliente | `/portal/[token]` | Acesso seguro externo |
| Admin/Settings | `/settings` | RBAC, firma, integraÃ§Ãµes |

---

## ðŸ”’ SeguranÃ§a & Compliance

> Agente ativo: `security-auditor` â€” "Assume breach. Trust nothing. Verify everything."

### OWASP Top 10 â€” MitigaÃ§Ãµes EspecÃ­ficas para Advocatus IA

| Risco | MitigaÃ§Ã£o |
|-------|-----------|
| **A01** Broken Access Control | Row-Level Security (RLS) Supabase. Cada query filtra por `tenant_id`. RBAC granular. |
| **A02** Misconfiguration | Helmet.js, CSP headers, CORS restrito. Segredos em Vault/env seguras. Scanner automÃ¡tico. |
| **A03** Supply Chain | `lockfiles` versionados. `npm audit` em CI. Dependabot. Sem deps sem manutenÃ§Ã£o. |
| **A04** Cryptographic Failures | AES-256 at-rest. TLS 1.3 em trÃ¢nsito. Prisma Field Encryption para dados sensÃ­veis. Bcrypt/Argon2 para passwords. |
| **A05** Injection | Prisma ORM (sem SQL raw). Zod validation em todas as entradas. Parameterized queries. |
| **A07** Auth Failures | MFA obrigatÃ³rio para roles `socio` e `admin`. JWT com expiraÃ§Ã£o curta + refresh tokens. Rate limiting em auth endpoints. |

### RGPD â€” Requisitos EspecÃ­ficos

- [ ] Registo de consentimento explÃ­cito (data, IP, versÃ£o da polÃ­tica)
- [ ] Direito ao apagamento implementado (soft delete + anonimizaÃ§Ã£o)
- [ ] ExportaÃ§Ã£o de dados do cliente em formato legÃ­vel (JSON/PDF)
- [ ] DPO (Data Protection Officer) nomeado antes do lanÃ§amento
- [ ] DPIA (Data Protection Impact Assessment) documentado
- [ ] Contratos de processamento de dados com todos os sub-processadores (Supabase, Vercel, OpenAI)

### Assinaturas Digitais â€” Fluxo de IntegraÃ§Ã£o

```
NÃ­vel 1 (SES): Clique "Aceito" â†’ log de IP + timestamp â†’ valor probatÃ³rio limitado
NÃ­vel 2 (AES): Email/SMS OTP + PDF com hash â†’ para documentos internos
NÃ­vel 3 (QES): IntegraÃ§Ã£o AutenticaÃ§Ã£o.gov (CMD/CC) â†’ para mandatos, contratos formais
PreservaÃ§Ã£o: Formato LTA com selo temporal qualificado apÃ³s cada assinatura
Entidade: MULTICERT (QTSP na EU Trusted List)
```

---

## ðŸ¤– Camada de IA â€” Arquitetura Detalhada

### O Problema Central (CrÃ­tico)

> [!WARNING]
> **Risco ROSS Intelligence:** Usar dados jurÃ­dicos sem licenÃ§a para treinar IA Ã© ilegal e pode resultar em processo. O Advocatus IA usa APENAS dados com licenÃ§a CC BY 4.0 ou Open Data.

### Fontes de Dados JurÃ­dicos PT â€” Mapeamento Real

> Fonte: `integracao_api_ministerio_justica_pt.md` + `integracao_inteligente_ecossistema_juridico_portugues.md`

| Fonte | API DisponÃ­vel | LicenÃ§a | O que dÃ¡ acesso |
|-------|--------------|---------|------------------|
| **dados.gov.pt** | âœ… CKAN `/api/action/datastore_search` | CC BY 4.0 | InsolvÃªncias, processos cÃ­veis, laborais, tutelares |
| **dados.justica.gov.pt** | âœ… CKAN (subdomÃ­nio) | CC BY 4.0 | Dados de JustiÃ§a estruturados |
| **DRE.pt** (DiÃ¡rio da RepÃºblica) | âœ… API + RSS | Open | Toda a legislaÃ§Ã£o consolidada |
| **CITIUS** (processos judiciais) | âŒ Sem API pÃºblica | N/A | Acesso apenas via UI para advogados com certificado OA + SIGNIUS |
| **IRN** (Registos/Notariado) | âŒ Proibido scraping | N/A | Scraping expressamente proibido |  
| **AutenticaÃ§Ã£o.gov** (CMD/CC) | âœ… SDK oficial | N/A | Assinaturas qualificadas QES |
| **MULTICERT** | âœ… API comercial | Contrato | Selos temporais, QES, LTA |

> [!CAUTION]
> **CITIUS sem API:** A integraÃ§Ã£o direta com o CITIUS para terceiros **nÃ£o Ã© possÃ­vel**. A soluÃ§Ã£o Ã© orientar o advogado a usar o CITIUS diretamente (com SIGNIUS + certificado OA) e importar manualmente as notificaÃ§Ãµes para o Advocatus IA.

> [!WARNING]
> **Licenciamento comercial:** Dados da JustiÃ§a sob CC BY 4.0 requerem **atribuiÃ§Ã£o e autorizaÃ§Ã£o prÃ©via para uso comercial ou modificaÃ§Ã£o**. Confirmar com a DGPJ antes de usar em produto pago.

### Pipeline RAG JurÃ­dico PortuguÃªs

```
INGESTÃƒO (Batch diÃ¡rio):
  dados.gov.pt (API CKAN, CC BY 4.0) â†’ NormalizaÃ§Ã£o â†’ Chunking (~512 tokens)
  â†’ Embedding (text-embedding-3-large) â†’ pgvector

  DRE.pt (API legislativa) â†’ Parser de diplomas â†’ Chunking semÃ¢ntico
  â†’ Embedding â†’ pgvector

QUERY (Real-time):
  Pergunta do advogado â†’ Query embedding
  â†’ Busca vetorial cosine similarity (top-10 chunks)
  â†’ Prompt engineering com contexto jurÃ­dico PT portuguÃªs
  â†’ GPT-4o/Claude 3.5 â†’ Resposta com citaÃ§Ãµes verificÃ¡veis
  â†’ ValidaÃ§Ã£o humana OBRIGATÃ“RIA (sem respostas automÃ¡ticas vinculativas)

GUARDRAILS OBRIGATÃ“RIOS:
  - Disclaimer: "OrientaÃ§Ã£o informativa, nÃ£o conselho jurÃ­dico vinculativo."
  - CitaÃ§Ãµes com link directo para fonte oficial (DRE, dados.gov.pt)
  - ConfianÃ§a score visÃ­vel (Alta/MÃ©dia/Baixa)
  - Logging imutÃ¡vel de todas as queries (audit trail)
  - Limite 128K tokens de contexto (GPT-4o)
```

### MCP Server â€” ImplementaÃ§Ã£o Base

> ReferÃªncia de implementaÃ§Ã£o: repositÃ³rio `agentic-ops/legal-mcp` (GitHub) como ponto de partida, adaptado para fontes portuguesas. Ver tambÃ©m `rgllm/awesome-portugal-data` para datasets PT.

```typescript
// Ferramentas MCP disponÃ­veis para o LLM (Advocatus IA):
tools: [
  { name: "search_dre",          description: "Pesquisa no DiÃ¡rio da RepÃºblica EletrÃ³nico" },
  { name: "search_jurisprudencia", description: "Pesquisa de acÃ³rdÃ£os por keywords" },
  { name: "get_insolvencias",     description: "Dados de insolvÃªncias via dados.justica.gov.pt" },
  { name: "get_processos_stats",  description: "EstatÃ­sticas de processos por tipo via DGPJ" },
  { name: "validate_nif",         description: "Valida NIF portuguÃªs" },
  { name: "get_matter_context",   description: "Contexto completo do processo actual" },
  { name: "search_legislacao",    description: "Pesquisa legislaÃ§Ã£o por Ã¡rea jurÃ­dica" }
]
```

---

## ðŸ“‹ Roadmap de ImplementaÃ§Ã£o

### MVP (Meses 1-3) â€” "Get to 10 paying clients"

**Goal:** Validar o produto com 10 escritÃ³rios piloto. Faturar â‚¬290-â‚¬790/mÃªs.

| Prioridade | Feature | Agente | Complexidade |
|-----------|---------|--------|--------------|
| P0 | Auth multi-tenant + RBAC + MFA | `security-auditor` + `backend-specialist` | Alta |
| P0 | Schema DB + Prisma migrations | `database-architect` | MÃ©dia |
| P0 | GestÃ£o de Clientes (CRUD + conflict check) | `backend-specialist` + `frontend-specialist` | MÃ©dia |
| P1 | GestÃ£o de Processos/Matters (CRUD + timeline) | `backend-specialist` + `frontend-specialist` | Alta |
| P1 | Upload e VisualizaÃ§Ã£o de Documentos | `backend-specialist` | MÃ©dia |
| P1 | Dashboard com KPIs bÃ¡sicos | `frontend-specialist` | MÃ©dia |
| P1 | GestÃ£o de Tarefas + Prazos + NotificaÃ§Ãµes email | `backend-specialist` | MÃ©dia |
| P2 | Time Tracking bÃ¡sico | `backend-specialist` | Baixa |
| P2 | GeraÃ§Ã£o de Faturas (draft) | `backend-specialist` | MÃ©dia |
| P2 | Portal do Cliente (read-only) | `frontend-specialist` | MÃ©dia |

**CritÃ©rio de saÃ­da do MVP:** 10 clientes pagantes ativos por 30 dias consecutivos.

---

### V1.0 (Meses 4-6) â€” "Produto completo bÃ¡sico"

| Feature | DescriÃ§Ã£o |
|---------|-----------|
| Assinatura Digital QES | IntegraÃ§Ã£o AutenticaÃ§Ã£o.gov (CMD + CartÃ£o de CidadÃ£o) |
| Pesquisa IA BÃ¡sica | RAG sobre DiÃ¡rio da RepÃºblica (fase 1) |
| ComunicaÃ§Ã£o Segura | Mensagens encriptadas com clientes |
| FaturaÃ§Ã£o Completa | IntegraÃ§Ã£o com AT (Autoridade TributÃ¡ria), PDF automÃ¡tico |
| VersÃ£o de Documentos | HistÃ³rico de versÃµes, diffs |
| RelatÃ³rios | Rentabilidade por matter, por advogado |
| App Mobile | PWA (nÃ£o app nativa) â€” para consulta rÃ¡pida |

---

### V2.0 (Meses 7-12) â€” "IA como diferenciador"

| Feature | DescriÃ§Ã£o |
|---------|-----------|
| IA Assistente Completa | MCP Server com todas as fontes PT (DRE, dados.justica.gov.pt) |
| AutomaÃ§Ã£o de Templates | GeraÃ§Ã£o de peÃ§as processuais com IA + revisÃ£o humana obrigatÃ³ria |
| Jurimetria | Analytics preditivo: probabilidade de sucesso, tempo estimado |
| Monitor CITIUS (manual) | O advogado usa o CITIUS com o seu certificado OA + SIGNIUS; importa notificaÃ§Ãµes para o Advocatus IA por upload ou copy-paste assistido por IA |
| Marketplace de Templates | Templates de peÃ§as jurÃ­dicas partilhados entre advogados |
| B2G/Enterprise | VersÃ£o para departamentos jurÃ­dicos de empresas e cÃ¢maras municipais |

> [!CAUTION]
> **CITIUS:** Sem API pÃºblica para terceiros (confirmado). Scraping de portais do IRN Ã© **expressamente proibido**. A integraÃ§Ã£o Ã© sempre assistida pelo humano (advogado exporta/copia â†’ Advocatus IA processa).

---

## ðŸ“ Estrutura de Ficheiros

```
advocatus-ia/
â”œâ”€â”€ apps/
â”‚   â”œâ”€â”€ web/                    # Next.js 15 (frontend)
â”‚   â”‚   â”œâ”€â”€ app/
â”‚   â”‚   â”‚   â”œâ”€â”€ (auth)/         # Login, registo, recuperaÃ§Ã£o password
â”‚   â”‚   â”‚   â”œâ”€â”€ (app)/          # Ãrea autenticada (advogados)
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ dashboard/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ clients/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ matters/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ documents/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ billing/
â”‚   â”‚   â”‚   â”‚   â”œâ”€â”€ ai-search/
â”‚   â”‚   â”‚   â”‚   â””â”€â”€ settings/
â”‚   â”‚   â”‚   â””â”€â”€ portal/         # Portal pÃºblico para clientes
â”‚   â”‚   â”œâ”€â”€ components/
â”‚   â”‚   â”‚   â”œâ”€â”€ ui/             # Design system base
â”‚   â”‚   â”‚   â”œâ”€â”€ matter/         # Componentes de processo
â”‚   â”‚   â”‚   â”œâ”€â”€ documents/      # Componentes de documentos
â”‚   â”‚   â”‚   â””â”€â”€ ai/             # Componentes de IA
â”‚   â”‚   â””â”€â”€ lib/
â”‚   â”‚       â”œâ”€â”€ supabase.ts
â”‚   â”‚       â””â”€â”€ api.ts
â”‚   â””â”€â”€ api/                    # NestJS (backend)
â”‚       â”œâ”€â”€ src/
â”‚       â”‚   â”œâ”€â”€ auth/           # Auth + RBAC + MFA
â”‚       â”‚   â”œâ”€â”€ tenants/        # Multi-tenancy
â”‚       â”‚   â”œâ”€â”€ clients/        # Clientes + conflict check
â”‚       â”‚   â”œâ”€â”€ matters/        # Processos
â”‚       â”‚   â”œâ”€â”€ documents/      # GestÃ£o documental + assinatura
â”‚       â”‚   â”œâ”€â”€ billing/        # Time tracking + faturas
â”‚       â”‚   â”œâ”€â”€ tasks/          # Tarefas + prazos
â”‚       â”‚   â”œâ”€â”€ ai/             # RAG + MCP + LLM
â”‚       â”‚   â”œâ”€â”€ notifications/  # Email + push (BullMQ)
â”‚       â”‚   â””â”€â”€ audit/          # Logs imutÃ¡veis
â”‚       â””â”€â”€ prisma/
â”‚           â””â”€â”€ schema.prisma
â”œâ”€â”€ packages/
â”‚   â”œâ”€â”€ shared-types/           # TypeScript types partilhados
â”‚   â”œâ”€â”€ ui-kit/                 # Design system (Storybook)
â”‚   â””â”€â”€ legal-data-fetcher/    # IngestÃ£o DRE + dados.gov.pt
â”œâ”€â”€ docs/
â”‚   â””â”€â”€ PLAN-advocatus-ia.md    # Este ficheiro
â””â”€â”€ .agent/                     # Sistema de agentes IA do dev
```

---

## âœ… Task Breakdown Detalhado

### ðŸ”´ FASE 0: FundaÃ§Ã£o (Semana 1)

#### Task 001 â€” Setup Monorepo
- **Agente:** `devops-engineer`
- **Skill:** `nodejs-best-practices`
- **INPUT:** Requisitos de projeto
- **OUTPUT:** Turborepo + pnpm workspace configurado com `apps/web`, `apps/api`, `packages/`
- **VERIFY:** `pnpm build` em todos os pacotes passa sem erros
- **Rollback:** Git reset

#### Task 002 â€” Schema Prisma + Supabase
- **Agente:** `database-architect`
- **Skill:** `database-design`, `prisma-expert`
- **INPUT:** Modelo de dados deste documento
- **OUTPUT:** `schema.prisma` completo + migrations + RLS policies no Supabase
- **VERIFY:** `prisma migrate dev` corre sem erros. Seed com dados de teste.
- **Rollback:** `prisma migrate reset`

#### Task 003 â€” Auth + RBAC + MFA
- **Agente:** `security-auditor` + `backend-specialist`
- **Skill:** `vulnerability-scanner`, `api-patterns`
- **INPUT:** Roles definidos (socio, advogado, estagiario, secretaria, cliente, admin)
- **OUTPUT:** Supabase Auth + MFA obrigatÃ³rio para roles crÃ­ticos + middleware RBAC no NestJS
- **VERIFY:** Teste: utilizador sem role adequado recebe 403. MFA obrigado no login de socio.
- **Rollback:** Desativar middleware, restaurar policies

---

### ðŸŸ  FASE 1: Core Features (Semanas 2-6)

#### Task 004 â€” API de Clientes + Conflict Check
- **Agente:** `backend-specialist`
- **INPUT:** Schema `clients` + regras de conflict of interest
- **OUTPUT:** `POST /clients`, `GET /clients`, `GET /clients/:id`, `PUT /clients/:id`, `DELETE /clients/:id` + endpoint `POST /clients/conflict-check`
- **VERIFY:** Teste: criar 2 clientes com parts opposing â†’ conflict check retorna positivo

#### Task 005 â€” API de Matters/Processos
- **Agente:** `backend-specialist`
- **INPUT:** Schema `matters` + tipos de processo PT
- **OUTPUT:** CRUD completo + endpoint para alteraÃ§Ã£o de status + timeline de eventos
- **VERIFY:** Criar matter, adicionar documento, verificar timeline

#### Task 006 â€” GestÃ£o Documental
- **Agente:** `backend-specialist`
- **Skill:** `api-patterns`
- **INPUT:** Schema `documents` + Supabase Storage
- **OUTPUT:** Upload seguro (pre-signed URLs), versionamento, metadados, associaÃ§Ã£o a matters
- **VERIFY:** Upload de PDF 10MB, verificar integridade, versionar, confirmar acesso apenas para utilizadores do tenant

#### Task 007 â€” UI Dashboard + Matters (Frontend)
- **Agente:** `frontend-specialist`
- **Skill:** `frontend-design`, `tailwind-patterns`
- **INPUT:** Design system definido neste documento (Navy + Amber, Sharp geometry)
- **OUTPUT:** Dashboard com KPIs, lista de matters com filtros, ficha de matter com timeline
- **VERIFY:** Lighthouse score > 90. Testes Playwright nos fluxos crÃ­ticos.

#### Task 008 â€” Time Tracking + FaturaÃ§Ã£o
- **Agente:** `backend-specialist` + `frontend-specialist`
- **INPUT:** Schema `time_entries` + `invoices`
- **OUTPUT:** Timer de sessÃ£o, registo manual de horas, geraÃ§Ã£o de fatura em PDF
- **VERIFY:** Registar 3 horas em matter, gerar fatura, verificar total correto

#### Task 009 â€” Sistema de NotificaÃ§Ãµes & Prazos
- **Agente:** `backend-specialist`
- **Skill:** `nodejs-best-practices`
- **INPUT:** Schema `tasks` + BullMQ + Resend
- **OUTPUT:** Cron job para verificar prazos, envio de email 7 dias + 1 dia antes, push notification
- **VERIFY:** Criar task com prazo 7 dias â†’ email enviado imediatamente ao testar. Criar task urgente â†’ email no mesmo dia.

---

### ðŸŸ¡ FASE 2: V1.0 Features (Semanas 7-12)

#### Task 010 â€” Assinatura Digital QES (AutenticaÃ§Ã£o.gov)
- **Agente:** `backend-specialist` + `security-auditor`
- **Skill:** `api-patterns`, `vulnerability-scanner`
- **INPUT:** DocumentaÃ§Ã£o API AutenticaÃ§Ã£o.gov (CMD) + MULTICERT
- **OUTPUT:** Fluxo completo de assinatura QES com validaÃ§Ã£o LTA, endpoint `POST /documents/:id/sign`
- **VERIFY:** Assinar documento com CMD de teste â†’ verificar certificado, timestamp, cadeia de validaÃ§Ã£o
- **Nota:** Requer conta de desenvolvimento em AutenticaÃ§Ã£o.gov (Portugal)

#### Task 011 â€” Pesquisa IA (RAG BÃ¡sico)
- **Agente:** `backend-specialist`
- **Skill:** `api-patterns`, `mcp-builder`
- **INPUT:** API DRE.pt + dados.gov.pt (CC BY 4.0)
- **OUTPUT:** Pipeline de ingestÃ£o + endpoint `POST /ai/search` + UI de chat jurÃ­dico
- **VERIFY:** Query "quais os requisitos da lei do arrendamento urbano?" retorna resposta com citaÃ§Ã£o verificÃ¡vel
- **Guardrail:** Toda resposta inclui disclaimer obrigatÃ³rio

#### Task 012 â€” Portal Seguro do Cliente
- **Agente:** `frontend-specialist`
- **INPUT:** Schema `messages` (encriptadas) + portal route
- **OUTPUT:** Portal via token Ãºnico, visualizaÃ§Ã£o de documentos, comunicaÃ§Ã£o encriptada
- **VERIFY:** Token expirado â†’ acesso negado. Token vÃ¡lido â†’ documentos visÃ­veis apenas do matter associado.

---

### ðŸŸ¢ FASE X: VerificaÃ§Ã£o Final (Antes de cada release)

```bash
# P0: SeguranÃ§a
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

**CritÃ©rios de aceitaÃ§Ã£o:**
- [ ] Zero vulnerabilidades crÃ­ticas ou altas
- [ ] Lighthouse > 90 em Performance, Acessibilidade e SEO
- [ ] Cobertura de testes > 70%
- [ ] Sem erros TypeScript em modo strict
- [ ] RGPD checklist completo
- [ ] Auditoria de assinaturas digitais completa

---

## ðŸ“ˆ KPIs & MÃ©tricas de Sucesso

### MÃ©tricas de Produto
| KPI | Baseline | Target 3 meses | Target 6 meses |
|-----|----------|----------------|----------------|
| Clientes ativos pagantes | 0 | 10 | 50 |
| MRR (Monthly Recurring Revenue) | â‚¬0 | â‚¬500 | â‚¬5.000 |
| NPS (Net Promoter Score) | - | >30 | >50 |
| Churn mensal | - | <5% | <3% |
| AdoÃ§Ã£o do Portal do Cliente | - | >40% dos matters | >70% |

### MÃ©tricas de OperaÃ§Ã£o JurÃ­dica (para clientes)
| KPI | Impacto esperado |
|-----|-----------------|
| Prazos perdidos | ReduÃ§Ã£o de >90% |
| Tempo para encontrar documento | De minutos para segundos |
| Horas faturÃ¡veis recuperadas | +15-25% |
| Tempo em tarefas administrativas | ReduÃ§Ã£o de 40-60% |
| Incidentes de seguranÃ§a | Zero |

---

## âš ï¸ Riscos e MitigaÃ§Ãµes

| Risco | Probabilidade | Impacto | MitigaÃ§Ã£o |
|-------|---------------|---------|-----------|
| **API CITIUS sem acesso** (confirmado) | Certeza | MÃ©dio | Feature de importaÃ§Ã£o manual; orientar uso directo do CITIUS pelo advogado |
| API AutenticaÃ§Ã£o.gov nÃ£o disponÃ­vel p/ testes | Alta | Alto | Implementar sandbox/stub (mock QES) primeiro; conta dev na AMA |
| RegulamentaÃ§Ã£o IA jurÃ­dica (EU AI Act 2025) | MÃ©dia | Alto | Guardrails obrigatÃ³rios; disclaimer em todas as respostas IA |
| AdoÃ§Ã£o lenta (advocacia avessa Ã  mudanÃ§a â€” 42% ainda sem tech) | Alta | MÃ©dio | Onboarding guiado, formaÃ§Ã£o, suporte dedicado 60 dias, trial gratuito |
| Licenciamento comercial dados.gov.pt (CC BY 4.0) | MÃ©dia | Alto | Confirmar com DGPJ autorizaÃ§Ã£o prÃ©via para uso comercial antes do lanÃ§amento |
| ROSS-like: dados sem licenÃ§a para treino IA | Baixa | CrÃ­tico | Protocolo estrito: APENAS open data CC BY 4.0 ou licenÃ§a obtida |
| Fuga de dados sensÃ­veis de clientes | Baixa | CrÃ­tico | RLS Supabase + AES-256 + pentests semestrais + DPO nomeado |
| ConcorrÃªncia de players internacionais (Clio, MyCase) | MÃ©dia | MÃ©dio | Foco no mercado PT: lÃ­ngua, sistema jurÃ­dico, compliance eIDAS/RGPD, preÃ§o |
| Scraping IRN/Notariado (expressamente proibido) | Certeza | CrÃ­tico | Nunca fazer scraping de portais que o proÃ­bem expressamente â€” zero tolerÃ¢ncia |

---

## ðŸš€ Go-To-Market Strategy

### Fase 1: ValidaÃ§Ã£o (0-3 meses)
1. **Recrutar 10 beta testers** via Ordem dos Advogados, LinkedIn grupos jurÃ­dicos PT
2. **Oferecer 3 meses grÃ¡tis** para feedback estruturado
3. **Parceria piloto** com 1-2 escritÃ³rios mÃ©dios (5-15 advogados)
4. **MÃ©tricas de validaÃ§Ã£o:** NPS > 30, retorno no produto > 3x/semana

### Fase 2: Crescimento (3-12 meses)
1. **Content Marketing:** Blog jurÃ­dico sobre digitalizaÃ§Ã£o PT (SEO)
2. **Parceria OA:** ApresentaÃ§Ã£o em formaÃ§Ãµes da Ordem dos Advogados
3. **Programa de referral:** Desconto de 20% por advogado referenciado
4. **PresenÃ§a em eventos:** Portugal Legaltech Summit, Encontro Nacional de Advogados

---

## ðŸ“Œ PrÃ³ximos Passos Imediatos

### DecisÃµes Confirmadas âœ…
| QuestÃ£o | DecisÃ£o |
|---------|--------|
| Equipa tÃ©cnica | âœ… Equipa completa disponÃ­vel â€” avanÃ§ar imediatamente |
| Prioridade MVP | âœ… CRM jurÃ­dico + IA em simultÃ¢neo (diferenciador de mercado) |
| Conta AutenticaÃ§Ã£o.gov dev | â³ Viabilizar quando iniciar Fase 2 (meses 4-6) |
| Infra/Budget | Estimar ao iniciar setup (previsÃ£o: â‚¬200-500/mÃªs em fase MVP) |

### AcÃ§Ãµes Imediatas
1. âœ… **Plano aprovado** â€” iniciar implementaÃ§Ã£o
2. â¬œ **Setup de contas:** Supabase, Vercel, Railway, OpenAI API, GitHub
3. â¬œ **Correr `/create`** para iniciar o monorepo e estrutura base
4. â¬œ **Contactar DGPJ** para confirmar autorizaÃ§Ã£o uso comercial dados CC BY 4.0
5. â¬œ **Solicitar conta dev** AutenticaÃ§Ã£o.gov (AMA) para testes QES (Fase 2)

---



- [ ] Purple/violet ausente do design system
- [ ] Design Ãºnico, nÃ£o template SaaS genÃ©rico
- [ ] Socratic Gate respeitado: questÃµes abertas listadas
- [ ] Sem dados de treino IA sem licenÃ§a (ROSS-protection)
- [ ] RGPD checklist incluÃ­do
- [ ] eIDAS/QES compliance mapeado
- [ ] Stack MVP pragmÃ¡tica (sem Kubernetes no inÃ­cio)
- [ ] Modelo de pricing definido
- [ ] KPIs mensurÃ¡veis com baseline
- [ ] Riscos mapeados com mitigaÃ§Ãµes

---

*Criado por: `orchestrator` + `project-planner` + `backend-specialist` + `frontend-specialist` + `security-auditor` + `database-architect` + `product-owner`*
*Ãšltima atualizaÃ§Ã£o: MarÃ§o 2026*
## Task Status Update (2026-03-07)

| Task | Status | Branch |
|------|--------|--------|
| Task 006 — Gestão Documental | Done | `feature/phase1-integration` |
| Task 007 — UI Dashboard + Matters | Done | `feature/phase1-integration` |
| Task 008 — Time Tracking + Faturação | Done | `feature/phase1-integration` |
| Task 009 — Sistema de Notificações & Prazos | Done | `feature/phase1-integration` |
