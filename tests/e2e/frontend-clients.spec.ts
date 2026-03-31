import { test, expect } from '@playwright/test';
import { setupTestContext, cleanupTestContext } from './api/test-utils';

let ctx: Awaited<ReturnType<typeof setupTestContext>>;
let clientId: string;

// This suite covers the Clients module in the dashboard.

test.describe('Clientes - UI e integração', () => {
  test.beforeAll(async () => {
    ctx = await setupTestContext();
    // criar um cliente via API
    const uniqueNif = String(100000000 + Math.floor(Math.random() * 899999999));
    const res = await fetch('http://127.0.0.1:4000/api/v1/clients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${ctx.token}` },
      body: JSON.stringify({ name: 'Teste Cliente', nif: uniqueNif, type: 'SINGULAR' }),
    });
    const data = await res.json();
    clientId = data.id;
  });

  test.afterAll(async () => {
    await cleanupTestContext(ctx);
  });

  test('deve renderizar a ficha de cliente e permitir edição', async ({ page }) => {
    // inserir cookie de autenticação para simular login
    await page.context().addCookies([
      { name: 'access_token', value: ctx.token, domain: 'localhost', path: '/' },
    ]);

    await page.goto(`/clients/${clientId}`);
    await expect(page.locator('text=Ficha de cliente')).toBeVisible();

    // clicar editar e alterar nome
    await page.locator('button:has-text("Editar")').click();
    const nameInput = page.locator('input[name="nome"]');
    await nameInput.fill('Cliente atualizado');
    await page.locator('button:has-text("Salvar")').click();

    await expect(page.locator('text=Cliente atualizado')).toBeVisible();
  });
});
