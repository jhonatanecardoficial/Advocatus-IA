import { expect, test } from '@playwright/test';
import { cleanupTestContext, setupTestContext, TestContext } from './test-utils';

test.describe.serial('Invoices API (Task 008)', () => {
  let ctx: TestContext;
  let matterId: string;
  let invoiceId: string;

  test.beforeAll(async ({ request }) => {
    ctx = await setupTestContext();

    const uniqueNif = String(100000000 + Math.floor(Math.random() * 899999999));
    const clientRes = await request.post('/api/v1/clients', {
      headers: { Authorization: `Bearer ${ctx.token}` },
      data: {
        nome: 'Cliente Faturacao',
        email: `billing_${Date.now()}@example.com`,
        nif: uniqueNif,
        tipo: 'SINGULAR',
      },
    });
    const { data: client } = await clientRes.json();

    const matterRes = await request.post('/api/v1/matters', {
      headers: { Authorization: `Bearer ${ctx.token}` },
      data: {
        title: 'Matter para faturacao',
        status: 'ATIVO',
        clientId: client.id,
      },
    });
    const matter = await matterRes.json();
    matterId = matter.id;
  });

  test.afterAll(async () => {
    await cleanupTestContext(ctx);
  });

  test('deve gerar draft de fatura com horas + despesas + IVA', async ({ request }) => {
    await request.post('/api/v1/time-entries', {
      headers: { Authorization: `Bearer ${ctx.token}` },
      data: {
        matter_id: matterId,
        description: 'Revisao contratual',
        hours: 1.5,
        rate_per_hour: 100,
        billable: true,
        activity_date: new Date().toISOString().split('T')[0],
      },
    });

    await request.post('/api/v1/expenses', {
      headers: { Authorization: `Bearer ${ctx.token}` },
      data: {
        matter_id: matterId,
        description: 'Taxa de tribunal',
        category: 'TAXA_JUSTICA',
        amount: 50,
        billable: true,
        date: new Date().toISOString().split('T')[0],
      },
    });

    const draftRes = await request.post('/api/v1/invoices/draft', {
      headers: { Authorization: `Bearer ${ctx.token}` },
      data: { matter_id: matterId, vat_rate: 23 },
    });

    expect(draftRes.status()).toBe(201);
    const draft = await draftRes.json();
    expect(Number(draft.amount)).toBe(200);
    expect(Number(draft.total)).toBe(246);
    expect(Number(draft.breakdown.fees_subtotal)).toBe(150);
    expect(Number(draft.breakdown.expenses_subtotal)).toBe(50);
    expect(Number(draft.breakdown.vat_amount)).toBe(46);
    invoiceId = draft.id;
  });

  test('deve retornar detalhe da fatura e PDF draft previsivel', async ({ request }) => {
    const detailRes = await request.get(`/api/v1/invoices/${invoiceId}`, {
      headers: { Authorization: `Bearer ${ctx.token}` },
    });
    expect(detailRes.status()).toBe(200);
    const detail = await detailRes.json();
    expect(detail.id).toBe(invoiceId);
    expect(detail.reference).toMatch(/^(INV-|DRAFT-)/);

    const pdfRes = await request.get(`/api/v1/invoices/${invoiceId}/pdf`, {
      headers: { Authorization: `Bearer ${ctx.token}` },
    });
    expect(pdfRes.status()).toBe(200);
    const pdf = await pdfRes.json();
    expect(pdf.mime_type).toBe('application/pdf');
    expect(pdf.content_base64).toBeTruthy();
    expect(pdf.filename).toContain('-draft.pdf');
  });

  test('deve falhar para payload invalido e caso sem itens faturaveis', async ({ request }) => {
    const invalidRes = await request.post('/api/v1/invoices/draft', {
      headers: { Authorization: `Bearer ${ctx.token}` },
      data: { matter_id: 'invalid-id', vat_rate: 23 },
    });
    expect([400, 404]).toContain(invalidRes.status());

    const emptyMatterRes = await request.post('/api/v1/matters', {
      headers: { Authorization: `Bearer ${ctx.token}` },
      data: {
        title: 'Matter sem itens',
        status: 'ATIVO',
        clientId: (await (await request.get('/api/v1/clients', { headers: { Authorization: `Bearer ${ctx.token}` } })).json()).data[0].id,
      },
    });
    const emptyMatter = await emptyMatterRes.json();

    const noItemsRes = await request.post('/api/v1/invoices/draft', {
      headers: { Authorization: `Bearer ${ctx.token}` },
      data: { matter_id: emptyMatter.id, vat_rate: 23 },
    });
    expect(noItemsRes.status()).toBe(400);
  });
});
