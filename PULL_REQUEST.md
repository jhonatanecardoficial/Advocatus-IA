# 🚀 Pull Request: Upload Restoration, Security Hygiene & Repository Cleanup

Esta Pull Request (PR) consolida a restauração funcional do sistema de **Upload de Documentos** e implementa uma higienização rigorosa de segurança no repositório **Advocatus IA**, eliminando riscos de exposição de credenciais e organizando a estrutura do projeto.

---

## 🏗️ O Que Foi Feito? (Resumo Técnico)

### 📁 1. Restauração do Upload de Documentos
- **Diagnóstico Local**: Resolvido o erro de `signature verification failed` causado por chaves de API/JWT desalinhadas no ambiente Supabase CLI local.
- **Sincronização de Chaves**: Atualizados os ficheiros `.env` (Raiz e Apps/Api) com as chaves oficiais geradas pelo Supabase local (`sb_publishable_...` e `sb_secret_...`).
- **Automação de Infraestrutura**: Criado o bucket `advocatus-documents` e configuradas as políticas de Storage RLS necessárias no Supabase local Hub.
- **Novos Utilitários (`apps/api/scripts/supabase/`)**:
    - `sync_keys.js`: Sincroniza dinamicamente as chaves do CLI para o backend.
    - `update_env.js`: Realiza o parcheamento seguro dos ficheiros de ambiente sem sobrescrever dados do utilizador.

### 🔐 2. Saneamento de Segurança & Higiene do Repositório
- **Identificação de Segredos**: Escaneamento rigoroso do código fonte. O projeto já segue boas práticas de `process.env`.
- **Limpeza do Git Index**: Removidos ficheiros temporários de build (`apps/api/dist-temp/`) que foram erroneamente rastreados.
- **Prevenção de Fugas**: Criados os ficheiros de template `.env.example` na raiz e no backend para padronizar configurações sem expor chaves reais.
- **Reforço do `.gitignore`**: Atualizado para bloquear permanentemente qualquer lixo de sistema, logs ou builds futuras.

---

## 🧪 Validação Realizada
- [x] **Upload Test**: Documentos agora são submetidos com sucesso para o Storage e persistem no banco de dados.
- [x] **Security Audit**: Nenhum segredo crítico (Cloud Keys ou Senhas DB) foi encontrado nas pastas rastreadas.
- [x] **QA**: A API e o Frontend estão perfeitamente sincronizados com as chaves oficiais do Supabase local.

---

## 📄 Instruções para Continuidade
1. **Verificação Local**: O `git status` agora deve estar limpo de ficheiros de lixo (como `dist-temp`).
2. **Novos Scripts**: Utilize `node apps/api/scripts/supabase/sync_keys.js` sempre que reiniciar o Supabase local para manter as chaves atualizadas nos ficheiros `.env`.
3. **Template de Ambiente**: Utilize os novos ficheiros `.env.example` quando precisar configurar novos ambientes de desenvolvimento.

---

## ⚠️ Observações Finais
- Os "3 ficheiros" ou commits que podem aparecer pendentes no seu plugin do GitHub são justamente estas alterações de higienização e os novos scripts de automação que foram consolidados localmente na branch `main`.
- **Recomendação**: Realize um `git push` para sincronizar o repositório central com este estado limpo e seguro.

---
**Status da PR: CONCLUÍDA E MERGEADA LOCALMENTE (Branch: main)**
