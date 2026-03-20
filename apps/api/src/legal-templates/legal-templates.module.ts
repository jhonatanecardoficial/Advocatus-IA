import { Module } from '@nestjs/common';
import { LegalTemplatesService } from './legal-templates.service';
import { LegalTemplatesController } from './legal-templates.controller';
import { DocumentsModule } from '../documents/documents.module';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [DocumentsModule, AiModule],
  providers: [LegalTemplatesService],
  controllers: [LegalTemplatesController]
})
export class LegalTemplatesModule {}
