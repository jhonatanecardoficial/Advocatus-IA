# Walkthrough - Task 018: Inteligência Jurídica e Integração com Dados Públicos (MCP)

Este documento resume a implementação da inteligência jurídica no Advocatus IA, permitindo a consulta em tempo real de legislação, jurisprudência e dados fiscais portugueses.

## Mudanças Realizadas

### 1. Infraestrutura MCP (Model Context Protocol)
- **Novo Pacote**: Criado `@advocatus/mcp-legal-server` em `packages/mcp-legal-server`.
- **Servidor MCP**: Implementado servidor via `stdio` que fornece ferramentas para:
  - `search_legislation`: Pesquisa no Diário da República Eletrónico.
  - `search_case_law`: Pesquisa no portal DGSI (Tribunais Superiores).
  - `get_tax_info`: Preparado para integração com e-fatura (AT).
- **Configuração**: Adicionada configuração de ambiente para e-fatura nos ficheiros `.env` e `.env.example`.

### 2. Integração Backend (NestJS)
- **McpClientService**: Novo serviço que gere o ciclo de vida do subprocesso MCP e a comunicação entre o NestJS e o servidor jurídico.
- **Enriquecimento de IA**: O `AiService` foi atualizado para consultar automaticamente estas bases externas durante as pesquisas, enriquecendo o contexto do RAG com dados atualizados.

### 3. Frontend (Next.js)
- **Dashboard de Inteligência**: Criada a página `/intelligence` com um design premium e intuitivo.
  - **Tabs Inteligentes**: Separação visual entre visão global, leis, acórdãos e dados fiscais.
  - **Interação com IA**: Resultados integrados com pareceres consultivos gerados por IA.
  - **Guardar no Processo**: Funcionalidade preparada para arquivar descobertas relevantes diretamente nos assuntos (matters).

## Verificações Adicionais

### Build do Monorepo
- [x] `@advocatus/mcp-legal-server`: Compilado com sucesso.
- [x] `@advocatus/api`: Compilado com sucesso integrando o cliente MCP.
- [x] `@advocatus/web`: Middleware atualizado para proteger a rota `/intelligence`.

## Próximos Passos
- Implementar os scrapers reais ou integrar APIs pagas para o Diário da República e DGSI (atualmente com placeholders estruturados).
- Inserir as chaves da AT quando disponíveis para ativar a consulta e-fatura completa.
