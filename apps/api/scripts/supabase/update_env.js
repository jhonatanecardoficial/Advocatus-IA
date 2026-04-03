const fs = require('fs');
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

const iat = Math.floor(Date.now() / 1000);
const exp = iat + (10 * 365 * 24 * 60 * 60);

const anonKey = createToken({ iss: 'supabase', ref: 'default', role: 'anon', iat, exp });
const serviceKey = createToken({ iss: 'supabase', ref: 'default', role: 'service_role', iat, exp });

function updateEnv(path) {
  if (!fs.existsSync(path)) {
    console.log('Skipping (not found): ' + path);
    return;
  }
  let content = fs.readFileSync(path, 'utf8');
  
  // Atualizar ANON_KEY
  if (content.includes('SUPABASE_ANON_KEY=')) {
    content = content.replace(/SUPABASE_ANON_KEY=.*/, `SUPABASE_ANON_KEY="${anonKey}"`);
  }
  // Atualizar SERVICE_ROLE_KEY
  if (content.includes('SUPABASE_SERVICE_ROLE_KEY=')) {
    content = content.replace(/SUPABASE_SERVICE_ROLE_KEY=.*/, `SUPABASE_SERVICE_ROLE_KEY="${serviceKey}"`);
  }
  // Atualizar NEXT_PUBLIC (Web)
  if (content.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
    content = content.replace(/NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/, `NEXT_PUBLIC_SUPABASE_ANON_KEY="${anonKey}"`);
  }

  fs.writeFileSync(path, content);
  console.log('Updated: ' + path);
}

updateEnv('apps/api/.env');
updateEnv('apps/web/.env');
updateEnv('.env');
console.log('DONE');
