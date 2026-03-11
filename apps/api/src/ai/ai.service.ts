import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class AiService implements OnModuleInit {
    private openai: OpenAI;
    private genAI: GoogleGenerativeAI;
    private provider: string;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
        private auditService: AuditService,
    ) { }

    onModuleInit() {
        const geminiKey = this.configService.get<string>('GEMINI_API_KEY');
        const openaiKey = this.configService.get<string>('OPENAI_API_KEY');
        this.provider = this.configService.get<string>('LLM_PROVIDER', 'openai');

        if (geminiKey) {
            this.genAI = new GoogleGenerativeAI(geminiKey);
        }

        if (openaiKey) {
            this.openai = new OpenAI({ apiKey: openaiKey });
        }
    }

    async generateEmbedding(text: string): Promise<number[]> {
        if (this.provider === 'gemini' && this.genAI) {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-embedding-001' });
            const result = await model.embedContent(text);
            return result.embedding.values;
        }

        // Fallback or explicit OpenAI
        if (this.openai) {
            const response = await this.openai.embeddings.create({
                model: 'text-embedding-3-small',
                input: text,
            });
            return response.data[0].embedding;
        }

        throw new Error('AI Provider not configured properly');
    }

    async chatWithContext(query: string, context: string): Promise<string> {
        const modelName = this.configService.get<string>('LLM_MODEL', 'gemini-1.5-flash');

        if (this.provider === 'gemini' && this.genAI) {
            const model = this.genAI.getGenerativeModel({ model: modelName });
            const prompt = `
        És um assistente jurídico especializado em Portugal. 
        Utiliza o seguinte contexto para responder à pergunta do utilizador.
        Se a informação não estiver no contexto, diz que não sabes com base nos dados fornecidos, mas tenta ser útil.
        
        CONTEXTO:
        ${context}
        
        PERGUNTA: ${query}
        
        RESPOSTA (em Português de Portugal):`;

            const result = await model.generateContent(prompt);
            return result.response.text();
        }

        if (this.openai) {
            // Placeholder for OpenAI Chat if needed
            return "Resposta gerada via OpenAI (não implementada para este modelo)";
        }

        return "Assistente temporariamente indisponível.";
    }

    async searchLegalDocuments(query: string, limit = 5) {
        try {
            const embedding = await this.generateEmbedding(query).catch((e) => {
                console.error('Embedding error:', e.message);
                return null;
            });

            if (!embedding) {
                return { results: this.getMockResults(query), answer: 'Estás a ver dados mockados pois as chaves de API não responderam corretamente.' };
            }

            const vectorString = `[${embedding.join(',')}]`;

            const results = await this.prisma.$queryRawUnsafe<any[]>(`
                SELECT id, title, source, type, content, reference, url,
                1 - (embedding <=> $1::vector) as similarity
                FROM legal_documents
                WHERE embedding IS NOT NULL
                ORDER BY embedding <=> $1::vector
                LIMIT $2
            `, vectorString, limit);

            if (!results || results.length === 0) {
                return { results: this.getMockResults(query), answer: 'Não foram encontrados documentos específicos, mas aqui estão alguns exemplos genéricos.' };
            }

            // Generate RAG Answer
            const context = results.map(r => `[${r.title}]: ${r.content}`).join('\n\n');
            const answer = await this.chatWithContext(query, context);

            // Log the search action
            await this.auditService.log({
                tenantId: 'system',
                action: 'AI_RAG_SEARCH',
                resourceType: 'AI',
                resourceId: 'search',
                newValue: { query, resultsCount: results.length, provider: this.provider }
            });

            return { results, answer };
        } catch (error: any) {
            console.error('AI Search error, using mocks:', error?.message || error);
            return { results: this.getMockResults(query), answer: 'Ocorreu um erro técnico. Apresentando resultados de demonstração.' };
        }
    }

    private getMockResults(query: string) {
        // Simple mock implementation for demo purposes
        const mockData = [
            {
                id: 'mock-1',
                title: 'Novo Regime do Arrendamento Urbano (NRAU)',
                source: 'Diário da República',
                type: 'LEI',
                content: 'O NRAU estabelece as regras para o arrendamento de prédios urbanos em território nacional. Inclui disposições sobre prazos de denúncia e atualização de rendas.',
                reference: 'Lei n.º 6/2006',
                url: 'https://diariodarepublica.pt',
                similarity: 0.85
            },
            {
                id: 'mock-2',
                title: 'Código Civil - Artigo 1094.º',
                source: 'Código Civil',
                type: 'LEI',
                content: 'Contrato de arrendamento habitacional com prazo certo ou duração indeterminada. Prazo mínimo de 1 ano para fins habitacionais.',
                reference: 'Decreto-Lei n.º 47344',
                url: 'https://diariodarepublica.pt',
                similarity: 0.79
            }
        ];

        return mockData.filter(d =>
            d.title.toLowerCase().includes(query.toLowerCase()) ||
            d.content.toLowerCase().includes(query.toLowerCase()) ||
            Math.random() > 0.5 // Random match for demo
        );
    }
}
