"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Play, Pause, X, Clock, Save } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TimeEntry {
  id: string;
  description: string;
  hours: string | number;
  rate_per_hour?: number | null;
  ratePerHour?: number | null;
  billable: boolean;
  activityDate?: string;
  activity_date?: string;
  taskId?: string | null;
}

interface Task {
  id: string;
  title: string;
}

interface TimeTrackerProps {
  matterId: string;
  totalHours?: number;
  entries?: TimeEntry[];
  onEntriesChange?: (entries: TimeEntry[]) => void;
  onRefresh?: () => void;
}

export default function TimeTracker({ matterId, entries = [], onEntriesChange, onRefresh }: TimeTrackerProps) {
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [description, setDescription] = useState('');
  const [ratePerHour, setRatePerHour] = useState<number>(150);
  const [isBillable, setIsBillable] = useState(true);
  const [taskId, setTaskId] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [allEntries, setAllEntries] = useState<TimeEntry[]>(entries);
  const [isLoaded, setIsLoaded] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);

  // Load tasks
  useEffect(() => {
    async function loadTasks() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
        const res = await fetch(`${API_URL}/tasks?matterId=${matterId}`, {
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setTasks(data);
        }
      } catch (err) {
        console.error('Erro ao carregar tarefas:', err);
      }
    }
    if (matterId) loadTasks();
  }, [matterId]);

  // Update allEntries if entries prop changes (Prevent infinite loop with stable check)
  useEffect(() => {
    if (entries && entries.length > 0) {
      setAllEntries(entries);
    }
  }, [entries]);

  // Load entries from server if none provided
  const loadEntries = async () => {
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${API_URL}/time-entries/matter/${matterId}`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setAllEntries(data);
      }
    } catch (err) {
      console.error('Erro ao carregar registos de tempo:', err);
    }
  };

  useEffect(() => {
    if (matterId) {
      loadEntries();
    }
  }, [matterId]);

  // 1. Initial Load and Synchronization
  useEffect(() => {
    if (!matterId) return;
    
    const loadFromStorage = () => {
      const savedTimer = localStorage.getItem(`timer_${matterId}`);
      if (savedTimer) {
        try {
          const data = JSON.parse(savedTimer);
          setDescription(data.description || '');
          setIsBillable(data.isBillable !== undefined ? data.isBillable : true);
          setRatePerHour(data.ratePerHour || 150);
          
          if (data.isRunning && data.startTime) {
            const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
            setSeconds((data.accumulatedSeconds || 0) + elapsed);
            setIsTimerRunning(true);
          } else {
            setSeconds(data.accumulatedSeconds || 0);
            setIsTimerRunning(false);
          }
        } catch (e) {
          console.error("Erro ao carregar timer", e);
        }
      }
      setIsLoaded(true);
    };

    loadFromStorage();

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === `timer_${matterId}`) {
        loadFromStorage();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [matterId]);

  // 2. Timer Display Update Logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        const savedTimer = localStorage.getItem(`timer_${matterId}`);
        if (savedTimer) {
          try {
            const data = JSON.parse(savedTimer);
            if (data.isRunning && data.startTime) {
              const elapsed = Math.floor((Date.now() - data.startTime) / 1000);
              setSeconds((data.accumulatedSeconds || 0) + elapsed);
            }
          } catch (e) {
            setIsTimerRunning(false);
          }
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isTimerRunning, matterId]);

  // 3. Control Functions
  const toggleTimer = () => {
    const now = Date.now();
    const newIsRunning = !isTimerRunning;
    
    const savedTimer = localStorage.getItem(`timer_${matterId}`);
    let data = savedTimer ? JSON.parse(savedTimer) : { accumulatedSeconds: 0 };
    
    if (newIsRunning) {
      data = {
        ...data,
        isRunning: true,
        startTime: now,
        description,
        isBillable,
        ratePerHour,
        lastUpdated: now
      };
    } else {
      const elapsed = data.startTime ? Math.floor((now - data.startTime) / 1000) : 0;
      data = {
        ...data,
        isRunning: false,
        startTime: null,
        accumulatedSeconds: (data.accumulatedSeconds || 0) + elapsed,
        lastUpdated: now
      };
      setSeconds(data.accumulatedSeconds);
    }
    
    localStorage.setItem(`timer_${matterId}`, JSON.stringify(data));
    setIsTimerRunning(newIsRunning);
  };

  const resetTimer = () => {
    localStorage.removeItem(`timer_${matterId}`);
    setSeconds(0);
    setIsTimerRunning(false);
    setDescription('');
  };

  useEffect(() => {
    if (!isLoaded || !matterId) return;
    const savedTimer = localStorage.getItem(`timer_${matterId}`);
    if (savedTimer) {
      try {
        const data = JSON.parse(savedTimer);
        localStorage.setItem(`timer_${matterId}`, JSON.stringify({
          ...data,
          description,
          isBillable,
          ratePerHour
        }));
      } catch (e) {
        console.error('Failed to parse saved timer:', e);
      }
    } else {
       localStorage.setItem(`timer_${matterId}`, JSON.stringify({
         accumulatedSeconds: 0,
         isRunning: false,
         description,
         isBillable,
         ratePerHour
       }));
    }
  }, [description, isBillable, ratePerHour, isLoaded, matterId]);

  function formatTime(sec: number) {
    const h = Math.floor(sec / 3600);
    const m = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  }

  function getHours(sec: number) {
    return (sec / 3600).toFixed(2);
  }

  async function saveTimeEntry() {
    if (!description.trim()) {
      toast.error('Descreva a atividade');
      return;
    }

    if (seconds === 0) {
      toast.error('Cronômetro parado - nenhum tempo registado');
      return;
    }

    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const hours = parseFloat(getHours(seconds));
      const rate = ratePerHour || 0;
      
      const payload = {
        matter_id: matterId,
        description: description.trim(),
        hours: hours,
        activity_date: new Date().toISOString().split('T')[0],
        rate_per_hour: rate,
        billable: isBillable,
        task_id: taskId || undefined,
      };

      const res = await fetch(`${API_URL}/time-entries`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Falha ao gravar tempo');

      const newEntry = await res.json();
      const updated = [newEntry, ...allEntries];
      setAllEntries(updated);
      onEntriesChange?.(updated);
      onRefresh?.();

      localStorage.removeItem(`timer_${matterId}`);
      setSeconds(0);
      setDescription('');
      setIsTimerRunning(false);
      toast.success(`${hours}h registado com sucesso`);
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao gravar');
    } finally {
      setLoading(false);
    }
  }

  async function deleteEntry(id: string) {
    setLoading(true);
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${API_URL}/time-entries/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!res.ok) throw new Error('Falha ao eliminar');

      const updatedEntries = allEntries.filter((e) => e.id !== id);
      setAllEntries(updatedEntries);
      onEntriesChange?.(updatedEntries);
      toast.success('Registo eliminado');
      onRefresh?.();
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao eliminar');
    } finally {
      setLoading(false);
    }
  }

  const totalEntryHours = allEntries.reduce((sum, e) => sum + parseFloat(String(e.hours || 0)), 0);

  return (
    <div className="space-y-6">
      {/* Timer Display - Glassmorphism */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
            <Clock size={120} className={isTimerRunning ? 'animate-spin-slow text-amber' : 'text-white'} />
        </div>
        
        <div className="text-center relative z-10">
          <div className="text-6xl font-display font-black text-white mb-2 tracking-tighter">
            {formatTime(seconds)}
          </div>
          <div className="flex items-center justify-center gap-2 mb-8">
              <span className="h-2 w-2 rounded-full bg-amber animate-pulse" />
              <p className="text-amber/80 text-[10px] font-black uppercase tracking-[0.2em]">{getHours(seconds)} Horas Acumuladas</p>
          </div>
          
          <div className="flex gap-4 justify-center">
            <button
              onClick={toggleTimer}
              className={`px-8 py-3 rounded-xl font-bold text-xs uppercase tracking-widest transition-all flex items-center gap-2 shadow-xl ${
                isTimerRunning 
                  ? 'bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30 shadow-red-500/10' 
                  : 'bg-amber text-navy hover:scale-105 active:scale-95 shadow-amber/20'
              }`}
            >
              {isTimerRunning ? <Pause size={14} /> : <Play size={14} />}
              {isTimerRunning ? 'Pausar' : 'Iniciar'}
            </button>
            <button
              onClick={resetTimer}
              className="px-6 py-3 rounded-xl bg-white/5 text-white/60 border border-white/10 font-bold text-xs uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2"
            >
              <X size={14} /> Reset
            </button>
          </div>
        </div>
      </motion.div>

      {/* Entry Form */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-6 space-y-4"
      >
        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Atividade Realizada</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="O que está a fazer agora?"
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber/50 outline-none transition-all placeholder:text-slate-600 font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Valor por Hora (€)</label>
            <div className="relative">
                <input
                    type="number"
                    value={ratePerHour}
                    onChange={(e) => setRatePerHour(parseInt(e.target.value) || 0)}
                    min={0}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber/50 outline-none transition-all pl-8"
                />
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-xs text-amber font-bold">€</span>
            </div>
          </div>
          <div className="flex items-end pb-3">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className={`w-10 h-6 rounded-full p-1 transition-all ${isBillable ? 'bg-amber' : 'bg-white/10'}`}>
                <div className={`w-4 h-4 rounded-full bg-navy transition-all ${isBillable ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
              <input
                type="checkbox"
                checked={isBillable}
                onChange={(e) => setIsBillable(e.target.checked)}
                className="hidden"
              />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white transition-colors">Faturável ao Cliente</span>
            </label>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Tarefa Relacionada (Opcional)</label>
          <select
            value={taskId}
            onChange={(e) => setTaskId(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber/50 outline-none transition-all appearance-none cursor-pointer"
          >
            <option value="" className="bg-navy">Nenhuma tarefa associada</option>
            {tasks.map((task) => (
              <option key={task.id} value={task.id} className="bg-navy">{task.title}</option>
            ))}
          </select>
        </div>

        <button
          onClick={saveTimeEntry}
          disabled={loading || seconds === 0}
          className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber hover:text-navy hover:border-amber transition-all disabled:opacity-30 disabled:hover:bg-white/5 flex items-center justify-center gap-2"
        >
          {loading ? 'A Gravar...' : (
              <>
                <Save size={14} /> Gravar No Histórico
              </>
          )}
        </button>
      </motion.div>

      {/* History List */}
      <AnimatePresence>
          {allEntries.length > 0 && (
            <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
            >
              <div className="flex justify-between items-center px-2">
                  <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em]">Histórico Recente</h3>
                  <div className="flex items-center gap-2">
                       <span className="text-[10px] font-black text-amber uppercase">{totalEntryHours.toFixed(2)}H</span>
                       <span className="text-[10px] font-bold text-slate-700 uppercase">Totais</span>
                  </div>
              </div>
              
              <div className="space-y-3">
                {allEntries.map((entry, idx) => (
                  <motion.div
                    key={entry.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="flex items-center justify-between p-4 glass-panel border border-white/5 bg-white/2 hover:bg-white/5 transition-all group"
                  >
                    <div className="flex-1 min-w-0 mr-4">
                      <p className="text-sm font-bold text-white group-hover:text-amber transition-colors truncate">{entry.description}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-[10px] font-mono text-slate-500 flex items-center gap-1">
                            <Clock size={10} /> {entry.hours}h
                        </span>
                        {entry.rate_per_hour && (
                            <span className="text-[10px] font-mono text-slate-600">
                                @ €{entry.rate_per_hour}/h
                            </span>
                        )}
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                            • {entry.activityDate ? new Date(entry.activityDate).toLocaleDateString('pt-PT') : (entry.activity_date ? new Date(entry.activity_date).toLocaleDateString('pt-PT') : 'Sem data')}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteEntry(entry.id)}
                      className="p-2 text-slate-600 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                      disabled={loading}
                    >
                      <X size={14} />
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
      </AnimatePresence>
    </div>
  );
}
