# Advocatus IA — UI/UX Guidelines & Governance

> [!IMPORTANT]
> Este documento define os padrões de design obrigatórios para garantir a integridade da marca e a acessibilidade (WCAG AA) do Advocatus IA.

## 🎨 Paleta de Cores e Contraste

### 1. Cores Base (Navy & Amber)
- **Navy (Principal):** `#0a192f`. Usado como fundo global.
- **Amber (Ação):** `#ffaf29`. Usado para botões primários e destaques críticos.
- **Slate (Texto):** 
    - Ativo: `slate-100` ou `white`.
    - Muted: `slate-300`. **NUNCA use `slate-500` ou `slate-600` sobre fundos Navy.**

### 2. Regra de Ouro do Contraste (WCAG AA)
- Qualquer par de cores de texto/fundo deve ter um rácio de contraste de **pelo menos 4.5:1**.
- **Checklist:**
    - [ ] Placeholders: Mínimo 45% de opacidade (`text-white/45`).
    - [ ] Tabs Inativas: Mínimo `text-slate-300`.
    - [ ] Botões Primários: Texto escuro (`navy`) em fundo claro (`amber`).

## 📐 Componentes e Geometria
- **Cantos:** Usar `radius-sm` (4px) para botões de ação e `radius-md` (12px) para cards.
- **Efeito Glass:** Usar a classe `.glass-panel` para sidebars e modais. Evitar `bg-white` puro para não quebrar a estética premium dark.

## 🏛️ Fluxo de Governança
1. **Frontend:** Antes de submeter código, verificar contrastes com ferramentas de inspeção (ex: Lighthouse ou Contraste do Chrome).
2. **QA:** Auditoria visual obrigatória em todas as rotas principais em temas escuros e claros.
3. **Assinatura:** Qualquer nova cor fora da paleta `@theme` no `globals.css` deve ser aprovada pelo Arquiteto.

---
*Documento v1.0 — 17 de Março de 2026*
