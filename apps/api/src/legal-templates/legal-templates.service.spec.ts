import { Test, TestingModule } from '@nestjs/testing';
import { LegalTemplatesService } from './legal-templates.service';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { DocumentsService } from '../documents/documents.service';

describe('LegalTemplatesService', () => {
  let service: LegalTemplatesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LegalTemplatesService,
        {
          provide: PrismaService,
          useValue: {
            legalTemplate: {
              create: jest.fn(),
              findMany: jest.fn(),
              findFirst: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
            matter: {
              findFirst: jest.fn(),
            },
          },
        },
        {
          provide: AiService,
          useValue: {
            chatWithContext: jest.fn(),
          },
        },
        {
          provide: DocumentsService,
          useValue: {
            confirmUpload: jest.fn(),
            supabase: {
              storage: {
                from: jest.fn().mockReturnThis(),
                upload: jest.fn(),
              },
            },
            storageBucket: 'test-bucket',
          },
        },
      ],
    }).compile();

    service = module.get<LegalTemplatesService>(LegalTemplatesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
