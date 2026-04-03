const { Client } = require('pg');
const dotenv = require('dotenv');
const { join } = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment from apps/api/.env
const envPath = join(__dirname, '../../../.env');
dotenv.config({ path: envPath });

async function verify() {
    const query = "Como posso obter nacionalidade sendo filho ou neto de portugueses?";
    console.log(`🔍 Testando busca RAG (Portugal) para: "${query}"`);
    
    const client = new Client({ connectionString: process.env.DATABASE_URL });
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-embedding-2-preview' });

    try {
        await client.connect();
        
        // 1. Gerar embedding da query
        const result = await model.embedContent(query);
        const embedding = result.embedding.values;
        const vectorString = `[${embedding.join(',')}]`;

        // 2. Realizar busca por similaridade de cosseno
        const sql = `
            SELECT id, title, content, 1 - (embedding <=> $1::vector) as similarity
            FROM legal_documents
            ORDER BY embedding <=> $1::vector
            LIMIT 3;
        `;
        
        const { rows } = await client.query(sql, [vectorString]);

        console.log('\n✅ Resultados Encontrados:');
        rows.forEach((row, i) => {
            console.log(`${i + 1}. [Sim: ${(row.similarity * 100).toFixed(2)}%] ${row.title}`);
            console.log(`   ID: ${row.id}`);
            console.log(`   Excerto: ${row.content.substring(0, 100)}...`);
        });

        const topId = rows[0]?.id;
        if (topId && (topId.includes('pt-netos') || topId.includes('pt-base'))) {
            console.log('\n🌟 PRECISÃO ALTA: O sistema identificou corretamente a legislação portuguesa de nacionalidade.');
        } else {
            console.warn('\n⚠️ PRECISÃO BAIXA: Verifique se os dados de semente foram populados corretamente.');
        }

    } catch (err) {
        console.error('❌ Erro na verificação:', err.message);
    } finally {
        await client.end();
    }
}

verify();
