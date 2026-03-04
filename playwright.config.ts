import { defineConfig, devices } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

// Carregar variáveis de ambiente de testes sem usar o pacote 'dotenv' para 
// contornar o bug de resolução "Cannot find module 'dotenv'" da extensão oficial no VS Code
const envPath = path.resolve(__dirname, '.env.test');
if (fs.existsSync(envPath)) {
    const envFile = fs.readFileSync(envPath, 'utf8');
    envFile.split('\n').forEach(line => {
        const match = line.match(/^([^#\s][^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            if (value.startsWith('"') && value.endsWith('"')) { value = value.slice(1, -1); }
            if (value.startsWith("'") && value.endsWith("'")) { value = value.slice(1, -1); }
            if (!process.env[key]) { process.env[key] = value; }
        }
    });
}

const API_PORT = process.env.API_PORT || '4000';
const API_BASE_URL = `http://127.0.0.1:${API_PORT}`;

export default defineConfig({
    testDir: './tests',
    /* Timeout 15s — permite seed de dados via pnpm exec (~7s) */
    timeout: 15000,
    /* Run tests in files in parallel */
    fullyParallel: true,
    /* Fail the build on CI if you accidentally left test.only in the source code. */
    forbidOnly: !!process.env.CI,
    /* Retry on CI only */
    retries: process.env.CI ? 2 : 0,
    /* Opt out of parallel tests on CI. */
    workers: process.env.CI ? 1 : undefined,
    /* Reporter to use. See https://playwright.dev/docs/test-reporters */
    reporter: 'html',
    use: {
        /* Base URL da API NestJS — configurável via API_PORT no .env.test */
        baseURL: API_BASE_URL,
        /* Collect trace when retrying the failed test. */
        trace: 'on-first-retry',
    },

    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],

    /* Iniciar o servidor de desenvolvimento local antes dos testes */
    webServer: {
        command: 'pnpm --filter @advocatus/api run dev',
        url: `${API_BASE_URL}/api/v1/auth/health`,
        reuseExistingServer: !process.env.CI,
        timeout: 120 * 1000,
    },
});
