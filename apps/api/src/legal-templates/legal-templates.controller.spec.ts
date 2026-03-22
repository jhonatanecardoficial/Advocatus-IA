import { Test, TestingModule } from '@nestjs/testing';
import { LegalTemplatesController } from './legal-templates.controller';
import { LegalTemplatesService } from './legal-templates.service';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
describe('LegalTemplatesController', () => {
  let controller: LegalTemplatesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LegalTemplatesController],
      providers: [
        { provide: JwtService, useValue: {} },
        { provide: PrismaService, useValue: {} },
        { provide: ConfigService, useValue: {} },
        {
          provide: LegalTemplatesService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            remove: jest.fn(),
            generateDocument: jest.fn(),
            refineDocument: jest.fn(),
            generatePdfBuffer: jest.fn(),
            saveToMatter: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<LegalTemplatesController>(LegalTemplatesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
