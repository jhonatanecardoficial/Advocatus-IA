# Plano de Implementação - Task 018: Inteligência Jurídica (MCP)

Este plano descreve a integração do Advocatus IA com fontes de dados públicos da justiça portuguesa utilizando o Model Context Protocol (MCP).

## Objetivo
Potencializar a IA do Advocatus com acesso em tempo real a legislação (Diário da República), jurisprudência (DGSI/Justiça.gov.pt) e dados estatísticos judiciais.

## User Review Required
> [!IMPORTANT]
> A integração com o e-fatura via API oficial requer credenciais específicas da Autoridade Tributária. Para esta fase, focaremos na integração de dados públicos de legislação e jurisprudência.

## Proposed Changes

### 1. MCP Server - Jurídico [NEW]
Criar um servidor MCP dedicado para servir como "ponte" entre a IA e as fontes governamentais.

- **Componente**: `packages/mcp-legal-server` [NEW]
  - Implementar ferramentas (tools) para:
    - `search_legislation`: Consulta ao Diário da República Eletrónico.
    - `search_case_law`: Busca de jurisprudência em tribunais superiores (via DGSI).
    - `get_legal_stats`: Extração de dados estatísticos de `dados.justica.gov.pt`.

### 2. Backend (API)
Integrar o servidor MCP ao ecossistema NestJS/Prisma.

- **Arquivo**: `apps/api/src/ai/mcp.service.ts` [NEW]
  - Cliente para conexão com o servidor MCP Jurídico.
- **Arquivo**: `apps/api/src/ai/ai.module.ts` [MODIFY]
  - Registrar o novo serviço de MCP.

### 3. Frontend (Web)
Criar a interface para consulta e visualização de inteligência jurídica.

- **Componente**: `apps/web/components/intel/LegalIntelligenceDashboard.tsx` [NEW]
  - Dashboard interactivo com busca semântica em jurisprudência.
- **Página**: `apps/web/app/(dashboard)/intelligence/page.tsx` [NEW]
  - Rota principal para o módulo de inteligência.

## Verification Plan

### Automated Tests
- `npm test -w packages/mcp-legal-server`: Testes unitários das ferramentas de busca.
- `pnpm turbo build`: Garantir que a nova estrutura não quebra o monorepo.

### Manual Verification
- Testar a busca por um termo jurídico real (ex: "Cláusulas de mora em arrendamento") e verificar se a IA traz referências de legislação portuguesa.
