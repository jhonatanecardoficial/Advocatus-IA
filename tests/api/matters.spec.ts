import { test, expect } from '@playwright/test';
import { setupTestContext, cleanupTestContext, TestContext } from './test-utils';

test.describe.serial('Matters API', () => {
    let ctx: TestContext;
    let matterId: string;
    let clientId: string;

    test.beforeAll(async () => {
        ctx = await setupTestContext();
    });

    test.afterAll(async () => {
        await cleanupTestContext(ctx);
    });

    test('Pré-requisito: Criar um Cliente para anexar a um Matter', async ({ request }) => {
        const uniqueNif = String(100000000 + Math.floor(Math.random() * 899999999));
        const response = await request.post('/api/v1/clients', {
            headers: { 'Authorization': `Bearer ${ctx.token}` },
            data: {
                name: "Empresa XPTO Limitada",
                email: `empresa_${Date.now()}@example.com`,
                phone: "+351912345678",
                nif: uniqueNif,
                type: "COLETIVO"
            }
        });

        expect(response.status()).toBe(201);
        const data = await response.json();
        clientId = data.id;
    });

    test('Criar um novo Matter (POST /matters)', async ({ request }) => {
        const response = await request.post('/api/v1/matters', {
            headers: { 'Authorization': `Bearer ${ctx.token}` },
            data: {
                title: "Processo Civil de Dívida",
                description: "Cobrança de faturas em atraso",
                status: "ATIVO",
                clientId
            }
        });

        expect(response.status()).toBe(201);
        const data = await response.json();
        expect(data.title).toBe("Processo Civil de Dívida");
        expect(data.status).toBe("ATIVO");
        expect(data.id).toBeDefined();
        matterId = data.id;
    });

    test('Listar Matters (GET /matters)', async ({ request }) => {
        const response = await request.get('/api/v1/matters', {
            headers: { 'Authorization': `Bearer ${ctx.token}` }
        });

        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(Array.isArray(data.data)).toBeTruthy();
        expect(data.data.length).toBeGreaterThanOrEqual(1);
    });

    test('Obter um Matter específico (GET /matters/:id)', async ({ request }) => {
        const response = await request.get(`/api/v1/matters/${matterId}`, {
            headers: { 'Authorization': `Bearer ${ctx.token}` }
        });

        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(data.id).toBe(matterId);
        expect(data.title).toBe("Processo Civil de Dívida");
    });

    test('Erro 404 ao consultar Matter inexistente', async ({ request }) => {
        const response = await request.get('/api/v1/matters/00000000-0000-0000-0000-000000000000', {
            headers: { 'Authorization': `Bearer ${ctx.token}` }
        });
        expect(response.status()).toBe(404);
    });

    test('Erro 401 ao aceder Matters sem Token', async ({ request }) => {
        const response = await request.get('/api/v1/matters');
        expect(response.status()).toBe(401);
    });
});
