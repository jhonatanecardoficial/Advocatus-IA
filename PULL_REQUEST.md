<<<<<<< HEAD
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
=======
# 🚀 Pull Request: Security Cleanup + Repository Hygiene

Esta Pull Request (PR) implementa uma higienização completa de segurança e estrutura no repositório **Advocatus IA**, eliminando riscos de exposição de credenciais e removendo ficheiros desnecessários que estavam a ser rastreados indevidamente pelo Git.

---

## 🔍 O Que Foi Feito?

### 🔐 1. Saneamento de Segurança
- **Identificação de Segredos**: Escaneamento rigoroso do código fonte por chaves API, tokens e senhas hardcoded. O projeto já segue boas práticas de `process.env`.
- **Prevenção de Fugas**: Criados ficheiros de template de configuração (`.env.example`) para a raiz e para o backend (`apps/api`), permitindo que novos desenvolvedores configurem o ambiente sem expor chaves reais.
- **Isolamento de Chaves**: Corrigi o problema de "Signature Verification Failed" sincronizando as chaves do Supabase Local (`sb_publishable_...` e `sb_secret_...`) e garantindo que estas nunca são commitadas.

### 🧼 2. Higienização do Repositório
- **Limpeza do Git Index**: Removidos ficheiros temporários de build (`apps/api/dist-temp/`) que foram rastreados por erro.
- **Atualização do `.gitignore`**: Adicionadas políticas para ignorar pastas de build temporárias (`dist-temp/`), logs e lixo de sistema, mantendo o repositório leve e profissional.

### 🧱 3. Versionamento Seguro
- **Branch Dedicada**: Todo o trabalho foi realizado na branch `fix/security-hygiene`.
- **Histórico Limpo**: Os commits seguem a convenção `fix:` e `chore:` para facilitar a auditoria.
>>>>>>> fix/security-hygiene

---

## 🧪 Validação Realizada
<<<<<<< HEAD
- [x] **Upload Test**: Documentos agora são submetidos com sucesso para o Storage.
- [x] **Audit**: Nenhum segredo crítico foi encontrado fora dos ficheiros ignorados.
- [x] **QA**: A API e o Frontend continuam operacionais com as chaves oficiais `sb_...`.
=======
- [x] **Audit**: Nenhum segredo crítico (chaves Cloud ou Senhas DB) foi encontrado nas pastas rastreadas.
- [x] **QA**: A API e o Frontend continuam operacionais por estarem a ler dos ficheiros `.env` locais (devidamente ignorados pelo Git).
- [x] **Storage**: Validei pessoalmente que o upload de documentos funciona com o bucket `advocatus-documents` criado localmente.
>>>>>>> fix/security-hygiene

---

## 📄 Instruções de Validação
<<<<<<< HEAD
1. Checkout para a branch `fix/security-hygiene` (ou `main` após o merge).
2. Verifique os novos scripts em `apps/api/scripts/supabase/`.
3. Teste o upload de um ficheiro PDF na interface.

---
**Status da PR: PRONTA PARA MERGE FINAL**
=======
1. Realize o checkout para a branch `fix/security-hygiene`.
2. Verifique se o seu ficheiro `apps/api/.env` continua lá (não foi apagado) e se agora existe um `apps/api/.env.example` vazio para referência.
3. Observe que o `git status` já não deve mostrar ficheiros na pasta `dist-temp`.

## ⚠️ Riscos e Observações
- **Chaves Locais**: As chaves `sb_...` configuradas para o dev local são rotativas. Certifique-se de as atualizar no seu `.env` pessoal caso o Supabase recomece (CLI).
- **History Wipe**: Se houve chaves de produção commitadas em branches anteriores ao meu trabalho, é recomendada a rotação dessas chaves no provedor cloud.

---

### 💡 Próximos Passos Sugeridos
- [ ] Implementar um script de pré-commit (`Husky`) que bloqueie segredos no código automaticamente.
- [ ] Centralizar a gestão de segredos num Vault em ambiente de staging/produção.

---
**Status da PR: PRONTA PARA MERGE (Squash and Merge recomendado)**
>>>>>>> fix/security-hygiene
