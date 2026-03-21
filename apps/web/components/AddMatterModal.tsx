"use client";

import { useState, useEffect } from 'react';
import { Plus, X, Briefcase, User, Calendar, FileText, Scale, Zap, ChevronDown } from 'lucide-react';
import { createMatterAction } from '@/app/actions/matters';
import { toast } from 'sonner';

interface Client {
    id: string;
    name: string;
}

export default function AddMatterModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [clients, setClients] = useState<Client[]>([]);
    const [form, setForm] = useState({
        title: '',
        clientId: '',
        type: 'CIVEL' as any,
        status: 'ATIVO' as any,
        courtReference: '',
        description: '',
        deadlineAt: '',
    });

    useEffect(() => {
        if (isOpen) {
            fetchClients();
        }
    }, [isOpen]);

    const fetchClients = async () => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
        try {
            const res = await fetch(`${API_URL}/clients`, {
                credentials: 'include',
            });
            const data = await res.json();
            setClients(data.data || []);
        } catch (err) {
            console.error('Erro ao buscar clientes:', err);
        }
    };

    // Cookies are automatically handled via credentials: 'include'

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createMatterAction(form);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Processo criado com sucesso!');
                setIsOpen(false);
                setForm({
                    title: '',
                    clientId: '',
                    type: 'CIVEL',
                    status: 'ATIVO',
                    courtReference: '',
                    description: '',
                    deadlineAt: '',
                });
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
                className="btn-premium flex items-center gap-2 group animate-reveal"
            >
                <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" /> 
                <span>Novo Processo</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xl z-[100] flex items-start justify-center p-4 sm:p-8 animate-in fade-in duration-300 overflow-y-auto">
                    <div className="glass-panel w-full max-w-2xl border border-white/20 shadow-premium flex flex-col my-8 animate-in zoom-in-95 duration-300">
                        {/* Header Area */}
                        <div className="bg-gradient-to-r from-navy via-navy/95 to-navy/90 p-6 flex justify-between items-center shrink-0 border-b border-white/10 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-amber/50 to-transparent" />
                            <div className="flex items-center gap-4 relative z-10">
                                <div className="p-2.5 bg-amber/10 rounded-xl border border-amber/30 shadow-glow">
                                    <Scale className="w-6 h-6 text-amber" />
                                </div>
                                <div>
                                    <h3 className="text-white text-sm font-black uppercase tracking-[0.15em] leading-none mb-1">Abrir Novo Processo</h3>
                                    <p className="text-[10px] text-amber/40 font-mono font-bold uppercase tracking-widest">Gestão Jurídica Inteligente</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)} 
                                className="p-2.5 hover:bg-white/10 rounded-full transition-all group active:scale-90"
                            >
                                <X className="w-5 h-5 text-white/50 group-hover:text-white transition-colors" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="flex flex-col">
                            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar bg-black/5">
                                <div className="animate-reveal" style={{ animationDelay: '100ms' }}>
                                    <label className="text-[10px] text-amber/60 uppercase font-black tracking-widest mb-3 block flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5" />
                                        Título do Processo
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        placeholder="Ex: Acção de Despejo - Imóvel Centro"
                                        className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl focus:border-amber/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-amber/5 outline-none transition-all font-body text-sm text-white placeholder:text-white/20"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-reveal" style={{ animationDelay: '200ms' }}>
                                    <div>
                                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-3 block flex items-center gap-2">
                                            <User className="w-3.5 h-3.5 text-amber/60" />
                                            Cliente Associado
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={form.clientId}
                                                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                                                className="w-full px-5 py-4 bg-white/[0.05] border border-white/20 rounded-2xl focus:border-amber/50 focus:bg-white/[0.07] outline-none transition-all font-body text-sm text-white appearance-none cursor-pointer"
                                            >
                                                <option value="" className="bg-[#0a192f] text-white">Selecionar Cliente...</option>
                                                {clients.map(c => (
                                                    <option key={c.id} value={c.id} className="bg-[#0a192f] text-white">{c.name}</option>
                                                ))}
                                            </select>
                                            <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-3 block flex items-center gap-2">
                                            <Briefcase className="w-3.5 h-3.5 text-amber/60" />
                                            Área de Prática
                                        </label>
                                        <div className="relative">
                                            <select
                                                required
                                                value={form.type}
                                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                                className="w-full px-5 py-4 bg-white/[0.05] border border-white/20 rounded-2xl focus:border-amber/50 focus:bg-white/[0.07] outline-none transition-all font-body text-sm text-white appearance-none cursor-pointer"
                                            >
                                                <option value="CIVEL" className="bg-[#0a192f] text-white">Cível</option>
                                                <option value="PENAL" className="bg-[#0a192f] text-white">Penal</option>
                                                <option value="LABORAL" className="bg-[#0a192f] text-white">Laboral</option>
                                                <option value="ADMINISTRATIVO" className="bg-[#0a192f] text-white">Administrativo</option>
                                                <option value="FISCAL" className="bg-[#0a192f] text-white">Fiscal</option>
                                                <option value="FAMILIA" className="bg-[#0a192f] text-white">Família</option>
                                                <option value="COMERCIAL" className="bg-[#0a192f] text-white">Comercial</option>
                                                <option value="OUTRO" className="bg-[#0a192f] text-white">Outro</option>
                                            </select>
                                            <ChevronDown size={16} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-reveal" style={{ animationDelay: '300ms' }}>
                                    <div>
                                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-3 block flex items-center gap-2">
                                            <Zap className="w-3.5 h-3.5 text-amber" />
                                            Ref. Tribunal / CITIUS
                                        </label>
                                        <input
                                            type="text"
                                            value={form.courtReference}
                                            onChange={(e) => setForm({ ...form, courtReference: e.target.value })}
                                            placeholder="Ex: 5000123-45.2024.8.26.0000"
                                            className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl focus:border-amber/50 focus:bg-white/[0.07] outline-none transition-all font-body text-sm text-white placeholder:text-white/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-3 block flex items-center gap-2">
                                            <Calendar className="w-3.5 h-3.5 text-amber/60" />
                                            Data Limite / Prazo
                                        </label>
                                        <input
                                            type="date"
                                            value={form.deadlineAt}
                                            onChange={(e) => setForm({ ...form, deadlineAt: e.target.value })}
                                            className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl focus:border-amber/50 focus:bg-white/[0.07] outline-none transition-all font-body text-sm text-white [color-scheme:dark]"
                                        />
                                    </div>
                                </div>

                                <div className="animate-reveal" style={{ animationDelay: '400ms' }}>
                                    <label className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-3 block flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5 text-amber/60" />
                                        Notas / Descrição
                                    </label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        rows={4}
                                        placeholder="Breve descrição dos fatos ou objetivos do processo..."
                                        className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-2xl focus:border-amber/50 focus:bg-white/[0.07] outline-none transition-all font-body text-sm text-white placeholder:text-white/20 resize-none"
                                    ></textarea>
                                </div>
                            </div>

                            <div className="p-6 border-t border-white/10 bg-navy/50 backdrop-blur-xl flex gap-4 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white/60 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:text-white transition-all font-display"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest bg-amber text-navy rounded-2xl hover:scale-[1.02] active:scale-[0.98] shadow-glow transition-all disabled:opacity-50 flex items-center justify-center gap-3 font-display"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-navy/30 border-t-navy rounded-full animate-spin" />
                                    ) : (
                                        <Plus className="w-4 h-4 shadow-glow" />
                                    )}
                                    <span>{loading ? 'Guardando...' : 'Abrir Processo'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
