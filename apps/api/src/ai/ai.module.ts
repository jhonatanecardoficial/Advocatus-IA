import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { DocumentDraftingService } from './document-drafting.service';
import { PrismaModule } from '../prisma/prisma.module';
import { McpClientService } from './mcp-client.service';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [AiService, DocumentDraftingService, McpClientService],
  exports: [AiService, DocumentDraftingService],
})
export class AiModule { }
