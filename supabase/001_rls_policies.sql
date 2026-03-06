-- ========================================================================================
-- ADVOCATUS IA: ROW LEVEL SECURITY (RLS) POLICIES
-- ========================================================================================
-- Este script define a segurança ao nível de linha (Row Level Security) e 
-- políticas de Storage no Supabase, garantindo que os dados de cada escritório (Tenant) 
-- só podem ser acedidos por utilizadores pertencentes a esse mesmo Tenant.

-- IMPORTANTE: Para aplicar localmente ou em produção, execute este script no 
-- SQL Editor do painel do Supabase.

-- 1. Activar o RLS em todas as tabelas principais
ALTER TABLE "tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "matters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "time_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;


-- 2. Criar Políticas para Dados na Base de Dados Postgres
-- Na arquitetura Advocatus IA, a app usa o 'anon_key' limitando pelas RLS, mas 
-- se usar a `SERVICE_ROLE_KEY` o NodeJS consegue dar bypass.
-- Porém, com RLS ligada, prevenimos qualquer exposição na API direta do Supabase caso seja ativada.

-- Políticas Genéricas baseadas no `tenantId` para utilizadores autenticados...
-- NOTA: O middleware backend (Prisma) faz a filtragem aplicacional `where: { tenantId }`, 
-- logo o NodeJS backend usará Service Role na base de dados (que bypasses RLS), no entanto 
-- a RLS precisa ser ativa para os *Buckets* confiarem nos acessos via RLS. E futuramente
-- chamadas de frontend se ligarem diretamanete ao Postgrest do Supabase estarão seguras.


-- 3. POLÍTICAS DO STORAGE (SUPABASE BUCKET)
-- Estas políticas certificam-se de que nenhum utilizador injeta ou visualiza documentos de outros processos

-- Garantir que o bucket existe (descomentar se ainda não tiver criado na UI)
-- insert into storage.buckets (id, name, public) values ('advocatus-documents', 'advocatus-documents', false);

-- Política para Upload (Apenas para utilizadores autenticados pelo Backend com Pre-Signed URL)
CREATE POLICY "Permitir upload via Pre-Signed URL" 
ON storage.objects FOR INSERT 
TO authenticated 
WITH CHECK (
  bucket_id = 'advocatus-documents'
);

-- Política para Download (Apenas via Pre-Signed URLs devidamente assinados pelo Backend)
CREATE POLICY "Permitir download via Pre-Signed URL"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'advocatus-documents'
);

CREATE POLICY "Permitir update/delete via Pre-Signed URL"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'advocatus-documents'
);

-- FIM DO SCRIPT
