import * as jwt from 'jsonwebtoken';
import * as fs from 'fs';
import * as path from 'path';

const JWT_SECRET = 'super-secret-jwt-token-with-at-least-32-characters-long';

function generateKey(role: string) {
  const payload = {
    role: role,
    iss: 'supabase',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365 * 10),
    ref: 'default'
  };
  return jwt.sign(payload, JWT_SECRET);
}

const newAnonKey = generateKey('anon');
const newServiceKey = generateKey('service_role');

console.log('--- SYNC KEYS ---');
console.log('ANON:', newAnonKey);
console.log('SERVICE:', newServiceKey);

const envPath = path.join(process.cwd(), '.env');
if (fs.existsSync(envPath)) {
  let content = fs.readFileSync(envPath, 'utf8');
  content = content.replace(/SUPABASE_ANON_KEY=.*/, `SUPABASE_ANON_KEY="${newAnonKey}"`);
  content = content.replace(/SUPABASE_SERVICE_ROLE_KEY=.*/, `SUPABASE_SERVICE_ROLE_KEY="${newServiceKey}"`);
  fs.writeFileSync(envPath, content);
  console.log('Updated .env at', envPath);
}
