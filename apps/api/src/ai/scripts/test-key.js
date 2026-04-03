const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const { join } = require('path');

const envPath = join(__dirname, '../../../.env');
dotenv.config({ path: envPath });

async function testKey() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent("Oi");
    console.log(`✅ Generation success: ${result.response.text()}`);
  } catch (err) {
    console.error(`❌ Key error: ${err.message}`);
  }
}

testKey();
