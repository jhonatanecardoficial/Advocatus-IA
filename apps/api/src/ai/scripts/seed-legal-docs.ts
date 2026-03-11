import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
import { join } from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Load .env from apps/api
dotenv.config({ path: join(__dirname, '../../../.env') });

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: 'gemini-embedding-001' });

const legalDocs = [
    {
        title: 'Artigo 1022.º - Noção (Arrendamento)',
        source: 'Código Civil',
        type: 'LEI',
        reference: 'Artigo 1022.º',
        url: 'https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/1966-34509075-49856575',
        content: 'Locação é o contrato pelo qual uma das partes se obriga a proporcionar à outra o gozo temporário de uma coisa, mediante retribuição. O arrendamento é a locação de coisas imóveis.',
    },
    {
        title: 'Artigo 1094.º - Tipos de Arrendamento Habitacional',
        source: 'Código Civil',
        type: 'LEI',
        reference: 'Artigo 1094.º',
        url: 'https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/1966-34509075-49856575',
        content: '1 - O contrato de arrendamento habitacional pode celebrar-se com prazo certo ou por duração indeterminada. 2 - O contrato celebrado com prazo certo não pode ter duração inferior a um nem superior a 30 anos, fixando-se em cinco anos o prazo no caso de ser silente.',
    },
    {
        title: 'Artigo 1097.º - Oposição à renovação pelo senhorio',
        source: 'Código Civil',
        type: 'LEI',
        reference: 'Artigo 1097.º',
        url: 'https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/1966-34509075-49856575',
        content: '1 - O senhorio pode impedir a renovação automática do contrato mediante comunicação ao arrendatário com a antecedência mínima de: a) 120 dias, se o prazo de duração inicial do contrato ou da sua renovação for igual ou superior a um ano e inferior a seis anos; b) 60 dias, se for igual ou superior a seis meses e inferior a um ano.',
    },
    {
        title: 'Artigo 1083.º - Fundamentos da resolução',
        source: 'Código Civil',
        type: 'LEI',
        reference: 'Artigo 1083.º',
        url: 'https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/1966-34509075-49856575',
        content: '1 - Qualquer das partes pode resolver o contrato, nos termos gerais de direito, com base em incumprimento pela outra parte que, pela sua gravidade ou consequências, torne inexigível à outra parte a manutenção do arrendamento. 2 - É fundamento de resolução o incumprimento que consista na mora igual ou superior a dois meses no pagamento da renda, encargos ou despesas.',
    },
    {
        title: 'Requisitos de validade do testamento',
        source: 'Código Civil',
        type: 'LEI',
        reference: 'Artigo 2179.º e seguintes',
        url: 'https://diariodarepublica.pt/dr/legislacao-consolidada/decreto-lei/1966-34509075',
        content: 'Testamento é o acto unilateral e revogável pelo qual uma pessoa dispõe, para depois da morte, de todos os seus bens ou de parte deles. O testamento é um ato pessoal, não podendo ser feito por meio de representante ou ficar dependente do arbítrio de outrem.',
    }
];

async function seed() {
    console.log(`🚀 Iniciando ingestão com embeddings via Gemini (gemini-embedding-001)`);

    for (const doc of legalDocs) {
        console.log(`📄 Processando: ${doc.title}`);

        const id = `seed-${doc.reference.replace(/\s+/g, '-').replace(/\./g, '').toLowerCase()}`;
        
        // Generate embedding
        let embedding = null;
        try {
            const result = await model.embedContent(doc.content);
            embedding = result.embedding.values;
        } catch (e: any) {
            console.error(`❌ Erro ao gerar embedding para ${doc.title}:`, e.message);
        }

        const vectorString = embedding ? `[${embedding.join(',')}]` : null;

        await prisma.$executeRawUnsafe(`
            INSERT INTO legal_documents (id, title, source, type, content, reference, url, embedding, "ingestedAt", "updatedAt")
            VALUES ($1, $2, $3, $4::"LegalDocumentType", $5, $6, $7, ${vectorString ? "$8::vector" : "NULL"}, NOW(), NOW())
            ON CONFLICT (id) DO UPDATE SET
                content = EXCLUDED.content,
                embedding = EXCLUDED.embedding,
                "updatedAt" = NOW()
        `,
            id,
            doc.title,
            doc.source,
            doc.type,
            doc.content,
            doc.reference,
            doc.url,
            ...(vectorString ? [vectorString] : [])
        );
    }

    console.log('✅ Ingestão concluída com sucesso!');
}

seed()
    .catch((e) => {
        console.error('❌ Erro na ingestão:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
