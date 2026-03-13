import { test, expect } from '@playwright/test';
import { setupTestContext, cleanupTestContext, TestContext } from './test-utils';

test.describe.serial('Time Entries API', () => {
    let ctx: TestContext;
    let matterId: string;
    let clientId: string;
    let timeEntryId: string;

    test.beforeAll(async () => {
        ctx = await setupTestContext();
    });

    test.afterAll(async () => {
        await cleanupTestContext(ctx);
    });

    test('Pré-requisito: Criar Client e Matter', async ({ request }) => {
        const uniqueNif = String(100000000 + Math.floor(Math.random() * 899999999));
        const clientRes = await request.post('/api/v1/clients', {
            headers: { 'Authorization': `Bearer ${ctx.token}` },
            data: {
                name: 'Teste Time Entries',
                nif: uniqueNif,
                type: 'SINGULAR'
            }
        });
        clientId = (await clientRes.json()).id;

        const matterRes = await request.post('/api/v1/matters', {
            headers: { 'Authorization': `Bearer ${ctx.token}` },
            data: {
                clientId: clientId,
                title: 'Teste Time Tracking',
                type: 'CIVEL',
                status: 'ATIVO'
            }
        });
        matterId = (await matterRes.json()).id;
    });

    test('Criar um Time Entry (POST /time-entries)', async ({ request }) => {
        const response = await request.post('/api/v1/time-entries', {
            headers: { 'Authorization': `Bearer ${ctx.token}` },
            data: {
                matter_id: matterId, // Leave matter_id here since CreateTimeEntrySchema expects matter_id! Wait! let me check create time entry schema!!
                description: 'Análise de documentação',
                hours: 2.5,
                rate_per_hour: 150,
                billable: true,
                activity_date: new Date().toISOString().split('T')[0]
            }
        });

        if (response.status() !== 201) {
            console.log(await response.text());
        }

        expect(response.status()).toBe(201);
        const data = await response.json();
        expect(data.description).toBe('Análise de documentação');
        expect(data.billable).toBe(true);
        timeEntryId = data.id;
    });

    test('Obter Time Entries por Matter (GET /time-entries/matter/:matterId)', async ({ request }) => {
        const response = await request.get(`/api/v1/time-entries/matter/${matterId}`, {
            headers: { 'Authorization': `Bearer ${ctx.token}` }
        });

        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(Array.isArray(data)).toBeTruthy();
        expect(data.length).toBeGreaterThanOrEqual(1);
    });

    test('Obter Summary de horas por Matter', async ({ request }) => {
        const response = await request.get(`/api/v1/time-entries/matter/${matterId}/summary`, {
            headers: { 'Authorization': `Bearer ${ctx.token}` }
        });

        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(data).toHaveProperty('total_hours');
        expect(data).toHaveProperty('entry_count');
        expect(data.total_hours).toBeGreaterThan(0);
    });

    test('Atualizar um Time Entry (PUT /time-entries/:id)', async ({ request }) => {
        const response = await request.put(`/api/v1/time-entries/${timeEntryId}`, {
            headers: { 'Authorization': `Bearer ${ctx.token}` },
            data: {
                hours: 3,
                description: 'Análise de documentação - Atualizada'
            }
        });

        expect(response.status()).toBe(200);
        const data = await response.json();
        expect(data.hours.toString()).toMatch(/^3(\.00)?$/); // Account for different Decimal string formats
    });

    test('Deletar um Time Entry (DELETE /time-entries/:id)', async ({ request }) => {
        const response = await request.delete(`/api/v1/time-entries/${timeEntryId}`, {
            headers: { 'Authorization': `Bearer ${ctx.token}` }
        });

        expect([200, 204]).toContain(response.status());
    });

    test('Erro ao criar Time Entry com hours inválidas', async ({ request }) => {
        const response = await request.post('/api/v1/time-entries', {
            headers: { 'Authorization': `Bearer ${ctx.token}` },
            data: {
                matter_id: matterId,
                description: 'Teste inválido',
                hours: 25, // Inválido: > 24
                activity_date: new Date().toISOString().split('T')[0]
            }
        });

        expect([400, 422]).toContain(response.status());
    });
});
