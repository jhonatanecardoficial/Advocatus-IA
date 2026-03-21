# QA Audit Report - Advocatus IA

Este relatório documenta a execução dos testes de QA, validações de campos e integridade funcional.

## Resumo de Execução
- **Utilizador de Teste**: Arquiteto QA (`qa@advocatus.pt`)
- **Data**: 2026-03-20
- **Estado Geral**: 🟢 Funcional (Passou em 15/15 testes Playwright)
- **Validação E2E**: ✅ Sucesso (pnpm test:web)

---

## 1. Registo e Autenticação
| Funcionalidade | Resultado | Observações |
| :--- | :--- | :--- |
| Registo de Novo Escritório | Sucesso | Fluxo de 3 passos intuitivo. |
| Login / Logout | Sucesso | JWT Cookies corretamente configurados. |
| **Bug Identificado** | ✅ Resolvido | Nome dinâmico implementado com fallback em `TopNav.tsx`. |

---

## 2. Gestão de Clientes (CRUD & Validação)
| Campo / Teste | Resultado | Detalhes |
| :--- | :--- | :--- |
| Validação NIF (9 dígitos) | ✅ Resolvido | Feedback visual e desativação do botão implementados em `AddClientModal.tsx`. |
| Criação Cliente Singular | Sucesso | Testado com 'Joaquim Almeida', 'Maria Fernandes', 'Carlos Mendes'. |
| Criação Cliente Coletivo | Sucesso | Testado com 'Soluções Digitais Lda', 'Construtora do Norte SA'. |
| Alternância Singular/Coletivo | Sucesso | Layout ajusta labels dinamicamente. |

---

## 3. Lista de Clientes Criados (QA Test Data)
1. **Joaquim Almeida** - 123456789
2. **Soluções Digitais Lda** - 500123456
3. **Maria Fernandes** - 987654321
4. **Construtora do Norte SA** - 509876543
5. **Carlos Mendes** - 112233445
