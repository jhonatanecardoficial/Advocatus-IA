import { Module } from '@nestjs/common';
import { LegalTemplatesService } from './legal-templates.service';
import { LegalTemplatesController } from './legal-templates.controller';

import { DocumentsModule } from '../documents/documents.module';

@Module({
  imports: [DocumentsModule],
  providers: [LegalTemplatesService],
  controllers: [LegalTemplatesController]
})
export class LegalTemplatesModule {}
