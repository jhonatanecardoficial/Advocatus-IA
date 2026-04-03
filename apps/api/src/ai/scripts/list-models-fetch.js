const dotenv = require('dotenv');
const { join } = require('path');

const envPath = join(__dirname, '../../../.env');
dotenv.config({ path: envPath });

async function listModels() {
  const API_KEY = process.env.GEMINI_API_KEY;
  const URL = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;
  
  try {
    const response = await fetch(URL);
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Models list:');
      data.models.filter(m => m.name.includes('embedding')).forEach(m => console.log(`- ${m.name}`));
    } else {
      console.error('❌ Failed:', response.status, data);
    }
  } catch (err) {
    console.error('❌ Error:', err.message);
  }
}

listModels();
