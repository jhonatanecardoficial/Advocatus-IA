import { execSync } from 'child_process';
import * as path from 'path';
import * as jose from 'jose';
import { config as loadDotenv } from 'dotenv';

// Carregar .env.test para ter acesso a TEST_JWT_SECRET e TEST_DB_URL
loadDotenv({ path: path.resolve(__dirname, '../../.env.test') });

const JWT_SECRET = process.env.TEST_JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long';
const ROOT_DIR = path.resolve(__dirname, '../../');

export interface TestContext {
    token: string;
    tenantId: string;
    userId: string;
}

export async function setupTestContext(): Promise<TestContext> {
    const uniqueId = String(Date.now());

    // Corre o seed no contexto da api (onde @prisma/client está instalado)
    // Passa TEST_DB_URL para o processo filho para evitar dependência de .env hardcoded
    const raw = execSync(
        `pnpm --filter @advocatus/api exec node seed-test-data.js create ${uniqueId}`,
        {
            cwd: ROOT_DIR,
            encoding: 'utf-8',
            env: {
                ...process.env,
                // Garantir que TEST_DB_URL está disponível para o script seed
                TEST_DB_URL: process.env.TEST_DB_URL,
            }
        }
    ).trim();

    const { tenantId, userId, supabaseUserId } = JSON.parse(raw);

    // Gerar JWT assinado com o mesmo secret que a JwtStrategy usa
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new jose.SignJWT({ sub: supabaseUserId, role: 'authenticated', iss: 'supabase' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(secret);

    return { token, tenantId, userId };
}

export async function cleanupTestContext(ctx: TestContext) {
    execSync(
        `pnpm --filter @advocatus/api exec node seed-test-data.js delete _ ${ctx.tenantId} ${ctx.userId}`,
        {
            cwd: ROOT_DIR,
            encoding: 'utf-8',
            env: {
                ...process.env,
                TEST_DB_URL: process.env.TEST_DB_URL,
            }
        }
    );
}
