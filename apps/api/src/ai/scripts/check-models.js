const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const { join } = require('path');

const envPath = join(__dirname, '../../../.env');
dotenv.config({ path: envPath });

async function listModels() {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
  try {
    // There is no direct "listModels" in the simple genAI SDK, usually we use the REST API or discovery
    // But we can try to test a few known names
    const models = ['text-embedding-004', 'models/text-embedding-004', 'embedding-001', 'models/embedding-001'];
    for (const m of models) {
        try {
            const model = genAI.getGenerativeModel({ model: m });
            await model.embedContent("test");
            console.log(`✅ Model available: ${m}`);
        } catch (e) {
            console.log(`❌ Model NOT available: ${m} (${e.message})`);
        }
    }
  } catch (err) {
    console.error(err);
  }
}

listModels();
