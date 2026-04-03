# 🚀 Upload Restoration + Security Hygiene

Esta Pull Request (PR) consolida a restauração funcional do sistema de **Upload de Documentos** e implementa uma higienização rigorosa de segurança no repositório **Advocatus IA**.

---

## 🏗️ O Que Foi Feito? (Resumo Técnico)

### 📁 1. Restauração do Upload de Documentos
- **Diagnóstico Local**: Resolvido o erro de `signature verification failed` causado por chaves de API e JWT desalinhadas no ambiente Supabase local.
- **Automação de Infraestrutura**: Criado o bucket `advocatus-documents` e as políticas de Storage RLS necessárias no Supabase local.
- **Utilitários de Configuração**: Adicionada a pasta `apps/api/scripts/supabase/` contendo ferramentas para sincronização dinâmica de chaves do CLI para os ficheiros `.env`.

### 🔐 2. Saneamento de Segurança & Higiene
- **Limpeza do Git Index**: Removidos ficheiros temporários de build e logs que estavam no rastreamento do Git.
- **Prevenção de Fugas**: Criados templates `.env.example` para documentar variáveis obrigatórias sem expor produção/dev local.
- **Reforço do `.gitignore`**: Atualizado para bloquear permanentemente qualquer lixo de sistema ou builds futuras.

---

## 🛠️ Novos Utilitários (apps/api/scripts/supabase/)
- `sync_keys.js`: Sincroniza as chaves do CLI para o backend.
- `generate_keys.js`: Ferramenta para gerir tokens de teste.
- `update_env.js`: Realiza o parcheamento seguro dos ficheiros de ambiente.

---

## 🧪 Validação Realizada
- [x] **Upload Test**: Documentos agora são submetidos com sucesso para o Storage.
- [x] **Audit**: Nenhum segredo crítico foi encontrado fora dos ficheiros ignorados.
- [x] **QA**: A API e o Frontend continuam operacionais com as chaves oficiais `sb_...`.

---

## 📄 Instruções de Validação
1. Checkout para a branch `fix/security-hygiene` (ou `main` após o merge).
2. Verifique os novos scripts em `apps/api/scripts/supabase/`.
3. Teste o upload de um ficheiro PDF na interface.

---
**Status da PR: PRONTA PARA MERGE FINAL**
