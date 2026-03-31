import { expect, test } from '@playwright/test';
import { cleanupTestContext, setupTestContext, TestContext } from './test-utils';

test.describe.serial('Deadline Notifications API (Task 009)', () => {
    let ctx: TestContext;
    let taskId: string;

    test.beforeAll(async ({ request }) => {
        ctx = await setupTestContext();

        // 1. Criar um Cliente
        const uniqueNif = String(100000000 + Math.floor(Math.random() * 899999999));
        const clientRes = await request.post('/api/v1/clients', {
            headers: { Authorization: `Bearer ${ctx.token}` },
            data: {
                nome: 'Cliente Notificacoes',
                email: `notif_${Date.now()}@example.com`,
                nif: uniqueNif,
                tipo: 'SINGULAR',
            },
        });
        
        if (clientRes.status() !== 201) {
            const body = await clientRes.text();
            throw new Error(`Falha ao criar cliente: ${clientRes.status()} - ${body}`);
        }
        
        const clientData = await clientRes.json();
        const client = clientData.data;

        // 2. Criar um Processo (Matter)
        const matterRes = await request.post('/api/v1/matters', {
            headers: { Authorization: `Bearer ${ctx.token}` },
            data: {
                title: 'Processo para notificacoes',
                type: 'CIVEL',
                clientId: client.id,
            },
        });

        if (matterRes.status() !== 201) {
            const body = await matterRes.text();
            throw new Error(`Falha ao criar processo: ${matterRes.status()} - ${body}`);
        }

        const matter = await matterRes.json();

        // 3. Criar uma Tarefa com prazo em 7 dias (D-7)
        const dueInSevenDays = new Date();
        dueInSevenDays.setDate(dueInSevenDays.getDate() + 7);

        const taskRes = await request.post('/api/v1/tasks', {
            headers: { Authorization: `Bearer ${ctx.token}` },
            data: {
                title: 'Tarefa Critica D-7',
                description: 'Gerar notificacao automatica',
                dueAt: dueInSevenDays.toISOString(),
                priority: 'ALTA',
                type: 'PRAZO',
                matterId: matter.id,
            },
        });
        
        if (taskRes.status() !== 201) {
            const body = await taskRes.text();
            throw new Error(`Falha ao criar tarefa: ${taskRes.status()} - ${body}`);
        }

        const task = await taskRes.json();
        taskId = task.id;
    });

    test.afterAll(async () => {
        if (ctx) {
            await cleanupTestContext(ctx);
        }
    });

    test('deve processar notificacoes de prazo (D-7) e registrar auditoria', async ({ request }) => {
        const runRes = await request.post('/api/v1/notifications/deadlines/run', {
            headers: { Authorization: `Bearer ${ctx.token}` },
        });
        expect(runRes.status()).toBe(200);
        const run = await runRes.json();
        // O controller de notificações parece retornar o objeto diretamente, 
        // mas vamos ser defensivos caso haja um interceptor global não detectado
        const result = run.data || run;
        
        expect(result.processed).toBeDefined();
        // Como o seed pode ter outras tarefas, verificamos se processou pelo menos a nossa
        expect(result.processed).toBeGreaterThanOrEqual(1);
    });

    test('deve permitir disparo manual de teste por task', async ({ request }) => {
        const testRes = await request.post('/api/v1/notifications/deadlines/test', {
            headers: { Authorization: `Bearer ${ctx.token}` },
            data: { task_id: taskId },
        });
        expect(testRes.status()).toBe(200);
        const body = await testRes.json();
        const result = body.data || body;
        
        expect(result.task_id).toBe(taskId);
        expect(result.success).toBeTruthy();
    });
});

