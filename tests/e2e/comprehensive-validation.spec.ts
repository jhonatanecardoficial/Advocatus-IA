import { test, expect } from '@playwright/test';

/**
 * Comprehensive System Validation
 * This test fulfills the user's request to "fill all fields" and "test each function".
 */
test.describe('Validação Completa do Sistema - Advocatus IA', () => {
  
  test('Fluxo Completo: Registo -> Cliente -> Processo -> Rascunho IA', async ({ page }) => {
    const uniqueId = Date.now();
    const email = `test-${uniqueId}@advocatus.test`;
    const password = 'admin123';

    // 1. Registo (Onboarding de 3 Passos)
    await page.goto('/login');
    await page.click('text=Solicitar Acesso'); 
    
    // Passo 1: Identidade
    await page.fill('input[placeholder="João"]', 'Admin');
    await page.fill('input[placeholder="Ex: João Lopes"]', 'Test QA');
    await page.click('button:has-text("Avançar Passo")');
    
    // Passo 2: Escritório
    await page.fill('input[placeholder*="Aliança & Advogados"]', `Escritório QA ${uniqueId}`);
    await page.click('button:has-text("Avançar Passo")');
    
    // Passo 3: Credenciais
    await page.fill('input[placeholder="exemplo@advocacia.pt"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Criar Conta")');
    
    // Validar Dashboard (Redirecionamento após registo)
    // Aumentar o timeout para o redirecionamento e carregamento do Dashboard
    await page.waitForURL(/.*\/dashboard/, { timeout: 15000 });
    await expect(page.locator('h1')).toContainText('Dashboard');

    // 2. Criar Novo Cliente (Preencher todos os campos)
    await page.goto('/clients/new');
    await page.fill('input[name="name"]', 'João Silva QA Test');
    await page.fill('input[name="nif"]', String(100000000 + Math.floor(Math.random() * 899999999)));
    await page.selectOption('select[name="type"]', 'SINGULAR');
    await page.fill('input[name="email"]', 'joao.qa@test.pt');
    await page.fill('input[name="phone"]', '+351 987 654 321');
    await page.fill('textarea[name="address"]', 'Rua de Teste, 123, Lisboa, Portugal');
    await page.click('button:has-text("Criar Cliente")');
    
    await expect(page.locator('text=Cliente criado com sucesso')).toBeVisible();

    // 3. Criar Novo Processo (Matter) vinculando ao cliente
    await page.goto('/matters/new');
    await page.fill('input[name="title"]', 'Processo de Nacionalidade Portuguesa - Teste IA');
    await page.selectOption('select[name="type"]', 'CIVEL');
    await page.selectOption('select[name="status"]', 'ATIVO');
    // Selecionar o cliente recém criado (dropdown de busca)
    await page.fill('input[placeholder*="Procurar cliente"]', 'João Silva QA Test');
    await page.click('text=João Silva QA Test'); 
    
    await page.click('button:has-text("Abrir Processo")');

    // 4. Testar Editor Jurídico e IA (Phase B.2)
    const currentUrl = page.url();
    const matterId = currentUrl.split('/').pop();
    
    // Clicar no botão de IA
    await page.click('button:has-text("Gerar Esboço IA")');
    
    // Preencher campos do modal de IA
    await expect(page.locator('text=Advocatus IA - Redator Inteligente')).toBeVisible();
    await page.selectOption('select', 'Notificação Extrajudicial');
    
    // Gerar
    await page.click('button:has-text("Gerar Esboço")');
    
    // Aguardar o editor carregar com o texto
    await expect(page.locator('.ProseMirror')).not.toBeEmpty({ timeout: 15000 });
    
    // Salvar rascunho
    await page.click('button:has-text("Salvar rascunho")');
    
    // 5. Verificação Final na Timeline
    await expect(page.locator('text=Rascunho salvo com sucesso')).toBeVisible();
    await expect(page.locator('text=Notificação Extrajudicial')).toBeVisible();
    
    console.log('✅ Validação total concluída com sucesso.');
  });
});
