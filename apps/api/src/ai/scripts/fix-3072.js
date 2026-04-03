const { Client } = require('pg');
const dotenv = require('dotenv');
const { join } = require('path');

const envPath = join(__dirname, '../../../.env');
dotenv.config({ path: envPath });

async function fixTable() {
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log('✅ Conectado para reparo.');

        // 1. Limpar dados antigos (pois as dimensões não batem)
        console.log('🗑️ Limpando legal_documents...');
        await client.query('TRUNCATE TABLE legal_documents;');

        // 2. Alterar a coluna embedding para 3072
        console.log('🏗️ Alterando embedding para vector(3072)...');
        await client.query('ALTER TABLE legal_documents ALTER COLUMN embedding TYPE vector(3072);');

        console.log('✅ Tabela pronta para 3072 dimensões.');
    } catch (err) {
        console.error('❌ Erro no reparo:', err.message);
    } finally {
        await client.end();
    }
}

fixTable();
