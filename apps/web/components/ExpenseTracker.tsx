"use client";

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { DollarSign, Plus, X } from 'lucide-react';

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
}

const CATEGORIES = [
    { value: 'DESLOCACAO', label: 'Deslocação' },
    { value: 'TAXA_JUSTICA', label: 'Taxa de Justiça' },
    { value: 'FOTOCOPIAS', label: 'Fotocópias' },
    { value: 'CORREIO', label: 'Correio' },
    { value: 'OUTRO', label: 'Outro' },
];

export default function ExpenseTracker({ matterId, expenses = [], onExpensesChange }: ExpenseTrackerProps) {
    const [amount, setAmount] = useState<number>(0);
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('OUTRO');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [isBillable, setIsBillable] = useState(true);
    const [taskId, setTaskId] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [allExpenses, setAllExpenses] = useState<Expense[]>(expenses);
    const [tasks, setTasks] = useState<Task[]>([]);

    // Carregar tarefas do processo
    useEffect(() => {
        async function loadTasks() {
            try {
                const token = localStorage.getItem('access_token');
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
            const token = localStorage.getItem('access_token');
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

            // Reset
            setAmount(0);
            setDescription('');
            setCategory('OUTRO');
            setTaskId('');
            toast.success('Despesa registada com sucesso');
        } catch (err) {
            toast.error((err as Error).message || 'Erro ao gravar');
        } finally {
            setLoading(false);
        }
    }

    async function deleteExpense(id: string) {
        setLoading(true);
        try {
            const token = localStorage.getItem('access_token');
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
        } catch (err) {
            toast.error((err as Error).message || 'Erro ao eliminar');
        } finally {
            setLoading(false);
        }
    }

    const totalAmount = allExpenses.reduce((sum, e) => sum + parseFloat(String(e.amount || 0)), 0);

    return (
        <div className="space-y-4">
            {/* Title/Icon Section */}
            <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-5 h-5 text-navy" />
                <h3 className="font-bold text-navy uppercase tracking-widest text-sm">Despesas e Encargos</h3>
            </div>

            {/* Expense Form */}
            <div className="bg-white border-2 border-navy p-4 space-y-3">
                <div>
                    <label className="block text-xs font-bold uppercase text-navy mb-2">Descrição</label>
                    <input
                        type="text"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Ex: Pagamento de taxa de justiça, custas..."
                        className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-navy"
                    />
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold uppercase text-navy mb-2">Categoria</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-navy"
                        >
                            {CATEGORIES.map((cat) => (
                                <option key={cat.value} value={cat.value}>{cat.label}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-navy mb-2">Valor (€)</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                            min={0}
                            step="0.01"
                            className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-navy"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <div>
                        <label className="block text-xs font-bold uppercase text-navy mb-2">Data</label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-navy"
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-bold uppercase text-navy mb-2">Tarefa (Opcional)</label>
                        <select
                            value={taskId}
                            onChange={(e) => setTaskId(e.target.value)}
                            className="w-full border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:border-navy"
                        >
                            <option value="">Nenhuma tarefa</option>
                            {tasks.map((task) => (
                                <option key={task.id} value={task.id}>{task.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2 py-1">
                    <input
                        type="checkbox"
                        id="billable-expense"
                        checked={isBillable}
                        onChange={(e) => setIsBillable(e.target.checked)}
                        className="w-4 h-4"
                    />
                    <label htmlFor="billable-expense" className="text-xs font-bold uppercase text-navy cursor-pointer">Faturável ao cliente</label>
                </div>

                <button
                    onClick={saveExpense}
                    disabled={loading || amount <= 0}
                    className="w-full px-4 py-2 bg-navy text-white font-bold rounded hover:bg-amber-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    <Plus className="w-4 h-4" /> Registar Despesa
                </button>
            </div>

            {/* Summary Area */}
            <div className="bg-amber-50 border-2 border-amber-300 p-4">
                <div className="flex justify-between items-center mb-1">
                    <h3 className="text-sm font-bold uppercase text-amber-900">Total Despesas</h3>
                    <span className="text-xl font-black text-navy">€{totalAmount.toLocaleString('pt-PT', { minimumFractionDigits: 2 })}</span>
                </div>
                <p className="text-[10px] text-amber-700 uppercase font-bold tracking-wider">{allExpenses.length} registos efetuados</p>
            </div>

            {/* History List */}
            {allExpenses.length > 0 && (
                <div className="bg-white border-2 border-navy p-4">
                    <h3 className="text-sm font-bold uppercase text-navy mb-3">Histórico de Despesas</h3>
                    <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                        {allExpenses.map((expense) => (
                            <div
                                key={expense.id}
                                className="group flex items-center justify-between p-3 bg-slate-50 border border-slate-200 hover:border-navy transition-colors rounded text-sm"
                            >
                                <div className="flex-1 min-w-0 mr-2">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-bold bg-navy text-white px-1.5 py-0.5 rounded leading-none uppercase">
                                            {CATEGORIES.find(c => c.value === expense.category)?.label || expense.category}
                                        </span>
                                        <span className="text-xs font-bold text-navy">€{parseFloat(String(expense.amount)).toFixed(2)}</span>
                                    </div>
                                    <p className="text-xs text-navy font-medium truncate">{expense.description}</p>
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        {new Date(expense.date).toLocaleDateString('pt-PT')} {expense.billable ? '• Faturável' : ''}
                                    </p>
                                </div>
                                <button
                                    onClick={() => deleteExpense(expense.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors rounded"
                                    disabled={loading}
                                    title="Eliminar despesa"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
