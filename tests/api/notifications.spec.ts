import { expect, test } from '@playwright/test';
import { cleanupTestContext, setupTestContext, TestContext } from './test-utils';

test.describe.serial('Deadline Notifications API (Task 009)', () => {
  let ctx: TestContext;
  let taskId: string;

  test.beforeAll(async ({ request }) => {
    ctx = await setupTestContext();

    const uniqueNif = String(100000000 + Math.floor(Math.random() * 899999999));
    const clientRes = await request.post('/api/v1/clients', {
      headers: { Authorization: `Bearer ${ctx.token}` },
      data: {
        name: 'Cliente Notificacoes',
        email: `notify_${Date.now()}@example.com`,
        nif: uniqueNif,
        type: 'SINGULAR',
      },
    });
    const client = await clientRes.json();

    const matterRes = await request.post('/api/v1/matters', {
      headers: { Authorization: `Bearer ${ctx.token}` },
      data: {
        title: 'Matter para notificacoes',
        status: 'ATIVO',
        clientId: client.id,
      },
    });
    const matter = await matterRes.json();

    const dueInSevenDays = new Date();
    dueInSevenDays.setDate(dueInSevenDays.getDate() + 7);

    const taskRes = await request.post('/api/v1/tasks', {
      headers: { Authorization: `Bearer ${ctx.token}` },
      data: {
        matterId: matter.id,
        title: 'Prazo processual de teste',
        priority: 'ALTA',
        type: 'PRAZO',
        dueAt: dueInSevenDays.toISOString(),
        assignedToId: ctx.userId,
      },
    });
    const task = await taskRes.json();
    taskId = task.id;
  });

  test.afterAll(async () => {
    await cleanupTestContext(ctx);
  });

  test('deve processar notificacoes de prazo (D-7) e registrar auditoria', async ({ request }) => {
    const runRes = await request.post('/api/v1/notifications/deadlines/run', {
      headers: { Authorization: `Bearer ${ctx.token}` },
    });
    expect(runRes.status()).toBe(200);
    const run = await runRes.json();
    expect(run.processed).toBeGreaterThanOrEqual(1);
    expect(run.sent).toBeGreaterThanOrEqual(1);
  });

  test('deve ser idempotente para o mesmo dia (nao duplicar envio)', async ({ request }) => {
    const runRes = await request.post('/api/v1/notifications/deadlines/run', {
      headers: { Authorization: `Bearer ${ctx.token}` },
    });
    expect(runRes.status()).toBe(200);
    const run = await runRes.json();
    expect(run.skipped).toBeGreaterThanOrEqual(1);
  });

  test('deve permitir disparo manual de teste por task', async ({ request }) => {
    const testRes = await request.post('/api/v1/notifications/deadlines/test', {
      headers: { Authorization: `Bearer ${ctx.token}` },
      data: { task_id: taskId },
    });
    expect(testRes.status()).toBe(200);
    const body = await testRes.json();
    expect(body.task_id).toBe(taskId);
    expect(body.success).toBeTruthy();
  });
});
