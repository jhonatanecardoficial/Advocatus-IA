import { Injectable } from '@nestjs/common';

@Injectable()
export class LegalDeadlineService {
  /**
   * Calcula a data de vencimento de um prazo processual seguindo o CPC Português.
   * Regras base: Art. 138.º CPC
   * 1. Prazo contínuo (corre em fins de semana e feriados).
   * 2. Suspende em férias judiciais (salvo processos urgentes).
   * 3. Se terminar em dia em que o tribunal esteja encerrado (fds/feriado), transfere para o 1.º dia útil seguinte.
   */
  calculateDeadline(params: {
    startDate: Date;
    days: number;
    isUrgent?: boolean;
    includeSuspension?: boolean;
    dilacao?: number;
  }): { dueAt: Date; penaltyLimitAt: Date } {
    const { startDate, days, isUrgent = false, includeSuspension = true, dilacao = 0 } = params;
    const currentDate = new Date(startDate);
    
    // 1. Aplicar Dilação (Art. 139.º e seguintes CPC) - a dilação conta antes do prazo
    if (dilacao > 0) {
      currentDate.setDate(currentDate.getDate() + dilacao);
    }

    // O prazo começa a correr no dia seguinte ao termo da dilação ou à notificação
    currentDate.setDate(currentDate.getDate() + 1);

    let remainingDays = days - 1;

    while (remainingDays > 0) {
      if (includeSuspension && !isUrgent && this.isJudicialHoliday(currentDate)) {
        currentDate.setDate(currentDate.getDate() + 1);
        continue;
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
      remainingDays--;
    }

    // Transferência para o útil seguinte
    while (this.isWeekend(currentDate) || this.isPublicHoliday(currentDate)) {
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const dueAt = new Date(currentDate);

    // 2. Regra dos 3 Dias Úteis com Multa (Art. 139.º n.º 5)
    const penaltyLimitAt = new Date(dueAt);
    let penaltyDaysCount = 0;
    while (penaltyDaysCount < 3) {
      penaltyLimitAt.setDate(penaltyLimitAt.getDate() + 1);
      if (!this.isWeekend(penaltyLimitAt) && !this.isPublicHoliday(penaltyLimitAt)) {
        penaltyDaysCount++;
      }
    }

    return { dueAt, penaltyLimitAt };
  }


  /**
   * Verifica se uma data cai em período de férias judiciais (Portugal)
   * Art. 28.º da LOSJ (Lei da Organização do Sistema Judiciário)
   * Verão: 16/jul a 31/ago
   * Natal: 22/dez a 3/jan
   * Páscoa: Domingo de Ramos a Segunda-feira de Pascoela
   */
  isJudicialHoliday(date: Date): boolean {
    const month = date.getMonth(); // 0-11
    const day = date.getDate();

    // Verão: 16/jul a 31/ago
    if ((month === 6 && day >= 16) || month === 7) return true;

    // Natal: 22/dez a 3/jan
    if ((month === 11 && day >= 22) || (month === 0 && day <= 3)) return true;

    // Páscoa (Móvel)
    const easter = this.calculateEaster(date.getFullYear());
    const palmSunday = new Date(easter);
    palmSunday.setDate(palmSunday.getDate() - 7);
    const easterMonday = new Date(easter);
    easterMonday.setDate(easterMonday.getDate() + 1);

    if (date >= palmSunday && date <= easterMonday) return true;

    return false;
  }

  isWeekend(date: Date): boolean {
    const day = date.getDay();
    return day === 0 || day === 6; // 0 = Domingo, 6 = Sábado
  }

  isPublicHoliday(date: Date): boolean {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Feriados Fixos
    const fixedHolidays = [
      { m: 0, d: 1 },   // Ano Novo
      { m: 3, d: 25 },  // 25 de Abril
      { m: 4, d: 1 },   // 1 de Maio
      { m: 5, d: 10 },  // 10 de Junho
      { m: 7, d: 15 },  // 15 de Agosto
      { m: 9, d: 5 },   // 5 de Outubro
      { m: 10, d: 1 },  // 1 de Novembro
      { m: 11, d: 1 },  // 1 de Dezembro
      { m: 11, d: 8 },  // 8 de Dezembro
      { m: 11, d: 25 }, // 25 de Dezembro
    ];

    if (fixedHolidays.some(h => h.m === month && h.d === day)) return true;

    // Feriados Móveis
    const easter = this.calculateEaster(year);
    
    // Carnaval (Terça-feira, 47 dias antes da Páscoa) - Nota: É feriado facultativo, mas tribunais fecham
    const carnival = new Date(easter);
    carnival.setDate(carnival.getDate() - 47);
    if (this.isSameDay(date, carnival)) return true;

    // Sexta-feira Santa (2 dias antes da Páscoa)
    const goodFriday = new Date(easter);
    goodFriday.setDate(goodFriday.getDate() - 2);
    if (this.isSameDay(date, goodFriday)) return true;

    // Corpo de Deus (Quinta-feira, 60 dias após a Páscoa)
    const corpusChristi = new Date(easter);
    corpusChristi.setDate(corpusChristi.getDate() + 60);
    if (this.isSameDay(date, corpusChristi)) return true;

    return false;
  }

  /**
   * Algoritmo de Butcher-Meeus para cálculo da Páscoa
   */
  private calculateEaster(year: number): Date {
    const a = year % 19;
    const b = Math.floor(year / 100);
    const c = year % 100;
    const d = Math.floor(b / 4);
    const e = b % 4;
    const f = Math.floor((b + 8) / 25);
    const g = Math.floor((b - f + 1) / 3);
    const h = (19 * a + b - d - g + 15) % 30;
    const i = Math.floor(c / 4);
    const k = c % 4;
    const l = (32 + 2 * e + 2 * i - h - k) % 7;
    const m = Math.floor((a + 11 * h + 22 * l) / 451);
    const month = Math.floor((h + l - 7 * m + 114) / 31);
    const day = ((h + l - 7 * m + 114) % 31) + 1;
    return new Date(year, month - 1, day);
  }

  private isSameDay(d1: Date, d2: Date): boolean {
    return d1.getFullYear() === d2.getFullYear() &&
           d1.getMonth() === d2.getMonth() &&
           d1.getDate() === d2.getDate();
  }
}
