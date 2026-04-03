const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

// Configurações extraídas do ambiente do utilizador
const JWT_SECRET = 'super-secret-jwt-token-with-at-least-32-characters-long';
const PROJECT_REF = 'default'; // Padrão do Supabase CLI local

function generateKey(role) {
  const payload = {
    role: role,
    iss: 'supabase',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24 * 365 * 10), // 10 anos
    ref: PROJECT_REF
  };
  return jwt.sign(payload, JWT_SECRET);
}

const newAnonKey = generateKey('anon');
const newServiceKey = generateKey('service_role');

console.log('--- NOVAS CHAVES GERADAS ---');
console.log('ANON_KEY:', newAnonKey);
console.log('SERVICE_ROLE_KEY:', newServiceKey);

// Atualizar o ficheiro .env da API
const envPath = path.join(__dirname, 'apps/api/.env');
if (fs.existsSync(envPath)) {
  let envContent = fs.readFileSync(envPath, 'utf8');
  
  envContent = envContent.replace(/SUPABASE_ANON_KEY=".*"/, `SUPABASE_ANON_KEY="${newAnonKey}"`);
  envContent = envContent.replace(/SUPABASE_SERVICE_ROLE_KEY=".*"/, `SUPABASE_SERVICE_ROLE_KEY="${newServiceKey}"`);
  
  fs.writeFileSync(envPath, envContent);
  console.log('Ficheiro apps/api/.env atualizado com sucesso.');
} else {
  console.error('Ficheiro .env não encontrado em:', envPath);
}

// Atualizar também o .env do Web se existir
const webEnvPath = path.join(__dirname, 'apps/web/.env');
if (fs.existsSync(webEnvPath)) {
  let webContent = fs.readFileSync(webEnvPath, 'utf8');
  webContent = webContent.replace(/NEXT_PUBLIC_SUPABASE_ANON_KEY=".*"/, `NEXT_PUBLIC_SUPABASE_ANON_KEY="${newAnonKey}"`);
  fs.writeFileSync(webEnvPath, webContent);
  console.log('Ficheiro apps/web/.env atualizado com sucesso.');
}
