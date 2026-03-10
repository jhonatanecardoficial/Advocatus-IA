# Implementação AI Search V2 & Audit Trail

Este documento detalha o plano de execução para o refinamento da funcionalidade de IA e implementação do sistema de auditoria e testes.

## 👥 Time Ativo
- `orchestrator`: Coordenação e fluxos Git.
- `backend-specialist`: Script de ingestão e lógica RAG.
- `security-auditor`: Logging de auditoria imutável (OWASP A09:2025).
- `frontend-specialist`: Refinamento da UI/UX de Chat.
- `test-engineer`: Cobertura de testes unitários e E2E.

## 🛠️ Task Breakdown

### 1. Pesquisa & Infra (Orchestrator)
- [x] Validar PRs abertos no GitHub para evitar conflitos (Check via Playwright: 1 PR aberto).
- [x] Criar branches: Mantido em `feature/ai-search-v2`.

### 2. Ingestão de Dados Legais (Backend)
- [x] Criar script `apps/api/src/ai/scripts/seed-legal-docs.ts`.
- [x] Implementar fetcher básico para DRE (Datasets NRAU e Código Civil incluídos).
- [x] Gerar embeddings e salvar na tabela `legal_documents` (Implementado com strategy de Fallback/Mock para desenvolvimento offline).

### 3. Auditoria de Segurança (Security)
- [x] Modificar `apps/api/src/ai/ai.service.ts` para integrar com `AuditLog`.
- [x] Garantir que queries e respostas sejam logadas através do novo `AuditModule`.

### 4. Refinamento UI (Frontend)
- [x] Adicionar estados de *empty* e *error* no chat.
- [x] Melhorar visualização das citações legais (Badge de fonte, links externos, modo Premium Navy + Amber).

### 5. Validação (Test Engineer)
- [x] Testes unitários para `AiService` (Configurado Jest e Ingestão de Testes).
- [x] Testes de integração API com Playwright (`tests/api/ai-search.spec.ts`).

> [!NOTE]
> **Estratégia de Mocking:** Devido aos placeholders no `.env`, o sistema foi configurado para detetar credenciais inválidas e fornecer respostas mockadas inteligentes, permitindo a continuidade do desenvolvimento do frontend e auditoria.

## 🏁 Critérios de Aceitação
- Tabela `legal_documents` populada.
- Log de auditoria gerado para cada busca.
- 0 erros de linting e tipagem.
- Testes passando.
