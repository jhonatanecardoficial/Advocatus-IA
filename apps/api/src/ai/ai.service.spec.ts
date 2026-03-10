import { Test, TestingModule } from '@nestjs/testing';
import { AiService } from './ai.service';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { AuditService } from '../audit/audit.service';

describe('AiService', () => {
    let service: AiService;
    let audit: AuditService;

    const mockPrismaService = {
        $queryRawUnsafe: jest.fn(),
    };

    const mockConfigService = {
        get: jest.fn((key, defaultValue) => {
            if (key === 'LLM_PROVIDER') return 'gemini';
            if (key === 'LLM_MODEL') return 'gemini-1.5-flash';
            return defaultValue || 'test-key';
        }),
    };

    const mockAuditService = {
        log: jest.fn().mockResolvedValue({ id: 'log-1' }),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AiService,
                { provide: PrismaService, useValue: mockPrismaService },
                { provide: ConfigService, useValue: mockConfigService },
                { provide: AuditService, useValue: mockAuditService },
            ],
        }).compile();

        service = module.get<AiService>(AiService);
        audit = module.get<AuditService>(AuditService);

        // Mock properties and init
        (service as any).provider = 'gemini';
        service.onModuleInit = jest.fn();
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    it('should return mock results when DB query returns empty', async () => {
        (service as any).generateEmbedding = jest.fn().mockResolvedValue(null);
        mockPrismaService.$queryRawUnsafe.mockResolvedValueOnce([]);

        const response = await service.searchLegalDocuments('contrato');

        expect(response.results).toBeDefined();
        expect(response.results.length).toBeGreaterThan(0);
        expect(response.results[0].id).toContain('mock');
    });

    it('should log audit action when performing search', async () => {
        (service as any).generateEmbedding = jest.fn().mockResolvedValue([0.1, 0.2]);
        (service as any).chatWithContext = jest.fn().mockResolvedValue('RESPOSTA TESTE');

        mockPrismaService.$queryRawUnsafe.mockResolvedValueOnce([
            { id: '1', title: 'Test doc', similarity: 0.9, content: 'conteudo' }
        ]);

        await service.searchLegalDocuments('teste');

        expect(audit.log).toHaveBeenCalledWith(
            expect.objectContaining({
                action: 'AI_RAG_SEARCH',
                resourceType: 'AI'
            })
        );
    });
});
