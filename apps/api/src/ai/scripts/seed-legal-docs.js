"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const dotenv = __importStar(require("dotenv"));
const path_1 = require("path");
const generative_ai_1 = require("@google/generative-ai");
const pg_1 = require("pg");
const adapter_pg_1 = require("@prisma/adapter-pg");
// Carregar .env do apps/api
dotenv.config({ path: (0, path_1.join)(__dirname, '../../../.env') });
const pool = new pg_1.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new adapter_pg_1.PrismaPg(pool);
const prisma = new client_1.PrismaClient({ adapter });
const genAI = new generative_ai_1.GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
// Modelo v4 (768 dimensões)
const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
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
    console.log(`🚀 Iniciando ingestão jurídica (Google v4)...`);
    for (const doc of legalDocs) {
        try {
            console.log(`📄 Gerando vetores para: ${doc.title}`);
            const result = await model.embedContent(doc.content);
            const embedding = result.embedding.values;
            const vectorString = `[${embedding.join(',')}]`;
            // Usando UPSERT manual via executeRaw pq Prisma nao suporta unsupported vectors nativamente
            await prisma.$executeRawUnsafe(`
                INSERT INTO legal_documents (id, title, source, type, content, reference, url, embedding, "ingestedAt", "updatedAt")
                VALUES ($1, $2, $3, $4::"LegalDocumentType", $5, $6, $7, $8::vector, NOW(), NOW())
                ON CONFLICT (id) DO UPDATE SET
                    content = EXCLUDED.content,
                    embedding = EXCLUDED.embedding,
                    "updatedAt" = NOW()
            `, doc.id, doc.title, doc.source, doc.type, doc.content, doc.reference, doc.url, vectorString);
            console.log(`   ✅ Inserido.`);
        }
        catch (e) {
            console.error(`   ❌ ERRO EM ${doc.title}:`, e.message);
            // Mostrar mais detalhes se for erro do Prisma
            if (e.code)
                console.error(`      Prisma Error Code: ${e.code}`);
        }
    }
    console.log('✅ Concluído.');
}
seed()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
