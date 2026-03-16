import { Test, TestingModule } from '@nestjs/testing';
import { LegalTemplatesController } from './legal-templates.controller';

describe('LegalTemplatesController', () => {
  let controller: LegalTemplatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LegalTemplatesController],
    }).compile();

    controller = module.get<LegalTemplatesController>(LegalTemplatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
