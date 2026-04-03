const crypto = require('crypto');
const secret = 'super-secret-jwt-token-with-at-least-32-characters-long';

function createToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString('base64url');
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', secret)
    .update(`${encodedHeader}.${encodedPayload}`)
    .digest('base64url');
  return `${encodedHeader}.${encodedPayload}.${signature}`;
}

const ref = 'Advocatus_IA'; // MUDANÇA AQUI
const iat = Math.floor(Date.now() / 1000);
const exp = iat + (10 * 365 * 24 * 60 * 60);

console.log('SERVICE_ROLE_KEY=' + createToken({ iss: 'supabase', ref, role: 'service_role', iat, exp }));
