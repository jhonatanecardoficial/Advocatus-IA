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

---

## 🧪 Validação Realizada
- [x] **Audit**: Nenhum segredo crítico (chaves Cloud ou Senhas DB) foi encontrado nas pastas rastreadas.
- [x] **QA**: A API e o Frontend continuam operacionais por estarem a ler dos ficheiros `.env` locais (devidamente ignorados pelo Git).
- [x] **Storage**: Validei pessoalmente que o upload de documentos funciona com o bucket `advocatus-documents` criado localmente.

---

## 📄 Instruções de Validação
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
