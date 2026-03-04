// Debug script: cria seed, gera JWT fresco, testa POST /clients, faz cleanup
const { execSync } = require('child_process');
const { SignJWT } = require('jose');
const http = require('http');

const JWT_SECRET = 'super-secret-jwt-token-with-at-least-32-characters-long';
const API_PORT = 4000;
const ROOT = 'c:\\Users\\E\\Desktop\\Ecard\\Projeto IA\\Advocatus IA';

async function request(path, method, token, body) {
    return new Promise((resolve) => {
        const opts = {
            hostname: '127.0.0.1', port: API_PORT,
            path, method,
            headers: { 'Authorization': `Bearer ${token}` }
        };
        if (body) {
            const b = JSON.stringify(body);
            opts.headers['Content-Type'] = 'application/json';
            opts.headers['Content-Length'] = Buffer.byteLength(b);
        }
        const req = http.request(opts, (res) => {
            let d = ''; res.on('data', c => d += c);
            res.on('end', () => resolve({ status: res.statusCode, body: d }));
        });
        req.on('error', e => resolve({ status: 0, body: e.message }));
        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

async function main() {
    const uid = String(Date.now());

    // 1. Criar seed: Tenant + User
    const seedRaw = execSync(
        `pnpm --filter @advocatus/api exec node seed.test.js create ${uid}`,
        { cwd: ROOT, encoding: 'utf-8', env: { ...process.env, TEST_DB_URL: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' } }
    ).trim();
    const { tenantId, userId, supabaseUserId } = JSON.parse(seedRaw);
    console.log('Seed OK:', { tenantId, userId, supabaseUserId });

    // 2. Gerar JWT fresco com o sub = supabaseUserId
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({ sub: supabaseUserId, role: 'authenticated', iss: 'supabase' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(secret);
    console.log('JWT sub:', supabaseUserId, '| token prefix:', token.substring(0, 30));

    // 3. GET /auth/me — confirmar que autenticação funciona
    const me = await request('/api/v1/auth/me', 'GET', token, null);
    console.log('GET /auth/me:', me.status, me.body);

    // 4. POST /clients — capturar erro real
    const client = await request('/api/v1/clients', 'POST', token, {
        name: 'Debug Client',
        nif: '987654321',
        type: 'SINGULAR'
    });
    console.log('POST /clients:', client.status, client.body);

    // 5. Cleanup
    execSync(
        `pnpm --filter @advocatus/api exec node seed.test.js delete _ ${tenantId} ${userId}`,
        { cwd: ROOT, encoding: 'utf-8', env: { ...process.env, TEST_DB_URL: 'postgresql://postgres:postgres@127.0.0.1:54322/postgres' } }
    );
    console.log('Cleanup done');
}

main().catch(console.error);
