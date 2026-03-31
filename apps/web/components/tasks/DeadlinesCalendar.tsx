"use client";

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, AlertCircle, Info } from 'lucide-react';
import DayPopup from './DayPopup';

interface CalendarTask {
  id: string;
  title: string;
  description?: string | null;
  dueAt?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  type: string;
  priority: string;
  matter?: { id: string; title: string } | null;
}

interface Props {
  deadlines: CalendarTask[];
}

export default function DeadlinesCalendar({ deadlines }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    
    // Fill previous month days
    const firstDayIndex = (date.getDay() + 6) % 7; // Ajuste para começar na Segunda (0=Seg, 6=Dom)
    const prevMonthLastDate = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex; i > 0; i--) {
      days.push({ 
        date: new Date(year, month - 1, prevMonthLastDate - i + 1),
        isCurrentMonth: false 
      });
    }

    // Current month days
    const lastDate = new Date(year, month + 1, 0).getDate();
    for (let i = 1; i <= lastDate; i++) {
      days.push({ 
        date: new Date(year, month, i),
        isCurrentMonth: true 
      });
    }

    // Fill next month days
    const totalDaysSoFar = days.length;
    const remainingSlots = 42 - totalDaysSoFar; // 6 rows * 7 days
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false
      });
    }

    return days;
  }, [currentDate]);

  const monthName = currentDate.toLocaleString('pt-PT', { month: 'long', year: 'numeric' });

  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));

  const getTasksForDate = (date: Date) => {
    return deadlines.filter(t => {
      const dDate = t.startDate ? new Date(t.startDate) : (t.dueAt ? new Date(t.dueAt) : null);
      if (!dDate) return false;
      return dDate.getFullYear() === date.getFullYear() &&
             dDate.getMonth() === date.getMonth() &&
             dDate.getDate() === date.getDate();
    });
  };

  const isWeekend = (date: Date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const calculateEaster = (year: number) => {
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
  };

  const isJudicialHoliday = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth(); // 0-indexed
    const day = date.getDate();
    
    // Verão: 16 Julho a 31 Agosto
    if ((month === 6 && day >= 16) || (month === 7)) return true;
    
    // Natal: 22 Dezembro a 3 Janeiro
    if ((month === 11 && day >= 22) || (month === 0 && day <= 3)) return true;

    // Páscoa (Móvel): Domingo de Ramos a Segunda de Pascoela
    const easter = calculateEaster(year);
    const palmSunday = new Date(easter);
    palmSunday.setDate(palmSunday.getDate() - 7);
    const easterMonday = new Date(easter);
    easterMonday.setDate(easterMonday.getDate() + 1);

    if (date >= palmSunday && date <= easterMonday) return true;
    
    return false;
  };

  const isPublicHoliday = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();

    // Feriados Fixos
    const fixedHolidays = [
      { m: 0, d: 1 }, { m: 3, d: 25 }, { m: 4, d: 1 }, { m: 5, d: 10 },
      { m: 7, d: 15 }, { m: 9, d: 5 }, { m: 10, d: 1 }, { m: 11, d: 1 },
      { m: 11, d: 8 }, { m: 11, d: 25 },
    ];
    if (fixedHolidays.some(h => h.m === month && h.d === day)) return true;

    // Feriados Móveis
    const easter = calculateEaster(year);
    const isSameDay = (d1: Date, d2: Date) => 
      d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();

    const goodFriday = new Date(easter); goodFriday.setDate(goodFriday.getDate() - 2);
    if (isSameDay(date, goodFriday)) return true;

    const corpusChristi = new Date(easter); corpusChristi.setDate(corpusChristi.getDate() + 60);
    if (isSameDay(date, corpusChristi)) return true;

    return false;
  };

  return (
    <div className="space-y-6 relative">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mb-1">
                {monthName}
            </h3>
            <div className="flex items-center gap-4">
                <p className="text-[10px] font-black text-amber uppercase tracking-[0.2em] opacity-60">
                    Agenda & Prazos
                </p>
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-slate-800" />
                        <span className="text-[8px] font-bold text-slate-500 uppercase">Suspensão (CPC)</span>
                    </div>
                </div>
            </div>
        </div>
        <div className="flex gap-2">
            <button 
                onClick={prevMonth}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-amber hover:text-navy transition-all"
            >
                <ChevronLeft size={20} />
            </button>
            <button 
                onClick={nextMonth}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-amber hover:text-navy transition-all"
            >
                <ChevronRight size={20} />
            </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px bg-white/5 border border-white/10 rounded-2xl overflow-hidden shadow-2xl">
        {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(day => (
          <div key={day} className="bg-navy/50 py-4 text-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{day}</span>
          </div>
        ))}

        {daysInMonth.map(({ date, isCurrentMonth }, idx) => {
          const dayTasks = getTasksForDate(date);
          const isToday = new Date().toDateString() === date.toDateString();
          const holiday = isJudicialHoliday(date);
          const weekend = isWeekend(date);
          const publicHoliday = isPublicHoliday(date);
          const isSuspended = holiday || weekend || publicHoliday;

          return (
            <div 
              key={idx} 
              onClick={() => setSelectedDate(date)}
              className={`min-h-[140px] p-3 transition-all cursor-pointer relative ${
                isCurrentMonth ? (isSuspended ? 'bg-black/40' : 'bg-navy/20') : 'bg-black/30 opacity-20'
              } border-t border-white/5 hover:bg-white/5 group`}
            >
              <div className="flex justify-between items-start mb-2 relative z-10">
                <span className={`text-xs font-bold ${
                  isToday ? 'bg-amber text-navy w-6 h-6 rounded-full flex items-center justify-center shadow-glow' : 
                  isSuspended ? 'text-slate-600' : 'text-slate-400 group-hover:text-white'
                }`}>
                  {date.getDate()}
                </span>
                
                {dayTasks.length > 0 && (
                    <div className="flex gap-1">
                        {dayTasks.slice(0, 3).map(t => (
                            <div key={t.id} className={`w-1.5 h-1.5 rounded-full ${
                                t.priority === 'CRITICA' ? 'bg-red-500 shadow-[0_0_5px_red]' : 
                                t.priority === 'ALTA' ? 'bg-amber shadow-[0_0_5px_#fbbf24]' : 
                                'bg-blue-500'
                            }`} />
                        ))}
                        {dayTasks.length > 3 && <span className="text-[8px] font-black text-amber">+</span>}
                    </div>
                )}
              </div>

              {/* Destaque visual para suspensão */}
              {isSuspended && isCurrentMonth && (
                <div className="absolute inset-0 bg-stripe-pattern opacity-[0.03] pointer-events-none" />
              )}

              <div className="space-y-1 relative z-10">
                {dayTasks.slice(0, 3).map(t => (
                  <div 
                    key={t.id}
                    className={`px-2 py-1 rounded-lg text-[9px] font-bold tracking-tight border-l-2 truncate transition-all ${
                        t.priority === 'CRITICA' ? 'bg-red-500/10 text-red-400 border-red-500' :
                        t.priority === 'ALTA' ? 'bg-amber/10 text-amber border-amber' :
                        'bg-blue-500/10 text-blue-400 border-blue-500'
                    }`}
                  >
                    {t.startDate ? `${new Date(t.startDate).getHours()}:${new Date(t.startDate).getMinutes().toString().padStart(2, '0')} ` : ''}
                    {t.title}
                  </div>
                ))}
                {dayTasks.length > 3 && (
                    <div className="text-[8px] font-black text-slate-500 uppercase text-center mt-1">
                        + {dayTasks.length - 3} itens
                    </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex gap-6 items-center px-4 py-3 bg-white/5 rounded-xl border border-white/10 w-fit">
        <div className="flex items-center gap-2">
            <Info size={14} className="text-slate-500" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Clique num dia para ver a agenda detalhada (24h)</span>
        </div>
      </div>

      {/* Agenda List for current month */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="glass-panel p-6 border-white/5">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center text-amber text-xs">
                    <Clock size={16} />
                </div>
                <h4 className="text-[11px] font-black uppercase text-white tracking-widest">Próximos Compromissos</h4>
            </div>
            <div className="space-y-4">
                {deadlines
                    .filter(d => {
                        const date = d.startDate ? new Date(d.startDate) : (d.dueAt ? new Date(d.dueAt) : null);
                        return date && date >= new Date();
                    })
                    .sort((a, b) => {
                        const dateA = a.startDate ? new Date(a.startDate) : (a.dueAt ? new Date(a.dueAt) : new Date(0));
                        const dateB = b.startDate ? new Date(b.startDate) : (b.dueAt ? new Date(b.dueAt) : new Date(0));
                        return dateA.getTime() - dateB.getTime();
                    })
                    .slice(0, 4)
                    .map(d => {
                        const date = d.startDate ? new Date(d.startDate) : (d.dueAt ? new Date(d.dueAt) : new Date());
                        return (
                            <div key={d.id} className="flex items-center justify-between group cursor-default">
                                <div className="flex items-center gap-3">
                                    <div className={`w-1 h-8 rounded-full ${
                                        d.priority === 'CRITICA' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]' :
                                        d.priority === 'ALTA' ? 'bg-amber shadow-[0_0_8px_rgba(251,191,36,0.4)]' :
                                        'bg-blue-500'
                                    }`} />
                                    <div>
                                        <p className="text-xs font-bold text-white group-hover:text-amber transition-colors line-clamp-1">{d.title}</p>
                                        <p className="text-[9px] font-medium text-slate-500 uppercase tracking-tighter">
                                            {date.toLocaleDateString('pt-PT')} às {date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </div>
                                <span className="text-[8px] font-black px-1.5 py-0.5 rounded bg-white/5 text-slate-500 uppercase">{d.type}</span>
                            </div>
                        );
                    })
                }
                {deadlines.length === 0 && (
                    <p className="text-center py-8 text-xs text-slate-600 italic">Sem itens na agenda</p>
                )}
            </div>
        </div>

        <div className="glass-panel p-6 border-white/5 bg-amber/5">
            <div className="flex items-center gap-3 mb-4">
                <AlertCircle size={18} className="text-amber" />
                <h4 className="text-[11px] font-black uppercase text-amber tracking-widest">Aviso Legal (CPC)</h4>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                Os prazos indicados com base em "Cálculo Assistido" seguem as regras de contagem contínua (Art. 138.º CPC), incluindo suspensões em férias judiciais. 
                <br/><br/>
                <span className="text-white opacity-80 italic">A verificação final da data de vencimento é sempre da responsabilidade do advogado titular.</span>
            </p>
        </div>
      </div>

      {/* Selection Modal / DayPopup */}
      {selectedDate && (
        <DayPopup 
            date={selectedDate}
            tasks={getTasksForDate(selectedDate)}
            onClose={() => setSelectedDate(null)}
        />
      )}
    </div>
  );
}
