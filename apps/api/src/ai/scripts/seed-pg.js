const { Client } = require('pg');
const dotenv = require('dotenv');
const { join } = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Manually load env from apps/api/.env
const envPath = join(__dirname, '../../../.env');
console.log(`Loading env from: ${envPath}`);
dotenv.config({ path: envPath });

if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não encontrada no ambiente!');
    process.exit(1);
}

const legalDocs = [
    {
        id: 'nacionalidade-pt-base',
        title: 'Atribuição da Nacionalidade Portuguesa',
        source: 'Lei da Nacionalidade',
        type: 'LEI',
        reference: 'Lei n.º 37/81, Artigo 1.º',
        url: 'https://diariodarepublica.pt/dr/lex/lei-da-nacionalidade',
        content: 'São portugueses de origem os filhos de pai português ou de mãe portuguesa nascidos no território português ou no estrangeiro se o progenitor ali estiver ao serviço do Estado Português.',
    },
    {
        id: 'nacionalidade-it-base',
        title: 'Nacionalidade Italiana (Jure Sanguinis)',
        source: 'Legislação Italiana',
        type: 'LEI',
        reference: 'Lei n.º 91/1992',
        url: 'https://www.esteri.it',
        content: 'A cidadania italiana transmite-se por "jure sanguinis", ou seja, por descendência de pai ou mãe cidadãos italianos, sem limite de gerações, desde que nenhum antepassado tenha renunciado à cidadania.',
    },
    {
        id: 'imigracao-residencia',
        title: 'Autorização de Residência para Trabalho',
        source: 'Lei de Estrangeiros',
        type: 'LEI',
        reference: 'Lei n.º 23/2007, Artigo 88.º',
        url: 'https://diariodarepublica.pt',
        content: 'A autorização de residência para exercício de atividade profissional subordinada exige contrato de trabalho, inscrição na Segurança Social e entrada legal em território nacional.',
    },
    {
        id: 'imobiliario-compra-venda',
        title: 'Contrato de Compra e Venda de Imóveis',
        source: 'Código Civil',
        type: 'LEI',
        reference: 'Artigo 874.º',
        url: 'https://diariodarepublica.pt',
        content: 'Compra e venda é o contrato pelo qual se transmite a propriedade de uma coisa, ou outro direito, mediante um preço. Imóveis exigem escritura pública ou documento particular autenticado.',
    },
    {
        id: 'familia-divorcio',
        title: 'Divórcio por Mútuo Consentimento',
        source: 'Código Civil',
        type: 'LEI',
        reference: 'Artigo 1775.º',
        url: 'https://diariodarepublica.pt',
        content: 'O divórcio por mútuo consentimento pode ser requerido na conservatória do registo civil mediante acordo sobre o destino da casa de morada de família e alimentos.',
    },
    {
        id: 'advogado-autenticacao',
        title: 'Competência de Autenticação de Advogados',
        source: 'Estatuto Ordem Advogados',
        type: 'LEI',
        reference: 'Decreto-Lei n.º 76-A/2006',
        url: 'https://portal.oa.pt',
        content: 'Os advogados têm competência para efetuar reconhecimentos com termo de autenticação em documentos particulares, com o mesmo valor de atos notariais.',
    },
    {
        id: 'consumidor-voos-atraso',
        title: 'Indemnização por Atraso de Voo',
        source: 'Regulamento (CE) n.º 261/2004',
        type: 'LEI',
        reference: 'Artigo 7.º',
        url: 'https://eur-lex.europa.eu',
        content: 'Os passageiros têm direito a indemnização entre 250€ e 600€ em caso de cancelamento ou atraso superior a 3 horas, salvo em circunstâncias extraordinárias.',
    },
    {
        id: 'registo-civil-certidoes',
        title: 'Acesso ao Registo Civil Online',
        source: 'Código do Registo Civil',
        type: 'LEI',
        reference: 'Portaria n.º 181-A/2012',
        url: 'https://justica.gov.pt',
        content: 'Qualquer pessoa pode requerer certidões de registo de nascimento ou casamento através do portal Civil Online, mediante pagamento de taxa e identificação.',
    }
];

async function seed() {
    console.log(`🚀 Iniciando ingestão jurídica via PG Nativo (gemini-embedding-2-preview) @ 3072 dims...`);
    
    const client = new Client({
        connectionString: process.env.DATABASE_URL
    });

    try {
        await client.connect();
        console.log('✅ Conectado ao DB.');

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
        const model = genAI.getGenerativeModel({ model: 'gemini-embedding-2-preview' });

        for (const doc of legalDocs) {
            console.log(`📄 Processando: ${doc.title}`);
            const result = await model.embedContent(doc.content);
            const embedding = result.embedding.values;
            const vectorString = `[${embedding.join(',')}]`;

            const query = `
                INSERT INTO legal_documents (id, title, source, type, content, reference, url, embedding, "ingestedAt", "updatedAt")
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8::vector, NOW(), NOW())
                ON CONFLICT (id) DO UPDATE SET
                    content = EXCLUDED.content,
                    embedding = EXCLUDED.embedding,
                    "updatedAt" = NOW()
            `;

            await client.query(query, [
                doc.id, doc.title, doc.source, doc.type, doc.content, doc.reference, doc.url, vectorString
            ]);
            console.log(`   ✅ Sucesso.`);
        }

    } catch (err) {
        console.error('❌ Erro fatal:', err.message);
    } finally {
        await client.end();
        console.log('🏁 Fim.');
    }
}

seed();
