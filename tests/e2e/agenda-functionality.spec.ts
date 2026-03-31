import { test, expect } from '@playwright/test';
import { setupTestContext, cleanupTestContext } from '../api/test-utils';

let ctx: Awaited<ReturnType<typeof setupTestContext>>;

test.describe('Agenda e Dashboard - Funcionalidades', () => {
    test.beforeAll(async () => {
        ctx = await setupTestContext();
    });

    test.afterAll(async () => {
        await cleanupTestContext(ctx);
    });

    test.beforeEach(async ({ page }) => {
        // Inserir cookie de autenticação para simular login
        await page.context().addCookies([
            {
                name: 'accessToken',
                value: ctx.token,
                domain: '127.0.0.1',
                path: '/',
            },
        ]);
    });

    test('Dashboard: Botão "Adicionar Prazo/Tarefa" deve abrir o modal', async ({ page }) => {
        await page.goto('/');
        
        // Verificar se o botão existe no sidebar
        const addBtn = page.getByRole('button', { name: /Adicionar Prazo\/Tarefa/i });
        await expect(addBtn).toBeVisible();
        
        // Clicar no botão
        await addBtn.click();
        
        // Verificar se o modal abriu
        await expect(page.getByText(/Agendar Novo Prazo/i)).toBeVisible();
        await expect(page.getByLabel(/Título/i)).toBeVisible();
    });

    test('Página de Tarefas: Botão de agendamento no topo e fundo devem funcionar', async ({ page }) => {
        await page.goto('/tasks');
        
        // Botão do Topo
        const topBtn = page.getByRole('button', { name: /Agendar Novo Prazo/i });
        await expect(topBtn).toBeVisible();
        await topBtn.click();
        await expect(page.getByText(/Informações do Prazo/i)).toBeVisible();
        
        // Fechar modal (clicando fora ou no botão fechar se houver)
        await page.keyboard.press('Escape');
        
        // Botão do Fundo (mais abaixo na página)
        const bottomBtn = page.getByRole('button', { name: /Adicionar Prazo\/Tarefa/i });
        await expect(bottomBtn).toBeVisible();
        await bottomBtn.click();
        await expect(page.getByText(/Informações do Prazo/i)).toBeVisible();
    });

    test('Calendário: Clique no dia deve abrir DayPopup', async ({ page }) => {
        await page.goto('/');
        
        // Tentar encontrar um dia no mini-calendário ou na agenda 7 dias
        // Vamos usar o seletor da grid de 7 dias que implementamos
        const firstDay = page.locator('.flex.flex-col.border-r.border-border').first();
        await expect(firstDay).toBeVisible();
        
        // Clicar no cabeçalho do dia
        await firstDay.locator('text=/\\d+/').first().click();
        
        // Verificar se o DayPopup (Grid 24h) abriu
        // O DayPopup tem um título com o nome do mês/dia
        await expect(page.locator('.fixed.inset-0.z-50')).toBeVisible();
        await expect(page.getByText(/Visualização Diária/i)).toBeVisible();
    });
});
