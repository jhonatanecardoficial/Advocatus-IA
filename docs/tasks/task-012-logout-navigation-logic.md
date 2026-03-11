# Task 012 - Confirmação de Saída e Lógica de Navegação

## Contexto
Melhorar a experiência de utilizador (UX/UI) e garantir o encerramento seguro e intuitivo de sessões, além de refinar a navegação principal através do logótipo da aplicação.

## Escopo
1. **Modal de Confirmação de Logout**:
   - Implementação de um componente centralizado com estética "Sharp/Net Geometry".
   - Botão de confirmação com estado de carregamento (*loading*).
   - Integração tanto na `Sidebar` como no `TopNav`.
2. **Lógica de Navegação do Logo**:
   - Comportamento dinâmico baseado na rota atual (`usePathname`).
   - Se fora do `/dashboard` -> Redirecionar para `/dashboard`.
   - Se já no `/dashboard` -> Realizar *smooth scroll* para o topo.
3. **Animações e Estética**:
   - Uso de animações premium (fade-in, zoom-in) via CSS utilitário em `globals.css`.
   - Remoção de qualquer cor violeta/roxo, mantendo Navy e Amber.

## Implementação Técnica
- **Contexto**: `LogoutProvider` em `apps/web/context/logout-context.tsx`.
- **Componente**: `LogoutModal` em `apps/web/components/dashboard/LogoutModal.tsx`.
- **Navegação**: Detecção de rota via `next/navigation`.

## Critérios de Aceitação
- [x] O logout exige confirmação explícita.
- [x] O logo no dashboard faz scroll suave para o topo.
- [x] O design respeita a geometria "Net" (cantos vivos/2px radius).
