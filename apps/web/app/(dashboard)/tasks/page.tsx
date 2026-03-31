"use client";

import { useState, useEffect } from 'react';
import { Calendar, Filter, Plus, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import DeadlinesCalendar from '@/components/tasks/DeadlinesCalendar';
import AddTaskModal from '@/components/AddTaskModal';
import { toast } from 'sonner';

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [filter, setFilter] = useState('ALL');
  const [timeFilter, setTimeFilter] = useState('ANYTIME');

  async function loadTasks() {
    try {
      setLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      
      const res = await fetch(`${API_URL}/tasks`, {
        credentials: 'include',
      });
      
      if (res.ok) {
        const data = await res.json();
        setTasks(data);
      } else {
        toast.error('Erro ao carregar agenda');
      }
    } catch (err) {
      console.error('Erro ao carregar tarefas:', err);
      toast.error('Falha de ligação ao servidor');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  const filteredTasks = tasks.filter(t => {
    // Priority filter
    if (filter !== 'ALL' && t.priority !== filter) return false;

    // Time filter
    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const dDate = t.startDate ? new Date(t.startDate) : (t.dueAt ? new Date(t.dueAt) : null);
    if (!dDate) return timeFilter === 'ANYTIME';

    const dStr = dDate.toISOString().slice(0, 10);

    if (timeFilter === 'HOJE') return dStr === todayStr;
    if (timeFilter === 'AMANHA') {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        return dStr === tomorrow.toISOString().slice(0, 10);
    }
    if (timeFilter === 'SEMANA') {
        const nextWeek = new Date(now);
        nextWeek.setDate(now.getDate() + 7);
        return dDate >= now && dDate <= nextWeek;
    }
    if (timeFilter === 'ATRASADOS') return dDate < now && t.status !== 'COMPLETED';

    return true;
  });

  return (
    <div className="space-y-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center text-amber text-lg">
                <Calendar size={20} />
            </div>
            <h1 className="text-4xl font-display font-black text-white uppercase tracking-tighter">Prazos & Agenda</h1>
          </div>
          <p className="text-slate-400 font-medium tracking-wide max-w-xl">
            Central de controlo processual. Visualize prazos críticos, audiências e diligências baseadas no CPC Português.
          </p>
        </motion.div>

        <div className="flex gap-4">
            <button 
                onClick={() => setIsAddTaskOpen(true)}
                className="px-8 py-4 bg-amber text-navy font-black text-xs uppercase tracking-widest rounded-2xl flex items-center gap-2 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-amber/20"
            >
                <Plus size={16} />
                Novo Prazo / Evento
            </button>
        </div>
      </div>

      {/* Temporal Filters Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex gap-3 overflow-x-auto pb-2 scrollbar-none"
      >
        {[
            { id: 'ANYTIME', label: 'Todo o Calendário' },
            { id: 'HOJE', label: 'Hoje' },
            { id: 'AMANHA', label: 'Amanhã' },
            { id: 'SEMANA', label: 'Esta Semana' },
            { id: 'ATRASADOS', label: 'Atrasados' },
        ].map(tf => (
            <button
                key={tf.id}
                onClick={() => setTimeFilter(tf.id)}
                className={`flex-shrink-0 px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                    timeFilter === tf.id ? 'bg-white text-navy shadow-lg' : 'bg-white/5 text-slate-400 hover:bg-white/10'
                }`}
            >
                {tf.label}
            </button>
        ))}
      </motion.div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Calendar Section */}
        <div className="lg:col-span-9 space-y-8">
            <motion.div 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 min-h-[600px] border-white/10"
            >
                {loading ? (
                    <div className="h-[500px] flex items-center justify-center">
                        <div className="w-10 h-10 border-4 border-amber/20 border-t-amber rounded-full animate-spin" />
                    </div>
                ) : (
                    <DeadlinesCalendar deadlines={filteredTasks} />
                )}
            </motion.div>
        </div>

        {/* Sidebar/Filters */}
        <div className="lg:col-span-3 space-y-6">
            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="glass-panel p-6 border-white/5 bg-navy/20"
            >
                <div className="flex items-center gap-3 mb-6">
                    <Filter size={16} className="text-amber" />
                    <h3 className="text-[10px] font-black uppercase text-white tracking-[0.2em]">Prioridade</h3>
                </div>
                
                <div className="space-y-2">
                    {['ALL', 'CRITICA', 'ALTA', 'MEDIA', 'BAIXA'].map((p) => (
                        <button
                            key={p}
                            onClick={() => setFilter(p)}
                            className={`w-full text-left px-4 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                filter === p 
                                ? 'bg-amber text-navy shadow-lg shadow-amber/20' 
                                : 'bg-white/5 text-slate-400 hover:bg-white/10'
                            }`}
                        >
                            <span className="flex items-center gap-3">
                                {p !== 'ALL' && (
                                    <div className={`w-2 h-2 rounded-full ${
                                        p === 'CRITICA' ? 'bg-red-500' :
                                        p === 'ALTA' ? 'bg-amber' :
                                        p === 'MEDIA' ? 'bg-blue-500' : 'bg-slate-500'
                                    }`} />
                                )}
                                {p === 'ALL' ? 'Todos os Níveis' : p}
                            </span>
                        </button>
                    ))}
                </div>
            </motion.div>

            <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel p-6 border-white/10 bg-gradient-to-br from-navy to-navy-900 shadow-premium-lg"
            >
                <div className="flex items-center gap-3 mb-4">
                    <AlertTriangle size={18} className="text-amber" />
                    <h3 className="text-[10px] font-black uppercase text-amber tracking-[0.2em]">Monitorização CPC</h3>
                </div>
                <p className="text-[11px] text-slate-300 font-medium leading-relaxed mb-4">
                    Cálculo baseado no Art. 138.º CPC. Os prazos são suspensos em fins de semana e feriados judiciais.
                </p>
                <div className="space-y-3 mt-4 pt-4 border-t border-white/10">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest">Controlo Automático Ativo</span>
                    </div>
                </div>
            </motion.div>
        </div>
      </div>

      <AddTaskModal 
        isOpen={isAddTaskOpen} 
        onClose={() => setIsAddTaskOpen(false)} 
        onOpen={() => setIsAddTaskOpen(true)}
        onSuccess={loadTasks}
      />
    </div>
  );
}
