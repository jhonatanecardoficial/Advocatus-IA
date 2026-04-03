import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { DocumentDraftingService } from './document-drafting.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { RequestUser } from '../auth/strategies/jwt.strategy';

@Controller('ai')
@UseGuards(JwtAuthGuard)
export class AiController {
    constructor(
        private readonly aiService: AiService,
        private readonly draftingService: DocumentDraftingService,
    ) { }

    @Post('search')
    async search(@Body('query') query: string) {
        if (!query) {
            return { results: [], message: 'A query é obrigatória.' };
        }
        const response = await this.aiService.searchLegalDocuments(query);
        return {
            results: response.results,
            answer: response.answer
        };
    }

    @Post('draft')
    async generateDraft(
        @CurrentUser() user: RequestUser,
        @Body('matterId') matterId: string,
        @Body('type') type: string,
    ) {
        const draft = await this.draftingService.generateDraft(user.tenantId, matterId, type);
        return { draft };
    }

    @Post('refine')
    async refineDraft(
        @CurrentUser() user: RequestUser,
        @Body('matterId') matterId: string,
        @Body('currentContent') currentContent: string,
        @Body('instruction') instruction: string,
    ) {
        const draft = await this.draftingService.refineDraft(user.tenantId, matterId, currentContent, instruction);
        return { draft };
    }

    @Post('save-draft')
    async saveDraft(
        @CurrentUser() user: RequestUser,
        @Body('matterId') matterId: string,
        @Body('filename') filename: string,
        @Body('htmlContent') htmlContent: string,
    ) {
        return this.draftingService.saveDraft(user.tenantId, user.id, matterId, filename, htmlContent);
    }
}
