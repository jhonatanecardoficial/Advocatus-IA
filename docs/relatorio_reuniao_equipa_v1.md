# 📅 Ponto de Situação — Advocatus IA (Reunião de Equipa Completa)

> **Data:** Março 2026  
> **Objetivo:** Visão panorâmica do projeto (Ideia → Arquitetura → Produto Final → Go-to-Market) para alinhamento de toda a equipa.

---

## 1. 💡 A Ideia e o Problema que Resolvemos
O **Advocatus IA** é uma plataforma SaaS de Gestão Jurídica + IA, criada especificamente para o **mercado português**.
*   **A Dor:** Advogados portugueses (especialmente escritórios solo/pequenos, que são 70-80% do mercado) perdem horas em gestão manual, perdem prazos, têm dificuldade em gerir documentos com validade legal e não usam tecnologia adequada (41.7% têm gap tecnológico direto).
*   **A Solução:** Uma plataforma que centraliza Clientes, Processos (*Matters*), Documentos (com integração de Assinatura Digital QES), Faturação e uma IA Jurídica (treinada em fontes oficiais como o *Diário da República* e *dados.gov.pt*) para apoiar a pesquisa e análise de peças processuais.

---

## 2. 🏛️ Arquitetura e Stack Tecnológica
A arquitetura foi desenhada para ser **pragmática para o MVP** e **escalável (Enterprise-ready)**, além de cumprir todos os requisitos rigorosos de segurança e RGPD (Lei n.º 58/2019 e eIDAS).

*   **Frontend (Site/App):** Next.js 15, React 19, Tailwind CSS v4. UI/UX "Trust & Authority" (Deep Navy `#0F1D3A` e Amber/Gold `#D4A853`), sem designs genéricos ou cores informais (banido o "purple SaaS").
*   **Backend (API):** Node.js 22 com NestJS (Modular) + BullMQ (para tarefas assíncronas como notificações de prazos).
*   **Base de Dados & Auth:** PostgreSQL (via Supabase) com Prisma ORM + pgvector para a IA. Autenticação via Supabase Auth com MFA obrigatório para advogados.
*   **Inteligência Artificial (RAG):** GPT-4o / Claude 3.5 com LangChain. **Decisão Crítica:** A IA só faz ingestão de bases de dados *Open Data* (CC BY 4.0) como *dados.gov.pt* e *DRE.pt* para evitar problemas legais de Direitos de Autor como o caso "ROSS Intelligence". Integramos via protocolo MCP.
*   **Assinatura Digital (QES):** Integração planeada com Autenticação.gov (Chave Móvel Digital / Cartão de Cidadão) e Multicert para garantir valor probatório pleno nos tribunais.

---

## 3. 🛠️ O que JÁ FOI FEITO (Estado Atual do Código)
O monorepo (Turborepo) está montado e de pé com a estrutura principal:

*   **Fundação do Backend (`apps/api`):** 
    *   Setup do NestJS com configuração do Prisma (`schema.prisma` desenhado para *Multi-tenancy* - cada escritório isolado).
    *   Módulos base já criados: `auth`, `tenants`, `clients`, `matters`, `tasks`.
*   **Fundação do Frontend (`apps/web`):**
    *   Setup do Next.js App Router com Tailwind v4.
    *   Landing page base criada (`app/page.tsx`).
    *   Páginas de autenticação (`login`, `register`) e esqueleto do `(dashboard)`.
*   **Ecossistema de Agentes (Antigravity Kit):**
    *   A nossa estrutura interna de Agentes (20 agentes e 36 skills) está definida no `.agent/ARCHITECTURE.md` para suportar o desenvolvimento contínuo com alta qualidade, auditorias de segurança e UX.
*   **Documentação Fundacional:**
    *   Temos os planos de implementação, relatórios de pesquisa de mercado e o mapeamento das leis de assinaturas digitais definidos na *root* e diretoria `docs/`.

---

## 4. 🚧 O que FAZER a Seguir (Próximos Passos)
Estamos na transição do "Setup" para a **FASE 1: Core Features do MVP**.

1.  **Fechar as APIs de Core Business (Backend):** Ligar os endpoints de *Conflict Check* (verificar se o escritório já representa a parte contrária), CRUD de Processos (*Matters*) e Gestão Documental com integração do Supabase Storage.
2.  **Construir o Dashboard e Fluxos do Advogado (Frontend):** Dar vida aos módulos de *Clients* e *Matters* no UI, focando numa experiência altamente profissional e ultra-rápida.
3.  **Implementar o Sistema de *Time Tracking*:** Essencial para que os advogados justifiquem honorários (Timer e registo de horas nas tarefas).
4.  **Integração IA (Setup Inicial):** Configurar o pipeline RAG para ingerir o Diário da República, preparando a barra de "Pesquisa Inteligente" no Dashboard.
5.  **Contas Dev Governamentais:** Solicitar a conta de testes à AMA (Agência para a Modernização Administrativa) para a integração das assinaturas via CMD.

---

## 5. 📈 O que MELHORAR (Desafios & Atenção Redobrada)
Onde não podemos falhar e o que devemos recalibrar:

*   **UI/UX (Prioridade Máxima):** O nosso site ainda é um esqueleto. Temos de garantir que a Landing Page e o Dashboard exalam "Premium" e "Confiança". O advogado português é tradicional e exigente; se o design parecer barato, não compram.
*   **Falsas Promessas na IA:** Temos de incluir guardrails rigorosos (Avisos do tipo: "A IA não substitui o conselho jurídico"). Se a IA der uma resposta errada ("alucinar") e o advogado usar no tribunal, perdemos o cliente e a reputação.
*   **Bloqueio CITIUS:** Já sabemos que *não há API pública para o CITIUS*. Por isso, não podemos vender uma "integração automática". A solução de melhoria é garantir fluxos de importação manual ultra-fáceis e focar nas outras dores (prazos, faturação, pesquisa dtrina).
*   **Segurança RGPD:** Reconfirmar auditorias de Row-Level Security (RLS) no Supabase. Os dados do Processo X do Cliente A nunca podem vazar acidentalmente para a conta B.

---

## 6. 🚀 Divulgação, Marketing e Go-To-Market
Como vamos chegar aos primeiros clientes e faturar?

### Fase 1: Validação & Piloto (Próximos 1 a 3 meses)
*   **Objetivo:** Angariar os **10 primeiros clientes (escritórios piloto)** e faturar os primeiros €500/mês.
*   **Ação:** Abordar grupos específicos no LinkedIn (Advogados Portugueses) e através de contactos da Ordem dos Advogados (OA), oferecendo um plano Piloto gratuito/descontado em troca de feedback pesado.

### Fase 2: Ganhar o Mercado Solo & Pequeno (Meses 3 a 12)
*   **O Alvo:** 70-80% do mercado nacional (Advogados a atuar sozinhos ou escritórios com <5 parceiros).
*   **O Preço:** Modelo SaaS claro (ex: €29/mês Solo, €79/mês Pequeno, €199/mês Office).
*   **Distribuição / Divulgação:**
    *   **Content Marketing (SEO):** Artigos sobre "Como cumprir o RGPD no escritório", "Assinatura Digital de Mandatos em 2026", atraindo advogados que procuram resolver dores reais.
    *   **Ordem dos Advogados:** Procurar ser oradores em eventos da OA sobre "Ética na IA Jurídica", posicionando a Advocatus IA como autoridade segura no tema.
    *   **Referral:** Programa onde o atual cliente recebe meses grátis se trouxer outro colega advogado.

---

---

## 7. 🚀 Progresso Recente (Março 2026 - Semana 2)

Atingimos marcos críticos na transição para a **Fase 2**:

*   **Portal do Cliente Base:** Implementado e funcional, permitindo visualização de documentos e chat seguro.
*   **AI Search V2:** Refinamento do RAG com citações legais e sistema de auditoria imutável concluído.
*   **Gerador de Proformas:** Funcionalidade de rascunhos de faturação e faturização de horas integrada no `MatterDetail`.
*   **Estabilização da API:** Resolvidos problemas de contexto de tenant e validação Zod, com 100% dos testes de core API a passar.

### Milestone 12 Setembro 2024: Portal e Estabilidade
- Debugging completo do ZodValidationPipe e PortalService.
- Testes de API (matters, clients, time-entries) a passar a 100%.

### Milestone 13 Março 2026: Configurações e Inteligência de Negócio
- Implementação da página de `/settings` (Escritório, Perfil, Equipa).
- Integração de Conflict Check (Conflito de Interesses) no registo de Clientes.
- Dashboard refinado com métricas reais em tempo real.
- Novo módulo de Relatórios com foco em Rentabilidade por Processo.

### Próximo Grande Marco:
Início da **Task 010 — Assinatura Digital QES**. Este será o nosso maior diferencial de "validade legal" no mercado português.
