-- ==========================================
-- SETUP: Extensões, Triggers de Updated_At e Policies RLS (Role Level Security)
-- ==========================================

-- 1. Activar Extensões do Supabase / PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ==========================================
-- 2. Trigger Function Automático para updated_at
-- ==========================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger apenas se não existir nas tabelas que têm a coluna updated_at
DO $$ 
DECLARE
    t_name text;
BEGIN
    FOR t_name IN 
        SELECT table_name FROM information_schema.columns 
        WHERE column_name = 'updated_at' AND table_schema = 'public'
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS trigger_set_updated_at_%1$I ON public.%1$I;
            CREATE TRIGGER trigger_set_updated_at_%1$I
            BEFORE UPDATE ON public.%1$I
            FOR EACH ROW
            EXECUTE FUNCTION public.set_updated_at();
        ', t_name);
    END LOOP;
END $$;


-- ==========================================
-- 3. Habilitar RLS (Row Level Security) em Todas as Tabelas de Negócio
-- ==========================================
ALTER TABLE "public"."tenants" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."matters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."time_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."audit_logs" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "public"."legal_documents" ENABLE ROW LEVEL SECURITY;

-- Função utilitária para obter o tenant_id a partir do token JWT do utilizador actual
CREATE OR REPLACE FUNCTION public.tenant_id() RETURNS text AS $$
  SELECT NULLIF(current_setting('request.jwt.claims', true)::jsonb -> 'app_metadata' ->> 'tenantId', '');
$$ LANGUAGE sql STABLE;

-- 3.1 Policies para Tenants (Isolamento Básico Multy-Tenant)
CREATE POLICY "Isolamento de Tenant: Clientes" ON "public"."clients" FOR ALL USING ("tenantId" = public.tenant_id());
CREATE POLICY "Isolamento de Tenant: Matters" ON "public"."matters" FOR ALL USING ("tenantId" = public.tenant_id());
CREATE POLICY "Isolamento de Tenant: Documents" ON "public"."documents" FOR ALL USING ("tenantId" = public.tenant_id());
CREATE POLICY "Isolamento de Tenant: Tarefas" ON "public"."tasks" FOR ALL USING ("tenantId" = public.tenant_id());
CREATE POLICY "Isolamento de Tenant: Time Entries" ON "public"."time_entries" FOR ALL USING ("tenantId" = public.tenant_id());
CREATE POLICY "Isolamento de Tenant: Invoices" ON "public"."invoices" FOR ALL USING ("tenantId" = public.tenant_id());
CREATE POLICY "Isolamento de Tenant: Messages" ON "public"."messages" FOR ALL USING ("tenantId" = public.tenant_id());
CREATE POLICY "Isolamento de Tenant: Users" ON "public"."users" FOR ALL USING ("tenantId" = public.tenant_id());

-- 3.2 Audit Logs - Somente Leitura e Escrita Append-Only
CREATE POLICY "Audit Logs são Append-Only" ON "public"."audit_logs" FOR INSERT WITH CHECK ("tenantId" = public.tenant_id());
CREATE POLICY "Leitura de Audit Logs por Tenant" ON "public"."audit_logs" FOR SELECT USING ("tenantId" = public.tenant_id());

-- 3.3 Legal Documents (Base de Conhecimento RAG partilhada globalmente)
-- Permite leitura de documentos públicos de IA a todos os utilizadores autenticados (ou seja, todos os tenants)
CREATE POLICY "Leitura de Doutrina/Leis Partilhadas Global" ON "public"."legal_documents" FOR SELECT USING (true);
