const fs = require('fs');

const anonKey = 'sb_publishable_ACJWlzQHlZjBrEguHvfOxg_3BJgxAaH';
const serviceKey = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

function updateEnv(path) {
  if (!fs.existsSync(path)) {
    console.log('Skipping (not found): ' + path);
    return;
  }
  let content = fs.readFileSync(path, 'utf8');
  
  // Regex mais robusto para lidar com aspas ou sem aspas
  content = content.replace(/SUPABASE_ANON_KEY=.*/, `SUPABASE_ANON_KEY="${anonKey}"`);
  content = content.replace(/SUPABASE_SERVICE_ROLE_KEY=.*/, `SUPABASE_SERVICE_ROLE_KEY="${serviceKey}"`);
  content = content.replace(/NEXT_PUBLIC_SUPABASE_ANON_KEY=.*/, `NEXT_PUBLIC_SUPABASE_ANON_KEY="${anonKey}"`);

  fs.writeFileSync(path, content);
  console.log('Updated: ' + path);
}

updateEnv('apps/api/.env');
updateEnv('.env');
console.log('DONE: Chaves oficiais sincronizadas.');
