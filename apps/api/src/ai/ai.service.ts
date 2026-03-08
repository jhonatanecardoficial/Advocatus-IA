import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class AiService {
    private openai: OpenAI;

    constructor(
        private prisma: PrismaService,
        private configService: ConfigService,
    ) {
        this.openai = new OpenAI({
            apiKey: this.configService.get<string>('OPENAI_API_KEY'),
        });
    }

    async generateEmbedding(text: string): Promise<number[]> {
        const response = await this.openai.embeddings.create({
            model: 'text-embedding-3-small',
            input: text,
        });
        return response.data[0].embedding;
    }

    async searchLegalDocuments(query: string, limit = 5) {
        const embedding = await this.generateEmbedding(query);
        const vectorString = `[${embedding.join(',')}]`;

        const results = await this.prisma.$queryRawUnsafe<any[]>(`
      SELECT id, title, source, type, content, reference, url,
      1 - (embedding <=> $1::vector) as similarity
      FROM legal_documents
      WHERE embedding IS NOT NULL
      ORDER BY embedding <=> $1::vector
      LIMIT $2
    `, vectorString, limit);

        return results;
    }
}
