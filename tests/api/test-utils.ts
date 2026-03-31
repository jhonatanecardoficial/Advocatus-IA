import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as jose from 'jose';

import * as dotenv from 'dotenv';

// Carregar variáveis de ambiente de testes
const envPath = path.resolve(__dirname, '../../.env.test');
const ROOT_DIR = path.resolve(__dirname, '../../');

if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
}

const JWT_SECRET = process.env.TEST_JWT_SECRET || 'super-secret-jwt-token-with-at-least-32-characters-long';

export interface TestContext {
    token: string;
    tenantId: string;
    userId: string;
}

export async function setupTestContext(): Promise<TestContext> {
    const uniqueId = String(Date.now());

    let raw: string;
    try {
        raw = execSync(
            `pnpm --filter @advocatus/api exec node seed-test-data.js create ${uniqueId}`,
            {
                cwd: ROOT_DIR,
                encoding: 'utf-8',
                env: {
                    ...process.env,
                    TEST_DB_URL: process.env.TEST_DB_URL,
                    DATABASE_URL: process.env.TEST_DB_URL // Some scripts might look for this instead
                }
            }
        ).trim();
    } catch (e: any) {
        console.error('SEED SCRIPT FAILED!');
        console.error('STDOUT:', e.stdout?.toString());
        console.error('STDERR:', e.stderr?.toString());
        throw new Error(`Failed to seed test data: ${e.message}`);
    }

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
