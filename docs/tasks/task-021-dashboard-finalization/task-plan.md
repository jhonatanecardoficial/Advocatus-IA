# Task 021 — Fecho e Estabilização do Dashboard

**Data:** 21 de Março de 2026  
**Branch:** `feature/dashboard-finalization`  
**PR:** Em criação  
**Status:** ✅ Implementado

---

## Objectivo

Consolidar e estabilizar o Dashboard do Advocatus IA, corrigindo todas as funcionalidades incompletas ou com comportamentos incorrectos identificadas na revisão final.

---

## PR Anterior

> A PR #20 (`feat: consolidação final e estabilização de QA`) foi mergiada com sucesso em 21/03/2026 às 00:32. Esta task é complementar e foca-se exclusivamente nas correções de UX/UI do Dashboard.

---

## Problemas Identificados e Resolvidos

| # | Componente | Problema | Solução | Estado |
|---|-----------|----------|---------|--------|
| 1 | `top-nav.tsx:112` | Iniciais do avatar incorrectas — apanhava as 2 primeiras letras em vez de 1ª+última | Função `getInitials()` — extrai índice `[0]` e `[parts.length-1][0]` | ✅ |
| 2 | `top-nav.tsx:83-88` | Campo de pesquisa sem funcionalidade (texto inactivo) | State `searchQuery` + handler `handleSearch` + redirect `router.push('/ai-search?q=...')` | ✅ |
| 3 | `top-nav.tsx:90-97` | Bell sem funcionalidade | Dropdown de notificações com alertas de prazos críticos da API `/reports/dashboard-metrics` | ✅ |
| 4 | `SidebarCards.tsx:59` | Data da Agenda hardcoded (`"13 DE MAR"`) | Função `formatTodayDate()` com `new Date()` dinâmica | ✅ |
| 5 | `SidebarCards.tsx:36-41` | Botão "Abrir Insights IA" sem link | Transformado em `<Link href="/intelligence">` | ✅ |
| 6 | `DashboardHeader.tsx:40-43` | Botão "Relatórios" sem rota | Transformado em `<Link href="/reports">` | ✅ |

---

## Detalhes da Implementação

### 1. Iniciais do Avatar (top-nav.tsx)

**Lógica anterior (com bug):**
```typescript
user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
// "João Do Santos Martins" → "JD" (2 primeiras palavras)
```

**Nova lógica (corrigida):**
```typescript
function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '??';
    const first = parts[0][0] ?? '';
    const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
    return (first + last).toUpperCase() || '??';
}
// "João Do Santos Martins" → "JM" ✅
// "Maria Silva" → "MS" ✅
// "Carlos" → "CA"... nota: apenas 1 nome → só 1 letra inicial + '' = 'C'
```

### 2. Pesquisa Global (top-nav.tsx)

```typescript
const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
        router.push(`/ai-search?q=${encodeURIComponent(searchQuery.trim())}`);
        setSearchQuery('');
    }
};
```

### 3. Notificações (top-nav.tsx)

- Consome `/api/v1/reports/dashboard-metrics`
- Mostra `fatalDeadlines` (vermelho) e `upcomingTasks` (âmbar)
- Dropdown com `AnimatePresence` e fechamento ao clicar fora

### 4. Data Dinâmica (SidebarCards.tsx)

```typescript
function formatTodayDate(): string {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const months = ['JAN','FEV','MAR',...];
    return `${day} DE ${months[now.getMonth()]}`;
}
```

### 5 & 6. Links de Navegação

- "Abrir Insights IA" → `<Link href="/intelligence">`
- "Ver Calendário Completo" → `<Link href="/tasks">` (já existia, mantido)
- "Relatórios" → `<Link href="/reports">`

---

## Ficheiros Modificados

| Ficheiro | Tipo | Descrição |
|----------|------|-----------|
| `apps/web/components/dashboard/top-nav.tsx` | MODIFY | Iniciais, pesquisa, notificações |
| `apps/web/components/dashboard/SidebarCards.tsx` | MODIFY | Data dinâmica, link Insights IA |
| `apps/web/components/dashboard/DashboardHeader.tsx` | MODIFY | Link Relatórios |

---

## Verificação Realizada

- [x] Lógica de `getInitials` testada para: "João Santos Martins" → "JM", "Maria Silva" → "MS"
- [x] Pesquisa com `encodeURIComponent` para suporte de caracteres especiais
- [x] Notificações com fallback silencioso em caso de erro de API
- [x] Data dinâmica com array de meses português (pt-PT)
- [x] Todos os links validados contra as rotas existentes no sidebar
