import { Test, TestingModule } from '@nestjs/testing';
import { LegalDeadlineService } from './legal-deadline.service';

describe('LegalDeadlineService', () => {
  let service: LegalDeadlineService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LegalDeadlineService],
    }).compile();

    service = module.get<LegalDeadlineService>(LegalDeadlineService);
  });

  it('deve estar definido', () => {
    expect(service).toBeDefined();
  });

  describe('Cálculo de Prazos (Art. 138.º e 139.º CPC)', () => {
    
    it('deve calcular um prazo normal de 15 dias (sem suspensão)', () => {
      // 1 de Setembro de 2025 (Segunda-feira)
      const startDate = new Date('2025-09-01T10:00:00Z');
      const { dueAt, penaltyLimitAt } = service.calculateDeadline({
        startDate,
        days: 15,
        includeSuspension: false,
      });

      // Começa 2 Set, +14 dias = 16 Set (Terça-feira)
      expect(dueAt.toISOString()).toContain('2025-09-16');
      
      // Multa de 3 dias úteis: 17, 18, 19 Set
      expect(penaltyLimitAt.toISOString()).toContain('2025-09-19');
    });

    it('deve aplicar dilação de 5 dias corretamente', () => {
      // 1 de Setembro de 2025
      const startDate = new Date('2025-09-01T10:00:00Z');
      const { dueAt } = service.calculateDeadline({
        startDate,
        days: 10,
        dilacao: 5,
        includeSuspension: false,
      });

      // 1 Set + 5 dilação = 6 Set (Sexta)
      // Prazo começa 7 Set? Não, Art 139 diz que prazo começa após dilação.
      // Se termina 6 Set (Sábado), o primeiro dia útil de prazo seria Segunda 8 Set? 
      // Na verdade, a dilação conta dias seguidos.
      // 1 Set (Seg) + 5 dias = 6 Set (Sábado)
      // O prazo de 10 dias começa a contar no dia útil seguinte ao termo da dilação (ou no próprio dia se for útil?)
      // Regra geral: O prazo começa no dia seguinte.
      // 6 Set + 1 = 7 Set (Domingo)
      // + 9 dias = 16 Set. Mas termina num útil?
      // Vamos verificar a lógica implementada: currentDate.setDate(currentDate.getDate() + dilacao) -> 6 Set.
      // O prazo começa 7 Set. + 9 dias -> 16 Set (Terça).
      expect(dueAt.toISOString()).toContain('2025-09-16');
    });

    it('deve suspender o prazo durante as férias judiciais de Verão', () => {
      // 10 de Julho de 2025 (Quinta)
      // Prazo de 30 dias.
      // Férias começam 16 Julho até 31 Agosto.
      const startDate = new Date('2025-07-10T10:00:00Z');
      const { dueAt } = service.calculateDeadline({
        startDate,
        days: 30,
        includeSuspension: true,
      });

      // 11 Julho a 15 Julho = 5 dias decorridos.
      // Restam 25 dias.
      // Suspensão de 16 Julho a 31 Agosto.
      // Retoma 1 Setembro. + 25 dias = 25 Set (Quinta).
      expect(dueAt.toISOString()).toContain('2025-09-25');
    });

    it('deve suspender o prazo durante as férias de Natal', () => {
      // 18 de Dezembro de 2025 (Quinta)
      const startDate = new Date('2025-12-18T10:00:00Z');
      const { dueAt } = service.calculateDeadline({
        startDate,
        days: 10,
        includeSuspension: true,
      });

      // 19, 20, 21 Dez (3 dias)
      // 22 Dez a 3 Jan (Férias Natal)
      // 4 Jan (Domingo) - Transfere 
      // 5 Jan (Segunda) - 4º dia... 
      // Na verdade, 4 Jan (Domingo) retoma. Day 4.
      // 5 Jan (Day 5), 6(6), 7(7), 8(8), 9(9), 10(10) -> 10 Jan (Sábado)
      // Transfere para 12 Jan (Segunda)
      expect(dueAt.toISOString()).toContain('2026-01-12');
    });

    it('deve transferir o termo para o útil seguinte se terminar em fim de semana', () => {
      // 1 de Setembro de 2025 (Seg)
      // Prazo de 5 dias.
      const startDate = new Date('2025-09-01T10:00:00Z');
      const { dueAt } = service.calculateDeadline({
        startDate,
        days: 5,
        includeSuspension: false,
      });

      // 2, 3, 4, 5, 6 Set (Sábado)
      // Transfere para 8 Set (Segunda)
      expect(dueAt.toISOString()).toContain('2025-09-08');
    });

    it('deve calcular corretamente a dilação de 30 dias para fora da Europa', () => {
      const startDate = new Date('2025-09-01T10:00:00Z');
      const { dueAt } = service.calculateDeadline({
        startDate,
        days: 15,
        dilacao: 30,
        includeSuspension: false,
      });

      // 1 Set + 30 = 1 Out (Quarta)
      // Prazo começa 2 Out. + 14 dias = 16 Out (Quinta)
      expect(dueAt.toISOString()).toContain('2025-10-16');
    });
  });
});
