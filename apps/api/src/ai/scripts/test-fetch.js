const dotenv = require('dotenv');
const { join } = require('path');

const envPath = join(__dirname, '../../../.env');
dotenv.config({ path: envPath });

async function testFetch() {
  const API_KEY = process.env.GEMINI_API_KEY;
  const URL = `https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent?key=${API_KEY}`;
  
  console.log(`Testing URL (masked key): ${URL.replace(API_KEY, '***')}`);
  
  try {
    const response = await fetch(URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        content: { parts: [{ text: "test" }] }
      })
    });
    
    const data = await response.json();
    if (response.ok) {
      console.log('✅ Fetch SUCCESS!');
      console.log('Embedding size:', data.embedding.values.length);
    } else {
      console.error('❌ Fetch FAILED:', response.status, response.statusText);
      console.error(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('❌ Network error:', err.message);
  }
}

testFetch();
