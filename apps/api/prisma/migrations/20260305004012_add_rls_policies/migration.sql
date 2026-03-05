-- CreateIndex
CREATE INDEX "audit_logs_tenantId_idx" ON "audit_logs"("tenantId");

-- CreateIndex
CREATE INDEX "clients_tenantId_idx" ON "clients"("tenantId");

-- CreateIndex
CREATE INDEX "documents_tenantId_idx" ON "documents"("tenantId");

-- CreateIndex
CREATE INDEX "invoices_tenantId_idx" ON "invoices"("tenantId");

-- CreateIndex
CREATE INDEX "matters_tenantId_idx" ON "matters"("tenantId");

-- CreateIndex
CREATE INDEX "messages_tenantId_idx" ON "messages"("tenantId");

-- CreateIndex
CREATE INDEX "tasks_tenantId_idx" ON "tasks"("tenantId");

-- CreateIndex
CREATE INDEX "time_entries_tenantId_idx" ON "time_entries"("tenantId");

-- CreateIndex
CREATE INDEX "users_tenantId_idx" ON "users"("tenantId");

-- ==============================================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Segurança Multi-Tenant baseada no paradigma do database-design e NextJS+Supabase Architecture
-- ==============================================================================================

-- 1. Forçar Bloqueios Severos RLS nas tabelas principais:
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "clients" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "matters" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "documents" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "time_entries" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "messages" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "audit_logs" ENABLE ROW LEVEL SECURITY;

-- 2. Criar função auxiliar inteligente
-- Intercepta primariamente o current_setting do Node.js (Prisma Context Extension) para APIs REST customizadas (NestJS).
CREATE OR REPLACE FUNCTION public.get_current_tenant_id() RETURNS text AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_tenant_id', true), '');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Aplicar as Pólíticas de Isolamento FOR ALL (SELECT, INSERT, UPDATE, DELETE)
CREATE POLICY "tenant_isolation_users" ON "users" FOR ALL USING ("tenantId" = public.get_current_tenant_id());
CREATE POLICY "tenant_isolation_clients" ON "clients" FOR ALL USING ("tenantId" = public.get_current_tenant_id());
CREATE POLICY "tenant_isolation_matters" ON "matters" FOR ALL USING ("tenantId" = public.get_current_tenant_id());
CREATE POLICY "tenant_isolation_documents" ON "documents" FOR ALL USING ("tenantId" = public.get_current_tenant_id());
CREATE POLICY "tenant_isolation_time_entries" ON "time_entries" FOR ALL USING ("tenantId" = public.get_current_tenant_id());
CREATE POLICY "tenant_isolation_invoices" ON "invoices" FOR ALL USING ("tenantId" = public.get_current_tenant_id());
CREATE POLICY "tenant_isolation_tasks" ON "tasks" FOR ALL USING ("tenantId" = public.get_current_tenant_id());
CREATE POLICY "tenant_isolation_messages" ON "messages" FOR ALL USING ("tenantId" = public.get_current_tenant_id());
CREATE POLICY "tenant_isolation_audit_logs" ON "audit_logs" FOR ALL USING ("tenantId" = public.get_current_tenant_id());

-- Permissão global de leitura/escrita para a Role SUPERUSER/Service_Role (em caso de seeds ou backoffice do sistema interno)
-- NOTA: Isto não anula a restrição explícita para os tokens do Supabase REST API anon/authenticated.
