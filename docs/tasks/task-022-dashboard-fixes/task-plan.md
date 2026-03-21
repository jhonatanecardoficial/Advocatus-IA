# Task 022 — Correções Pós-Feedback Dashboard

**Data:** 2026-03-21  
**Branch:** `feature/dashboard-fixes-022`  
**PR:** [#22](https://github.com/jhonatanecardoficial/Advocatus-IA/pull/22) — Mergiado (SHA: `7d30b1c0`)

---

## Problema 1: Iniciais `??` no Avatar

### Causa Raiz
O `top-nav.tsx` tentava ler o `accessToken` via `document.cookie`. O backend define o cookie como `HttpOnly: true` — os cookies HttpOnly são inacessíveis ao JavaScript do browser por design de segurança (RFC 6265). O fetch do `/auth/me` no cliente falhava com 401 silenciosamente, `user` ficava `null` → as iniciais calculadas eram `??`.

### Solução
Padrão **Server Component Props**: o `layout.tsx` foi tornado `async`, usa `cookies()` do Next.js para aceder ao cookie de forma segura no servidor, faz fetch de `/auth/me` com o token Bearer, e passa o `userName` resultante como prop ao `<TopNav>`.

```typescript
// layout.tsx (servidor)
async function fetchUserName(): Promise<string> {
    const token = (await cookies()).get("accessToken")?.value;
    const res = await fetch(`${API_URL}/auth/me`, { headers: { Authorization: `Bearer ${token}` } });
    return res.ok ? (await res.json()).data?.name ?? "Advogado" : "Advogado";
}
// → TopNav recebe userName via props, sem fetch no browser
```

A função `getInitials` em `top-nav.tsx` extrai a 1ª letra do 1º nome e a 1ª letra do último nome:
- `"João Santos Martins"` → `"JM"`
- `"Ana"` → `"A"`

---

## Problema 2: Pesquisa Global

### Causa
O input de pesquisa anterior redirecionava para `/ai-search?q=` — busca semântica de IA, não de registos do SaaS.

### Solução: `GlobalSearch.tsx` (componente novo)

| Aspecto | Detalhe |
|---------|---------|
| Debounce | 300ms — evita chamadas excessivas |
| Endpoints | `GET /clients?search=` + `GET /matters?search=` (em paralelo) |
| Resultados | Agrupados: 👤 Clientes / ⚖️ Processos |
| Navegação | Clicar → registo; Enter → `/search?q=` |
| UX | Animações Framer Motion, tecla Escape limpa |
| A11y | `aria-label` em todos os botões interactivos |

---

## Problema 3: Agenda com Dados Reais

### Causa
Eventos hardcoded em `SidebarCards.tsx`.

### Solução
`dashboard/page.tsx` inclui `GET /tasks` no `Promise.all` e filtra por `dueAt` == hoje:

```typescript
const todayStr = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"
todayTasks = tasks.filter(t => t.dueAt?.slice(0, 10) === todayStr).slice(0, 5);
```

`SidebarCards.tsx` passa a ser um componente controlado que recebe `todayTasks: TodayTask[]` via props. Se a lista estiver vazia, exibe "Sem eventos para hoje" com ícone ✅.

---

## Ficheiros Alterados

| Ficheiro | Tipo | Resumo |
|----------|------|--------|
| `app/(dashboard)/layout.tsx` | MODIFICADO | Async Server Component, busca `userName` |
| `app/(dashboard)/dashboard/page.tsx` | MODIFICADO | Busca `todayTasks`, passa ao SidebarCards |
| `components/dashboard/top-nav.tsx` | MODIFICADO | Props, `getInitials`, integra `GlobalSearch` |
| `components/dashboard/SidebarCards.tsx` | MODIFICADO | Props `todayTasks`, estado vazio |
| `components/dashboard/GlobalSearch.tsx` | CRIADO | Pesquisa global com dropdown em tempo real |
