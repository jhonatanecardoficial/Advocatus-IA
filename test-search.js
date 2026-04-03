const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Also log page console errors/messages
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', err => console.log('PAGE ERROR:', err.message));
  page.on('response', response => {
    if (response.url().includes('/ai/search')) {
      console.log(`<< Response URL: ${response.url()} | Status: ${response.status()}`);
    }
  });

  console.log('Navigating to login...');
  await page.goto('http://localhost:3001/login');
  
  await page.fill('input[type="email"]', 'admin@advocatus.pt');
  await page.fill('input[type="password"]', 'admin123');
  await page.click('button[type="submit"]');
  
  console.log('Waiting for intelligence page...');
  await page.waitForTimeout(2000); // give time to login redirect
  await page.goto('http://localhost:3001/intelligence');
  
  console.log('Typing query...');
  await page.waitForTimeout(1000);
  
  // Ensure the input is visible
  await page.waitForSelector('input[placeholder*="Pesquise"]', { state: 'visible' });
  await page.fill('input[placeholder*="Pesquise"]', 'contrato de arrendamento');
  
  console.log('Clicking Pesquisar...');
  const searchButton = page.locator('button', { hasText: 'Pesquisar' });
  await searchButton.waitFor({ state: 'visible' });
  await searchButton.click();
  
  console.log('Waiting 5s for results...');
  await page.waitForTimeout(5000);
  
  // Capture what it looks like
  if (!fs.existsSync('artifacts')) {
      fs.mkdirSync('artifacts');
  }
  await page.screenshot({ path: 'artifacts/search-page-snapshot.png', fullPage: true });
  
  console.log('Done, closing.');
  await browser.close();
})();
