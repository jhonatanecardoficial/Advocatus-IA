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

const anonPayload = {
  iss: 'supabase',
  ref: 'default',
  role: 'anon',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60) // 10 years
};

const servicePayload = {
  iss: 'supabase',
  ref: 'default',
  role: 'service_role',
  iat: Math.floor(Date.now() / 1000),
  exp: Math.floor(Date.now() / 1000) + (10 * 365 * 24 * 60 * 60)
};

console.log('--- GENERATED KEYS ---');
console.log('ANON_KEY=' + createToken(anonPayload));
console.log('SERVICE_ROLE_KEY=' + createToken(servicePayload));
console.log('----------------------');
