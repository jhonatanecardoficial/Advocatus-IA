# PR: Fix Intelligence Search Auth & Contrast

## Objetivo
Corrigir falhas críticas na página "Inteligência Jurídica" (`/intelligence`) que impediam o acesso à pesquisa documental (erros 401) e resolver o contraste na caixa de input que deixava o texto invisível para o utilizador.

## Diferença Estratégica & Business Value

Foi estabilizada a definição entre as duas ferramentas de IA:
1. **Pesquisa Jurídica IA (`/ai-search`)**: *Assistente Interativo / Chat*. Focado em perguntas ráidas, resumos e elaboração de ideias (Agilidade).
2. **Inteligência Jurídica (`/intelligence`)**: *Motor de Investigação / RAG*. Focado em cruzamento de documentos oficiais (STJ, DGSI, Diário da República) devolvendo pareceres rígidos com citação exata das fontes e grau de relevância (Profundidade & Rigor).

## Alterações Técnicas Implementadas

### Frontend (`LegalIntelligenceDashboard.tsx`)
- **Contraste UI**: Adicionada a classe `text-slate-900` ao input de pesquisa, resolvendo o problema de texto invisível sobre o fundo `slate-50`.
- **Server Action Auth**: O `fetch` client-side direto para a API foi substituído pela chamada à Server Action `aiSearchAction`. 
  - *Motivo do Bug resolvido:* O middleware de segurança usava cookies `HttpOnly`, o que inviabilizava a extração do `accessToken` através de `document.cookie` no client-side para o cabeçalho Authorization.
  - *Solução:* A Server Action executa o pedido no backend do Next.js (Node), onde tem pleno acesso a `cookies().get('accessToken')`, repassando de forma segura a autenticação para o NestJS.

## Evidências
- Screenshot funcional do Input: `typing_codigo_civil_1774221101643.png` do Browser Subagent.
- Rota API funcional via Server Actions.

## Impacto
* Restabelecimento total da ferramenta de pesquisa documental avançada que estava inacessível devido às atualizações de segurança e auth de todo o sistema na Fase 4.

## Referências
* Task: #017 (Inteligência Jurídica)
* Branch: `feature/task-017-intelligence-page`
