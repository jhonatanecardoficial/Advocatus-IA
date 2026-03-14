"use client";

import { useState } from 'react';
import { Plus, X, Calendar, FileText, Clock } from 'lucide-react';
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
                className="btn-premium btn-premium-primary text-[10px] uppercase w-full flex items-center justify-center gap-2"
            >
                <Plus className="h-4 w-4" /> Adicionar Prazo/Tarefa
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-navy/80 backdrop-blur-xl z-[60] flex items-center justify-center p-4 animate-in fade-in duration-500">
                    <div className="glass-panel border-white/10 w-full max-w-lg shadow-glow overflow-hidden animate-reveal">
                        <div className="bg-white/5 p-5 flex justify-between items-center border-b border-white/5">
                            <h2 className="text-white font-display font-black uppercase tracking-widest text-sm flex items-center gap-3">
                                <div className="p-2 bg-amber/20 rounded-lg">
                                    <Clock size={16} className="text-amber" />
                                </div>
                                Agendar Prazo / Tarefa
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 text-white transition-all"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest">Título da Tarefa</label>
                                <div className="relative group">
                                    <FileText className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber transition-colors" size={18} />
                                    <input
                                        required
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        placeholder="Ex: Entrega de Contestação"
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:border-amber/50 focus:bg-white/10 outline-none transition-all font-body text-sm"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest">Tipo</label>
                                    <select
                                        required
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-amber/50 focus:bg-white/10 outline-none transition-all font-body text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="PRAZO" className="bg-navy">Prazo Processual</option>
                                        <option value="AUDIENCIA" className="bg-navy">Audiência</option>
                                        <option value="DILIGENCIA" className="bg-navy">Diligência</option>
                                        <option value="REUNIAO" className="bg-navy">Reunião</option>
                                        <option value="OUTRO" className="bg-navy">Outro</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest">Prioridade</label>
                                    <select
                                        required
                                        value={form.priority}
                                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                        className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white focus:border-amber/50 focus:bg-white/10 outline-none transition-all font-body text-sm appearance-none cursor-pointer"
                                    >
                                        <option value="BAIXA" className="bg-navy">Baixa</option>
                                        <option value="MEDIA" className="bg-navy">Média</option>
                                        <option value="ALTA" className="bg-navy">Alta</option>
                                        <option value="CRITICA" className="bg-navy text-red-400">Crítica</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest">Prazo Limite</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-amber transition-colors" size={18} />
                                    <input
                                        required
                                        type="datetime-local"
                                        value={form.dueAt}
                                        onChange={(e) => setForm({ ...form, dueAt: e.target.value })}
                                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white [color-scheme:dark] focus:border-amber/50 focus:bg-white/10 outline-none transition-all font-body text-sm"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-bold uppercase text-slate-500 mb-2 tracking-widest">Notas Adicionais</label>
                                <textarea
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                    rows={3}
                                    placeholder="Detalhes adicionais sobre a tarefa..."
                                    className="w-full px-4 py-4 bg-white/5 border border-white/10 rounded-xl text-white placeholder:text-slate-600 focus:border-amber/50 focus:bg-white/10 outline-none transition-all font-body text-sm resize-none"
                                ></textarea>
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="btn-premium btn-premium-outline flex-1 py-4 text-xs font-bold uppercase tracking-widest"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="btn-premium btn-premium-primary flex-1 py-4 text-xs font-bold uppercase tracking-widest disabled:opacity-30"
                                >
                                    {loading ? 'A Gravar...' : 'Agendar Tarefa'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
