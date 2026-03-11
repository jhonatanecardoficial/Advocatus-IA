# Task 009: Prazos e Notificações (Deadlines & Notifications)

## Contexto
Este documento descreve a implementação técnica da **Task 009** (Prazos Processuais e Notificações por Email). Esta tarefa é crítica para o MVP, pois garante que advogados não percam prazos fatais através de alertas no Dashboard e notificações automáticas via Resend.

## Escopo da Implementação

### 1. Backend (NestJS + Prisma)
- **Service (`NotificationsService`)**: Lógica para varredura de prazos (`runDeadlineSweep`) e envio via Resend API.
- **Controller (`NotificationsController`)**: Endpoints para executar varreduras manuais e disparar testes de integração.
- **Service (`TasksService`)**: Gestão de tarefas com atribuição de matters e utilizadores.

### 2. Frontend (Next.js - App Router)
- **Action (`tasks.ts`)**: Server Actions para criar e atualizar tarefas de forma segura.
- **Componente (`AddTaskModal`)**: Modal premium (Sharp Design) para agendamento rápido de prazos dentro doun detalhe do processo.
- **Integração no Dashboard**: Atualização visual dos cards de métricas (Prazos Fatais e Audiências) para refletir dados reais.

## Detalhes Técnicos

### Backend
- **Fluxo de Notificação**:
  1. Identificação de tarefas não concluídas com `dueAt` em D-7 ou D-1.
  2. Verificação de `AuditLog` para evitar duplicidade de envio nas últimas 24h.
  3. Envio de email formatado via [Resend](https://resend.com).
  4. Atualização da flag `notificationSent` na tarefa.

### Frontend
- **Action**: `createTaskAction` com revalidação de cache para o `/dashboard` e `/matters`.
- **UI**: Uso do sistema de design "Sharp/Net Geometry" com cores saturadas (Navy e Amber) e tipografia Inter/Playfair.

## Critérios de Aceitação
- [ ] Possibilidade de criar uma tarefa/prazo associado a um processo.
- [ ] Tarefas com `dueAt` preenchido devem aparecer nas métricas do Dashboard.
- [ ] Execução do sweep de notificações deve persistir logs de auditoria.
- [ ] Email de teste deve ser recebido com sucesso (dry-run mode se sem API key).

## Próximos Passos
- Integração das métricas reais no `DashboardPage`.
- Implementação de Cron Job (opcional no MVP, via endpoint `/run`).
