// Script temporário para testar o POST /clients ao vivo
const { SignJWT } = require('jose');
const http = require('http');

const JWT_SECRET = 'super-secret-jwt-token-with-at-least-32-characters-long';
const SUB = 'test-user-77777';
const API_PORT = process.env.API_PORT || '4000';

async function makeRequest(options, body) {
    return new Promise((resolve) => {
        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve({ status: res.statusCode, body: data }));
        });
        req.on('error', e => resolve({ status: 0, body: e.message }));
        if (body) req.write(body);
        req.end();
    });
}

async function main() {
    const secret = new TextEncoder().encode(JWT_SECRET);
    const token = await new SignJWT({ sub: SUB, role: 'authenticated', iss: 'supabase' })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('2h')
        .sign(secret);

    // 1. Testar GET /auth/me para verificar se JWT é válido
    const authResult = await makeRequest({
        hostname: '127.0.0.1', port: parseInt(API_PORT),
        path: '/api/v1/auth/me', method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    console.log('GET /auth/me:', authResult.status, authResult.body);

    // 2. Testar POST /clients
    const body = JSON.stringify({ name: "Test Client", nif: "123456788", type: "SINGULAR" });
    const postResult = await makeRequest({
        hostname: '127.0.0.1', port: parseInt(API_PORT),
        path: '/api/v1/clients', method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}`, 'Content-Length': Buffer.byteLength(body) }
    }, body);
    console.log('POST /clients:', postResult.status, postResult.body);
}

main().catch(console.error);
