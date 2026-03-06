import { test, expect } from '@playwright/test';
import { setupTestContext, cleanupTestContext } from './api/test-utils';

let ctx: Awaited<ReturnType<typeof setupTestContext>>;
let clientId: string;
let matterId: string;

test.describe('Processos (Matters) - UI e integração', () => {
  test.beforeAll(async () => {
    ctx = await setupTestContext();

    // Criar cliente via API
    const uniqueNif = String(100000000 + Math.floor(Math.random() * 899999999));
    const clientRes = await fetch('http://127.0.0.1:4000/api/v1/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ctx.token}` },
      body: JSON.stringify({ name: 'Teste Cliente para Matters', nif: uniqueNif, type: 'SINGULAR' }),
    });
    const clientData = await clientRes.json();
    clientId = clientData.id;

    // Criar matter via API
    const matterRes = await fetch('http://127.0.0.1:4000/api/v1/matters', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ctx.token}` },
      body: JSON.stringify({
        client_id: clientId,
        title: 'Teste Process Jurídico',
        type: 'CIVEL',
        status: 'ATIVO',
        opening_date: new Date().toISOString(),
      }),
    });
    const matterData = await matterRes.json();
    matterId = matterData.id;
  });

  test.afterAll(async () => {
    await cleanupTestContext(ctx);
  });

  test('deve renderizar a ficha de processo e exibir a timeline', async ({ page }) => {
    await page.context().addCookies([
      { name: 'access_token', value: ctx.token, domain: 'localhost', path: '/' },
    ]);

    await page.goto(`/matters/${matterId}`);

    // Validar título da página
    await expect(page.locator('h1')).toContainText('Teste Process Jurídico');

    // Validar status badge
    await expect(page.locator('text=Ativo')).toBeVisible();

    // Validar tipo de processo
    await expect(page.locator('text=Cível')).toBeVisible();

    // Validar timeline está visível
    await expect(page.locator('text=Linha do tempo')).toBeVisible();

    // Validar botão de editar
    await expect(page.locator('button:has-text("Editar")')).toBeVisible();
  });

  test('deve permitir editar o processo', async ({ page }) => {
    await page.context().addCookies([
      { name: 'access_token', value: ctx.token, domain: 'localhost', path: '/' },
    ]);

    await page.goto(`/matters/${matterId}`);

    // Clicar editar
    await page.locator('button:has-text("Editar")').click();

    // Modificar título
    const titleInput = page.locator('input[name="title"]');
    await titleInput.clear();
    await titleInput.fill('Processo atualizado via UI');

    // Salvar
    await page.locator('button:has-text("Salvar")').click();

    // Validar que foi salvo
    await expect(page.locator('h1')).toContainText('Processo atualizado via UI');
  });

  test('deve exibir sidebar com informações adicionais', async ({ page }) => {
    await page.context().addCookies([
      { name: 'access_token', value: ctx.token, domain: 'localhost', path: '/' },
    ]);

    await page.goto(`/matters/${matterId}`);

    // Validar seção de documentos
    await expect(page.locator('text=Documentos')).toBeVisible();
    await expect(page.locator('button:has-text("Anexar documentos")')).toBeVisible();

    // Validar seção de tempo
    await expect(page.locator('text=Tempo registado')).toBeVisible();
    await expect(page.locator('text=0h')).toBeVisible();

    // Validar link para cliente
    await expect(page.locator('a:has-text("Ver cliente")')).toBeVisible();
  });
});
