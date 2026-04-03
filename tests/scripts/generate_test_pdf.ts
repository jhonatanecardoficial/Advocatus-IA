import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { marked } from 'marked';

async function generatePdf() {
  const mdPath = path.resolve('tests/fixtures/nacionalidade_portuguesa.md');
  const pdfPath = path.resolve('tests/fixtures/nacionalidade_portuguesa.pdf');

  if (!fs.existsSync(mdPath)) {
    console.error('Ficheiro MD não encontrado!');
    return;
  }

  const mdContent = fs.readFileSync(mdPath, 'utf8');
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
        h1 { color: #1e3a8a; border-bottom: 2px solid #fbbf24; padding-bottom: 10px; }
        h2 { color: #1e40af; margin-top: 30px; }
        ul { margin-bottom: 20px; }
        li { margin-bottom: 8px; }
      </style>
    </head>
    <body>
      ${marked(mdContent)}
    </body>
    </html>
  `;

  const browser = await chromium.launch();
  const page = await browser.newPage();
  await page.setContent(htmlContent);
  await page.pdf({ path: pdfPath, format: 'A4' });
  await browser.close();

  console.log(`PDF gerado em: ${pdfPath}`);
}

generatePdf().catch(console.error);
