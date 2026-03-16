import { Test, TestingModule } from '@nestjs/testing';
import { LegalTemplatesService } from './legal-templates.service';

describe('LegalTemplatesService', () => {
  let service: LegalTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LegalTemplatesService],
    }).compile();

    service = module.get<LegalTemplatesService>(LegalTemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
