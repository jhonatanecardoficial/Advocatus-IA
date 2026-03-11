"use client";

import { useState } from 'react';
import { Plus, X, Calendar, FileText, AlertCircle, Clock } from 'lucide-react';
import { createTaskAction } from '@/app/actions/tasks';
import { toast } from 'sonner';

interface Props {
    matterId: string;
    onSuccess?: () => void;
}

export default function AddTaskModal({ matterId, onSuccess }: Props) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        matterId: matterId,
        title: '',
        description: '',
        type: 'PRAZO' as any,
        priority: 'MEDIA' as any,
        dueAt: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createTaskAction(form);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Tarefa/Prazo criado com sucesso!');
                setIsOpen(false);
                setForm({
                    matterId: matterId,
                    title: '',
                    description: '',
                    type: 'PRAZO',
                    priority: 'MEDIA',
                    dueAt: '',
                });
                if (onSuccess) onSuccess();
            }
        } catch (err) {
            toast.error('Erro ao conectar ao servidor');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="mt-4 w-full bg-navy text-white px-4 py-2 text-xs font-bold uppercase tracking-widest hover:bg-amber-600 transition-colors border-2 border-navy flex items-center justify-center gap-2"
            >
                <Plus className="h-4 w-4" /> Adicionar Prazo/Tarefa
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white border-4 border-navy w-full max-w-lg shadow-[8px_8px_0px_#D4A853] animate-in zoom-in-95 duration-200">
                        <div className="bg-navy p-4 flex justify-between items-center">
                            <h2 className="text-white font-display font-black uppercase tracking-widest text-lg flex items-center gap-2">
                                <Clock size={20} className="text-amber" />
                                Agendar Prazo / Tarefa
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:text-amber transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-navy mb-1 tracking-widest">Título</label>
                                <div className="relative">
                                    <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input
                                        required
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        placeholder="Ex: Entrega de Contestação"
                                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 focus:border-navy outline-none transition-colors font-mono text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-navy mb-1 tracking-widest">Tipo</label>
                                    <select
                                        required
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        className="w-full px-3 py-3 border-2 border-slate-200 focus:border-navy outline-none transition-colors font-mono text-sm appearance-none bg-white"
                                    >
                                        <option value="PRAZO">Prazo Processual</option>
                                        <option value="AUDIENCIA">Audiência</option>
                                        <option value="DILIGENCIA">Diligência</option>
                                        <option value="REUNIAO">Reunião</option>
                                        <option value="OUTRO">Outro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-navy mb-1 tracking-widest">Prioridade</label>
                                    <select
                                        required
                                        value={form.priority}
                                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                        className="w-full px-3 py-3 border-2 border-slate-200 focus:border-navy outline-none transition-colors font-mono text-sm appearance-none bg-white"
                                    >
                                        <option value="BAIXA">Baixa</option>
                                        <option value="MEDIA">Média</option>
                                        <option value="ALTA">Alta</option>
                                        <option value="CRITICA">Crítica</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase text-navy mb-1 tracking-widest">Data e Hora Limite</label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                    <input
                                        required
                                        type="datetime-local"
                                        value={form.dueAt}
                                        onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
                                        className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 focus:border-navy outline-none transition-colors font-mono text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase text-navy mb-1 tracking-widest">Descrição</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    placeholder="Detalhes adicionais..."
                                    className="w-full px-4 py-3 border-2 border-slate-200 focus:border-navy outline-none transition-colors font-body text-sm resize-none"
                                ></textarea>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest text-navy bg-slate-100 hover:bg-slate-200 transition-colors border-2 border-slate-200"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-3 text-xs font-bold uppercase tracking-widest bg-navy text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'A Gravar...' : 'Agendar'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
