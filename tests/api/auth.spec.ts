import { test, expect } from '@playwright/test';
import { setupTestContext, cleanupTestContext, TestContext } from './test-utils';

test.describe.serial('Auth API', () => {
    let ctx: TestContext;

    test.beforeAll(async () => {
        ctx = await setupTestContext();
    });

    test.afterAll(async () => {
        await cleanupTestContext(ctx);
    });

    test('Validação do endpoint de Health', async ({ request }) => {
        const response = await request.get('/api/v1/auth/health');
        expect(response.status()).toBe(200);

        const body = await response.json();
        expect(body.status).toBe('ok');
        expect(body.timestamp).toBeDefined();
    });

    test('GET /auth/me retorna o perfil do utilizador autenticado', async ({ request }) => {
        const response = await request.get('/api/v1/auth/me', {
            headers: { 'Authorization': `Bearer ${ctx.token}` }
        });
        expect(response.status()).toBe(200);
        const body = await response.json();
        expect(body.data.email).toBeDefined();
        expect(body.data.tenantId).toBe(ctx.tenantId);
    });

    test('GET /auth/me sem token retorna 401', async ({ request }) => {
        const response = await request.get('/api/v1/auth/me');
        expect(response.status()).toBe(401);
    });
});
