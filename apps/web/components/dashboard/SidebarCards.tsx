"use client";

import { motion } from "framer-motion";
import { Zap, Calendar, CheckCircle2 } from "lucide-react";
import Link from 'next/link';

interface TodayTask {
    id: string;
    title: string;
    dueAt: string;
    type: string;
    priority: string;
    matter?: { id: string; title: string } | null;
}

interface DashboardSidebarCardsProps {
    todayTasks?: TodayTask[];
}

// Formata a data actual para exibição — ex: "21 DE MAR"
function formatTodayDate(): string {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const months = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];
    return `${day} DE ${months[now.getMonth()]}`;
}

// Formata hora de uma string ISO para "HH:MM"
function formatTime(isoStr: string): string {
    try {
        return new Date(isoStr).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
    } catch {
        return '--:--';
    }
}

// Cor da prioridade para o indicador do evento
function priorityColor(priority: string): string {
    switch (priority) {
        case 'CRITICA': return 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.5)]';
        case 'ALTA': return 'bg-amber shadow-[0_0_8px_rgba(251,191,36,0.5)]';
        default: return 'bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]';
    }
}

export default function DashboardSidebarCards({ todayTasks = [] }: DashboardSidebarCardsProps) {
    const hasTasks = todayTasks.length > 0;

    return (
        <div className="space-y-8">
            {/* AI Assistant Card — CTA para Intelligence */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel p-8 bg-gradient-to-br from-navy to-navy-900 text-white relative overflow-hidden group border border-white/10 shadow-premium-lg"
            >
                <div className="absolute -top-10 -right-10 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                    <Zap size={200} className="text-amber animate-pulse" />
                </div>
                <div className="relative z-10 flex flex-col h-full">
                    <div className="flex items-center gap-3 mb-6">
                        <motion.div
                            whileHover={{ rotate: 15 }}
                            className="p-2 bg-amber rounded-lg shadow-lg"
                        >
                            <Zap size={20} className="text-navy" />
                        </motion.div>
                        <div>
                            <h3 className="text-lg font-display font-black text-amber leading-none uppercase tracking-tight">Vanguarda IA</h3>
                            <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Inteligência Jurídica</span>
                        </div>
                    </div>
                    <p className="text-sm text-slate-300 font-medium leading-relaxed mb-8">
                        Análise de jurisprudência e insights jurídicos em tempo real para os seus processos activos.
                    </p>
                    <Link href="/intelligence" aria-label="Abrir módulo de Inteligência Jurídica">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="w-full bg-white text-navy py-4 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-amber transition-all shadow-xl"
                        >
                            Explorar Inteligência Jurídica
                        </motion.button>
                    </Link>
                </div>
            </motion.div>

            {/* Agenda Card — Tarefas Reais do Dia */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="glass-panel p-8 border border-white/10 shadow-premium-lg bg-navy/40 backdrop-blur-xl group overflow-hidden relative"
            >
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber/5 blur-[80px] -mr-10 -mt-10" />

                <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4 relative z-10">
                    <h3 className="text-xs font-black uppercase tracking-[0.15em] text-white/80 flex items-center gap-2">
                        <Calendar size={16} className="text-amber" />
                        Agenda Hoje
                    </h3>
                    {/* Data dinâmica */}
                    <span className="text-[10px] font-mono text-amber/60 font-bold uppercase tracking-widest">
                        {formatTodayDate()}
                    </span>
                </div>

                <div className="space-y-4 relative z-10">
                    {hasTasks ? (
                        todayTasks.map((task, idx) => (
                            <motion.div
                                key={task.id}
                                whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.05)" }}
                                className={`group flex gap-5 items-start p-4 rounded-2xl border transition-all cursor-pointer ${
                                    idx === 0
                                        ? "bg-white/5 border-white/20 shadow-premium-lg hover:border-amber/40"
                                        : "bg-black/20 border-white/5 hover:border-amber/20 opacity-80 hover:opacity-100"
                                }`}
                            >
                                <div className="flex flex-col items-center flex-shrink-0">
                                    <div className={`font-mono text-[11px] font-black px-3 py-1.5 rounded-lg shadow-sm ${
                                        idx === 0 ? "text-navy bg-amber" : "text-amber bg-white/5 border border-white/10"
                                    }`}>
                                        {formatTime(task.dueAt)}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className={`font-bold text-sm uppercase tracking-tight mb-1 group-hover:text-amber transition-colors truncate ${
                                        idx === 0 ? "text-white" : "text-white/70"
                                    }`}>
                                        {task.title}
                                    </div>
                                    <div className="text-[10px] text-white/50 font-bold flex items-center gap-2 uppercase tracking-tight">
                                        <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${priorityColor(task.priority)}`} />
                                        <span className="truncate">{task.matter?.title ?? task.type}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        /* Estado vazio — Sem eventos para hoje */
                        <div className="flex flex-col items-center gap-3 py-8 text-center">
                            <CheckCircle2 size={32} className="text-green-400 opacity-60" />
                            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Sem eventos para hoje</p>
                            <p className="text-[10px] text-slate-600">Bom trabalho! A agenda está livre.</p>
                        </div>
                    )}
                </div>

                <Link href="/tasks" aria-label="Ver Calendário Completo de Prazos">
                    <button
                        className="w-full mt-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-amber/60 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10"
                    >
                        Ver Calendário Completo
                    </button>
                </Link>
            </motion.div>
        </div>
    );
}
