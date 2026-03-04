import { test, expect } from '@playwright/test';
import { setupTestContext, cleanupTestContext, TestContext } from './test-utils';

test.describe.serial('Clients API', () => {
    let ctx: TestContext;
    let clientId: string;

    test.beforeAll(async () => {
        ctx = await setupTestContext();
    });

    test.afterAll(async () => {
        await cleanupTestContext(ctx);
    });

    test('Criar um novo Cliente (POST /clients)', async ({ request }) => {
        const uniqueNif = String(100000000 + Math.floor(Math.random() * 899999999));
        const response = await request.post('/api/v1/clients', {
            headers: { 'Authorization': `Bearer ${ctx.token}` },
            data: {
                name: "João Silva",
                email: `joaosilva_${Date.now()}@example.com`,
                phone: "+351912345678",
                nif: uniqueNif,
                type: "SINGULAR"
            }
        });

        // Log para diagnosticar erros 500
        if (response.status() !== 201) {
            const errBody = await response.text();
            console.error(`POST /clients falhou com ${response.status()}: ${errBody}`);
        }

        expect(response.status()).toBe(201);
        const data = await response.json();
        expect(data.name).toBe("João Silva");
        expect(data.id).toBeDefined();
        clientId = data.id;
    });

    test('Listar Clientes (GET /clients)', async ({ request }) => {
        const response = await request.get('/api/v1/clients', {
            headers: { 'Authorization': `Bearer ${ctx.token}` }
        });

        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(Array.isArray(data.data)).toBeTruthy();
        expect(data.data.length).toBeGreaterThanOrEqual(1);
    });

    test('Obter um Cliente específico (GET /clients/:id)', async ({ request }) => {
        const response = await request.get(`/api/v1/clients/${clientId}`, {
            headers: { 'Authorization': `Bearer ${ctx.token}` }
        });

        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(data.id).toBe(clientId);
    });

    test('Erro 404 ao consultar Cliente inexistente', async ({ request }) => {
        const response = await request.get('/api/v1/clients/00000000-0000-0000-0000-000000000000', {
            headers: { 'Authorization': `Bearer ${ctx.token}` }
        });
        expect(response.status()).toBe(404);
    });

    test('Erro 401 ao aceder sem Token', async ({ request }) => {
        const response = await request.get('/api/v1/clients');
        expect(response.status()).toBe(401);
    });
});
