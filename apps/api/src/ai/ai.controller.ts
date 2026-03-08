import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
    constructor(private readonly aiService: AiService) { }

    @Post('search')
    async search(@Body('query') query: string) {
        if (!query) {
            return { results: [], message: 'A query é obrigatória.' };
        }
        const results = await this.aiService.searchLegalDocuments(query);
        return { results };
    }
}
