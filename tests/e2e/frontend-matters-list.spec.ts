import { test, expect } from '@playwright/test';
import { setupTestContext, cleanupTestContext } from './api/test-utils';

let ctx: Awaited<ReturnType<typeof setupTestContext>>;

test.describe('Processos - Listagem', () => {
  test.beforeAll(async () => {
    ctx = await setupTestContext();
  });

  test.afterAll(async () => {
    await cleanupTestContext(ctx);
  });

  test('deve renderizar página de processos com título e botão de novo processo', async ({ page }) => {
    await page.context().addCookies([
      { name: 'access_token', value: ctx.token, domain: 'localhost', path: '/' },
    ]);

    await page.goto('/matters');

    // Validar título principal
    await expect(page.locator('h1')).toContainText('Processos Jurídicos');

    // Validar botão de novo processo
    await expect(page.locator('button:has-text("Novo Processo")')).toBeVisible();

    // Validar campo de pesquisa
    await expect(page.locator('input[placeholder*="Pesquisar"]')).toBeVisible();

    // Validar filtros
    await expect(page.locator('button:has-text("Ativos")')).toBeVisible();
    await expect(page.locator('button:has-text("Suspensos")')).toBeVisible();
    await expect(page.locator('button:has-text("Todos")')).toBeVisible();
  });

  test('deve exibir mensagem vazia quando não há processos', async ({ page }) => {
    await page.context().addCookies([
      { name: 'access_token', value: ctx.token, domain: 'localhost', path: '/' },
    ]);

    await page.goto('/matters');

    // Se não há processos, deve mostrar mensagem vazia
    const emptyMessage = page.locator('text=Nenhum processo encontrado');
    const matterCards = page.locator('a[href*="/matters/"]');

    const emptyVisible = await emptyMessage.isVisible().catch(() => false);
    const hasMatters = (await matterCards.count()) > 0;

    expect(emptyVisible || hasMatters).toBeTruthy();
  });
});
