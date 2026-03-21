"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Plus, X, Calendar, Tag, Receipt, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Expense {
    id: string;
    description: string;
    amount: string | number;
    category: string;
    date: string;
    billable: boolean;
    taskId?: string | null;
}

interface Task {
    id: string;
    title: string;
}

interface ExpenseTrackerProps {
    matterId: string;
    expenses?: Expense[];
    onExpensesChange?: (expenses: Expense[]) => void;
    onRefresh?: () => void;
}

const CATEGORIES = [
    { value: 'DESLOCACAO', label: 'Deslocação' },
    { value: 'TAXA_JUSTICA', label: 'Taxa de Justiça' },
    { value: 'FOTOCOPIAS', label: 'Fotocópias' },
    { value: 'CORREIO', label: 'Correio' },
    { value: 'OUTRO', label: 'Outro' },
];

export default function ExpenseTracker({ matterId, expenses = [], onExpensesChange, onRefresh }: ExpenseTrackerProps) {
    const [amount, setAmount] = useState<number>(0);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('OUTRO');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isBillable, setIsBillable] = useState(true);
    const [taskId, setTaskId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [allExpenses, setAllExpenses] = useState<Expense[]>(expenses);
    const [tasks, setTasks] = useState<Task[]>([]);

    useEffect(() => {
        async function loadTasks() {
            try {
                const token = localStorage.getItem('accessToken');
                const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
                const res = await fetch(`${API_URL}/tasks?matterId=${matterId}`, {
                    headers: { Authorization: token ? `Bearer ${token}` : '' },
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

    // Load expenses from server if none provided
    const loadExpenses = async () => {
        if (expenses && expenses.length > 0) return;
        try {
            const token = localStorage.getItem('accessToken');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
            const res = await fetch(`${API_URL}/expenses/matter/${matterId}`, {
                headers: { Authorization: token ? `Bearer ${token}` : '' },
            });
            if (res.ok) {
                const data = await res.json();
                setAllExpenses(data);
            }
        } catch (err) {
            console.error('Erro ao carregar despesas:', err);
        }
    };

    useEffect(() => {
        if (matterId) {
            loadExpenses();
        }
    }, [matterId]);

    async function saveExpense() {
        if (!description.trim()) {
            toast.error('Descreva a despesa');
            return;
        }

        if (amount <= 0) {
            toast.error('Valor deve ser superior a zero');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

            const res = await fetch(`${API_URL}/expenses`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: token ? `Bearer ${token}` : '',
                },
                body: JSON.stringify({
                    matter_id: matterId,
                    description: description.trim(),
                    amount,
                    category,
                    date,
                    billable: isBillable,
                    task_id: taskId || undefined,
                }),
            });

            if (!res.ok) throw new Error('Falha ao gravar despesa');

            const newExpense = await res.json();
            const updated = [newExpense, ...allExpenses];
            setAllExpenses(updated);
            onExpensesChange?.(updated);

            setAmount(0);
            setDescription('');
            setCategory('OUTRO');
            setTaskId('');
            toast.success('Despesa registada com sucesso');
            onRefresh?.();
        } catch (err: any) {
            console.error('Erro ao gravar despesa:', err);
            toast.error(err.message || 'Erro ao gravar');
        } finally {
            setLoading(false);
        }
    }

    async function deleteExpense(id: string) {
        setLoading(true);
        try {
            const token = localStorage.getItem('accessToken');
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
            const res = await fetch(`${API_URL}/expenses/${id}`, {
                method: 'DELETE',
                headers: { Authorization: token ? `Bearer ${token}` : '' },
            });

            if (!res.ok) throw new Error('Falha ao eliminar');

            const updated = allExpenses.filter((e) => e.id !== id);
            setAllExpenses(updated);
            onExpensesChange?.(updated);
            toast.success('Despesa eliminada');
            onRefresh?.();
        } catch (err) {
            toast.error((err as Error).message || 'Erro ao eliminar');
        } finally {
            setLoading(false);
        }
    }

    const totalAmount = allExpenses.reduce((sum, e) => sum + parseFloat(String(e.amount || 0)), 0);

    return (
        <div className="space-y-6">
            {/* Header/Summary Area */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-panel p-8 relative overflow-hidden bg-green-500/5 group"
            >
                <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Receipt size={120} className="text-green-400" />
                </div>
                
                <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
                    <div className="text-center md:text-left">
                        <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">Total de Despesas Acumuladas</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-display font-black text-white leading-none">
                                €{totalAmount.toLocaleString('pt-PT', { minimumFractionDigits: 0 })}
                            </span>
                            <span className="text-sm font-bold text-green-400/60 uppercase">Efectivas</span>
                        </div>
                    </div>
                    
                    <div className="flex flex-col items-center md:items-end">
                        <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest">
                            {allExpenses.length} REGISTOS
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Expense Form */}
            <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="glass-panel p-6 space-y-4"
            >
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Descrição do Encargo</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: Pagamento de taxa de justiça, custas..."
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber/50 outline-none transition-all placeholder:text-slate-600 font-medium"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Categoria</label>
                        <div className="relative">
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:border-amber/50 outline-none transition-all appearance-none cursor-pointer"
                            >
                                {CATEGORIES.map((cat) => (
                                    <option key={cat.value} value={cat.value} className="bg-[#0a192f] text-white">{cat.label}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Valor (€)</label>
                        <div className="relative">
                            <input
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                                min={0}
                                step="0.01"
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber/50 outline-none transition-all pl-8"
                            />
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 font-bold text-xs">€</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Data</label>
                        <div className="relative">
                            <input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber/50 outline-none transition-all pr-10"
                            />
                            <Calendar size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Tarefa Associada (Opcional)</label>
                        <div className="relative">
                            <select
                                value={taskId}
                                onChange={(e) => setTaskId(e.target.value)}
                                className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-sm text-white focus:border-amber/50 outline-none transition-all appearance-none cursor-pointer"
                            >
                                <option value="" className="bg-[#0a192f] text-white">Nenhuma tarefa</option>
                                {tasks.map((task) => (
                                    <option key={task.id} value={task.id} className="bg-[#0a192f] text-white">{task.title}</option>
                                ))}
                            </select>
                            <ChevronDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                        </div>
                    </div>
                    <div className="flex items-end pb-3">
                        <label className="flex items-center gap-3 cursor-pointer group">
                             <div className={`w-10 h-6 rounded-full p-1 transition-all ${isBillable ? 'bg-green-500' : 'bg-white/10'}`}>
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

                <button
                    onClick={saveExpense}
                    disabled={loading || amount <= 0}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-xl text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-green-500 hover:text-navy hover:border-green-500 transition-all disabled:opacity-30 disabled:hover:bg-white/5 flex items-center justify-center gap-2"
                >
                    {loading ? 'A Gravar...' : (
                        <>
                            <Plus size={14} /> Registar Nova Despesa
                        </>
                    )}
                </button>
            </motion.div>

            {/* History List */}
            <AnimatePresence>
                {allExpenses.length > 0 && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="space-y-4"
                    >
                         <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-2">Histórico de Custos</h3>
                        
                        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 no-scrollbar">
                            {allExpenses.map((expense, idx) => (
                                <motion.div
                                    key={expense.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group flex items-center justify-between p-4 glass-panel border border-white/5 bg-white/2 hover:bg-white/5 transition-all"
                                >
                                    <div className="flex-1 min-w-0 mr-4">
                                        <div className="flex items-center gap-3 mb-1">
                                            <span className="px-2 py-0.5 rounded bg-navy-600/50 text-[10px] font-black border border-white/5 text-amber uppercase tracking-wider">
                                                {CATEGORIES.find(c => c.value === expense.category)?.label || expense.category}
                                            </span>
                                            <span className="text-sm font-black text-white">€{parseFloat(String(expense.amount)).toFixed(2)}</span>
                                        </div>
                                        <p className="text-xs text-slate-400 font-medium truncate">{expense.description}</p>
                                        <div className="flex items-center gap-3 mt-1.5 opacity-60">
                                            <span className="text-[10px] font-bold text-slate-500 uppercase flex items-center gap-1.5">
                                                <Calendar size={10} /> {expense.date ? new Date(expense.date).toLocaleDateString('pt-PT') : 'Sem data'}
                                            </span>
                                            {expense.billable && (
                                                <span className="text-[10px] font-bold text-green-400 uppercase flex items-center gap-1.5">
                                                    <Tag size={10} /> Faturável
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteExpense(expense.id)}
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
