"use client";

import { motion } from 'framer-motion';
import { X, Clock, Briefcase } from 'lucide-react';

interface Task {
    id: string;
    title: string;
    description?: string | null;
    type: string;
    priority: string;
    dueAt?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    matter?: { id: string; title: string } | null;
}

interface DayPopupProps {
    date: Date;
    tasks: Task[];
    onClose: () => void;
}

export default function DayPopup({ date, tasks, onClose }: DayPopupProps) {
    const hours = Array.from({ length: 24 }, (_, i) => i);
    
    const formattedDate = date.toLocaleDateString('pt-PT', { 
        weekday: 'long', 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
    });

    // Helper para converter hora ISO em minutos desde o início do dia
    const getMinutes = (isoString?: string | null) => {
        if (!isoString) return 0;
        const d = new Date(isoString);
        return d.getHours() * 60 + d.getMinutes();
    };

    const priorityColor = (priority: string) => {
        switch (priority) {
            case 'CRITICA': return 'border-l-red-500 bg-red-500/10 text-red-200';
            case 'ALTA': return 'border-l-amber bg-amber/10 text-amber-200';
            case 'MEDIA': return 'border-l-blue-500 bg-blue-500/10 text-blue-200';
            default: return 'border-l-green-500 bg-green-500/10 text-green-200';
        }
    };

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-md animate-in fade-in duration-300">
            <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="glass-panel w-full max-w-2xl h-[80vh] flex flex-col overflow-hidden border-white/10 shadow-2xl"
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 bg-navy/80 shrink-0 flex justify-between items-center">
                    <div>
                        <h3 className="text-white font-display font-black uppercase tracking-widest text-lg">Agenda do Dia</h3>
                        <p className="text-slate-400 text-xs font-mono uppercase mt-1">{formattedDate}</p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="p-2 hover:bg-white/10 rounded-full text-white transition-all shadow-glow"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Day Grid 24h */}
                <div className="flex-1 overflow-y-auto custom-scrollbar bg-black/20 p-6">
                    <div className="relative min-h-[1440px]"> {/* 24h * 60px/hour */}
                        {/* Hour Labels & Lines */}
                        {hours.map(hour => (
                            <div key={hour} className="absolute w-full flex items-start group" style={{ top: `${hour * 60}px` }}>
                                <span className="w-16 pr-4 text-[10px] font-mono font-bold text-slate-500 text-right -translate-y-1/2 group-hover:text-amber transition-colors">
                                    {hour.toString().padStart(2, '0')}:00
                                </span>
                                <div className="flex-1 border-t border-white/5 h-1 group-hover:border-white/10 transition-colors" />
                            </div>
                        ))}

                        {/* Task Cards */}
                        {tasks.map(task => {
                            const startMin = task.startDate ? getMinutes(task.startDate) : (task.dueAt ? getMinutes(task.dueAt) : 0);
                            const endMin = task.endDate ? getMinutes(task.endDate) : (startMin + 60);
                            const duration = Math.max(endMin - startMin, 30); // mínimo 30 min para visibilidade

                            return (
                                <motion.div
                                    key={task.id}
                                    whileHover={{ scale: 1.01, zIndex: 10 }}
                                    className={`absolute left-20 right-4 p-4 rounded-xl border-l-[4px] shadow-premium-lg flex flex-col transition-all cursor-pointer ${priorityColor(task.priority)}`}
                                    style={{ 
                                        top: `${startMin}px`, 
                                        height: `${duration}px`,
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                                    }}
                                >
                                    <div className="flex justify-between items-start gap-2">
                                        <h4 className="font-bold text-xs uppercase tracking-tight text-white leading-tight truncate">
                                            {task.title}
                                        </h4>
                                        <span className="text-[9px] font-black opacity-60 uppercase bg-black/20 px-1.5 py-0.5 rounded shrink-0">
                                            {task.type}
                                        </span>
                                    </div>
                                    {duration > 45 && (
                                        <div className="mt-2 flex flex-col gap-1 overflow-hidden">
                                            <div className="flex items-center gap-1.5 text-[9px] font-bold opacity-70">
                                                <Briefcase size={10} className="text-amber" />
                                                <span className="truncate">{task.matter?.title || 'Sem processo'}</span>
                                            </div>
                                            {task.description && (
                                                <p className="text-[9px] opacity-60 leading-tight line-clamp-2 italic">
                                                    {task.description}
                                                </p>
                                            )}
                                        </div>
                                    )}
                                    <div className="mt-auto flex items-center gap-1 text-[8px] font-mono font-black opacity-50 uppercase tracking-tighter">
                                        <Clock size={8} />
                                        {task.startDate ? new Date(task.startDate).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                        {' - '}
                                        {task.endDate ? new Date(task.endDate).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }) : '--:--'}
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Current Time Indicator (se for hoje) */}
                        {new Date().toDateString() === date.toDateString() && (
                            <div 
                                className="absolute left-16 right-0 border-t-2 border-amber z-20 flex items-center"
                                style={{ top: `${new Date().getHours() * 60 + new Date().getMinutes()}px` }}
                            >
                                <div className="w-2 h-2 bg-amber rounded-full -ml-1 shadow-[0_0_10px_#fbbf24]" />
                                <span className="absolute left-[-45px] bg-amber text-navy text-[9px] font-black px-1.5 py-0.5 rounded shadow-lg uppercase tracking-widest">
                                    Agora
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Footer Footer */}
                <div className="p-4 bg-navy border-t border-white/5 flex justify-center shrink-0">
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.2em]">
                        Advocatus IA — Gestão de Agenda Inteligente
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
