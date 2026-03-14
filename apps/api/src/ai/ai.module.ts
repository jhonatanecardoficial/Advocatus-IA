import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { DocumentDraftingService } from './document-drafting.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [AiController],
  providers: [AiService, DocumentDraftingService],
  exports: [AiService, DocumentDraftingService],
})
export class AiModule { }
