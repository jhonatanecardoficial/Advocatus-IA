"use client";

import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Clock, AlertCircle } from 'lucide-react';

interface Deadline {
  id: string;
  title: string;
  dueAt: string;
  type: string;
  priority: string;
}

interface Props {
  deadlines: Deadline[];
}

export default function DeadlinesCalendar({ deadlines }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const daysInMonth = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const date = new Date(year, month, 1);
    const days = [];
    
    // Fill previous month days
    const firstDayIndex = date.getDay();
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
    const lastDayIndex = new Date(year, month, lastDate).getDay();
    const nextDays = 6 - lastDayIndex;
    for (let i = 1; i <= nextDays; i++) {
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

  const getDeadlinesForDate = (date: Date) => {
    return deadlines.filter(d => {
      const dDate = new Date(d.dueAt);
      return dDate.getFullYear() === date.getFullYear() &&
             dDate.getMonth() === date.getMonth() &&
             dDate.getDate() === date.getDate();
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
            <h3 className="text-xl font-display font-black text-white uppercase tracking-tight mb-1">
                {monthName}
            </h3>
            <p className="text-[10px] font-black text-amber uppercase tracking-[0.2em] opacity-60">
                Agenda Processual
            </p>
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
          const dayDeadlines = getDeadlinesForDate(date);
          const isToday = new Date().toDateString() === date.toDateString();

          return (
            <div 
              key={idx} 
              className={`min-h-[140px] p-3 transition-colors ${
                isCurrentMonth ? 'bg-navy/20' : 'bg-black/20 opacity-30'
              } border-t border-white/5 hover:bg-white/5 group`}
            >
              <div className="flex justify-between items-start mb-2">
                <span className={`text-xs font-bold ${
                  isToday ? 'bg-amber text-navy w-6 h-6 rounded-full flex items-center justify-center' : 'text-slate-400 group-hover:text-white'
                }`}>
                  {date.getDate()}
                </span>
                {dayDeadlines.length > 0 && (
                    <span className="w-1.5 h-1.5 bg-amber rounded-full animate-pulse shadow-[0_0_8px_rgba(251,191,36,0.5)]" />
                )}
              </div>

              <div className="space-y-1">
                {dayDeadlines.map(d => (
                  <div 
                    key={d.id}
                    className={`px-2 py-1.5 rounded-lg text-[9px] font-bold tracking-tight border-l-2 truncate transition-all ${
                        d.priority === 'CRITICA' ? 'bg-red-500/10 text-red-400 border-red-500 hover:bg-red-500/20' :
                        d.priority === 'ALTA' ? 'bg-amber/10 text-amber border-amber hover:bg-amber/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500 hover:bg-blue-500/20'
                    }`}
                    title={d.title}
                  >
                    {d.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Agenda List for current month */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
        <div className="glass-panel p-6 border-white/5">
            <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-amber/10 flex items-center justify-center text-amber text-xs">
                    <Clock size={16} />
                </div>
                <h4 className="text-[11px] font-black uppercase text-white tracking-widest">Próximos Vencimentos</h4>
            </div>
            <div className="space-y-4">
                {deadlines
                    .filter(d => new Date(d.dueAt) >= new Date())
                    .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())
                    .slice(0, 4)
                    .map(d => (
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
                                        {new Date(d.dueAt).toLocaleDateString('pt-PT')} às {new Date(d.dueAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))
                }
                {deadlines.length === 0 && (
                    <p className="text-center py-8 text-xs text-slate-600 italic">Sem prazos agendados</p>
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
                <span className="text-white opacity-80 italic italic">A verificação final da data de vencimento é sempre da responsabilidade do advogado titular.</span>
            </p>
        </div>
      </div>
    </div>
  );
}
