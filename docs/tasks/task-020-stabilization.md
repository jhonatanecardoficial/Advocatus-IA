# Advocatus IA - Planeamento

## [x] Task 010: Assinatura Digital Qualificada (QES) - CC & CMD
- [x] Análise de requisitos (CC Middleware vs CMD OIDC)
- [x] Atualizar Implementation Plan com fluxos detalhados
- [x] Backend: Atualizar Schema Prisma (Modelo `SignedDocument`)
- [x] Backend: CRUD de Templates Jurídicos (Model, Service, Controller)
- [x] Backend: Integração com AiService para refinamento de peças
- [x] Frontend: Aba de Automação no MatteDetail
- [x] Frontend: Componente TemplateAutomationPanel (Seleção, Geração, IA)
- [x] Database: Sincronização via Prisma CLI (db push)
com Middleware Local (Porta 13894 para CC)
- [x] Frontend: Modal de assinatura com escolha CC/CMD
- [x] Frontend: Painel de documentos assinados (`SignedDocumentsPanel`)
- [x] Storage: Configurar Bucket Supabase para documentos assinados
- [x] Verificação: Fluxo completo de assinatura (Mock/Simulado)
- [x] PR e Merge: Consolidar alterações e realizar merge na main


---

## [x] Task 016: Faturação Certificada e SAF-T PT
- [x] Pesquisar requisitos técnicos para Software Certificado pela AT (Portaria n.º 144/2019)
- [x] Definir estrutura do ficheiro SAF-T PT (v1.04)
- [x] Criar Implementation Plan detalhado
- [x] Obter aprovação do Plano pelo Utilizador
- [x] Modificar Prisma Schema para incluir campos fiscais no Tenant
- [x] Sincronizar banco de dados (`db push`)
- [x] Atualizar `BillingService` com lógica de SAF-T real
- [x] Adicionar endpoints de exportação e detalhes do Tenant
- [x] Criar `SaftExportPanel.tsx` no frontend
- [x] Integrar painel na página de Faturação
- [x] Backend: Geração de PDF real com PDFKit e QRCode (Certificação AT)
- [x] Frontend: Refinamento da UI do painel de faturas (Premium design)
- [x] Verificação final: Fluxo completo de certificação e download de PDF
- [x] PR e Merge: Conflitos resolvidos e mesclagem na main concluída
- [x] Correção: Resolver erros de hidratação de console (SSR vs Client mismatch)

## [x] Task 017: Automação de Templates Jurídicos (Fase 2: Persistência e Exportação)
- [x] Versionamento: Criar branch `feature/legal-templates-persistence`
- [x] Backend: Implementar geração de PDF e integração com `DocumentsService`
- [x] Backend: Adicionar endpoints `/save-to-matter` e `/download-pdf`
- [x] Frontend: Ativar botões de ação no `TemplateAutomationPanel`
- [x] Verificação: Fluxo completo validado (Gerar -> IA Refine -> Save/PDF)

---

## [/] Task 018: Inteligência Jurídica e Integração com Dados Públicos (MCP)
- [/] Pesquisa: Identificar APIs disponíveis em `dados.justica.gov.pt` e `e-faturas`
- [ ] Backend: Implementar MCP Servers para consulta de legislação (Diário da República)
- [ ] Backend: Integração de busca semântica em dados públicos judiciais
- [ ] Frontend: Dashboard de "Precedentes e Inteligência de Mercado"

## [ ] Task 019: Workflow de Prazos e Notificações (Notificações Proativas)
- [ ] Backend: Motor de cálculo de prazos baseado no CPC Português
- [ ] Backend: Sistema de triggers para notificações externas (Push/Email)
- [ ] Frontend: Calendário interativo de prazos no Matter Detail

## [x] Task 020: Estabilização e Resolução de Débitos Técnicos (Task 000)
- [x] Fix: Resolver erro de reconhecimento de workspaces no build (via pnpm)
- [x] Fix: Corrigir erros de lint no Prisma e tipos do Express
- [x] Fix: Resolver conflitos de configuração no `.npmrc`
- [x] DB: Sincronizar Prisma Client (`npx prisma generate`)
- [x] Lint: Limpar avisos de variáveis não utilizadas no frontend (Bloqueadores de build)
- [x] Build: Validar build de `@advocatus/api` (Sucesso)
- [x] Build: Validar build de `@advocatus/web` (Sucesso)
- [x] Git: Criar PR #18 e consolidar estabilização

