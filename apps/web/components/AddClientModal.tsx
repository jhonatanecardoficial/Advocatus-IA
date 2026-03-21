"use client";

import { useState } from 'react';
import { Plus, X, User, Briefcase, Hash, Mail, Phone, Shield, AlertTriangle, Info, Zap } from 'lucide-react';
import { createClientAction, checkConflictAction } from '@/app/actions/clients';
import { toast } from 'sonner';

export default function AddClientModal() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState({
        nome: '',
        nif: '',
        tipo: 'SINGULAR' as 'SINGULAR' | 'COLETIVA',
        email: '',
        telefone: '',
    });

    const [conflictResults, setConflictResults] = useState<any[]>([]);
    const [checkingConflict, setCheckingConflict] = useState(false);
    const [nifError, setNifError] = useState<string | null>(null);

    const handleConflictCheck = async () => {
        if (!form.nome || !form.nif) {
            toast.error('Preencha o nome e o NIF para verificar conflitos.');
            return;
        }

        setCheckingConflict(true);
        try {
            const result = await checkConflictAction({ nome: form.nome, nif: form.nif });
            if (result.error) {
                toast.error(result.error);
            } else {
                setConflictResults(result.data || []);
                if (result.count === 0) {
                    toast.success('Nenhum conflito direto encontrado.');
                } else {
                    toast.warning(`Encontrados ${result.count} possíveis conflitos.`);
                }
            }
        } catch (err) {
            toast.error('Erro ao verificar conflitos.');
        } finally {
            setCheckingConflict(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const result = await createClientAction(form);
            if (result.error) {
                toast.error(result.error);
            } else {
                toast.success('Cliente criado com sucesso!');
                setIsOpen(false);
                setForm({ nome: '', nif: '', tipo: 'SINGULAR', email: '', telefone: '' });
                setConflictResults([]);
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
                <span>Novo Cliente</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="glass-panel w-full max-w-xl border border-white/20 shadow-premium flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-300 overflow-hidden">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-navy via-navy/90 to-navy/80 p-5 flex justify-between items-center shrink-0 border-b border-white/10">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber/10 rounded-lg border border-amber/20">
                                    <User className="w-5 h-5 text-amber" />
                                </div>
                                <div>
                                    <h3 className="text-white text-sm font-bold uppercase tracking-widest">Novo Cliente</h3>
                                    <p className="text-[10px] text-white/50 font-medium">Registo e Compliance</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setIsOpen(false)} 
                                className="p-2 hover:bg-white/10 rounded-full transition-colors group"
                            >
                                <X className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6 overflow-y-auto custom-scrollbar">
                            <div className="grid grid-cols-2 gap-3 animate-reveal stagger-1">
                                <label className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${form.tipo === 'SINGULAR' ? 'border-amber bg-amber/10 shadow-glow' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                                    <input
                                        type="radio"
                                        className="hidden"
                                        name="tipo"
                                        value="SINGULAR"
                                        checked={form.tipo === 'SINGULAR'}
                                        onChange={() => setForm({ ...form, tipo: 'SINGULAR' })}
                                    />
                                    <User size={18} className={form.tipo === 'SINGULAR' ? 'text-amber' : 'text-white/40'} />
                                    <span className={`text-[11px] font-black uppercase tracking-widest ${form.tipo === 'SINGULAR' ? 'text-white' : 'text-white/40'}`}>Pessoa Singular</span>
                                </label>
                                <label className={`flex items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${form.tipo === 'COLETIVA' ? 'border-amber bg-amber/10 shadow-glow' : 'border-white/10 bg-white/5 hover:border-white/20'}`}>
                                    <input
                                        type="radio"
                                        className="hidden"
                                        name="tipo"
                                        value="COLETIVA"
                                        checked={form.tipo === 'COLETIVA'}
                                        onChange={() => setForm({ ...form, tipo: 'COLETIVA' })}
                                    />
                                    <Briefcase size={18} className={form.tipo === 'COLETIVA' ? 'text-amber' : 'text-white/40'} />
                                    <span className={`text-[11px] font-black uppercase tracking-widest ${form.tipo === 'COLETIVA' ? 'text-white' : 'text-white/40'}`}>Pessoa Colectiva</span>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <div className="animate-reveal stagger-2">
                                    <label className="text-[11px] text-slate-400 uppercase font-bold mb-2 block flex items-center gap-2">
                                        <Zap className="w-3 h-3 text-navy" />
                                        Nome Completo / Denominação
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        value={form.nome}
                                        onChange={(e) => setForm({ ...form, nome: e.target.value })}
                                        placeholder="Ex: João Lopes ou Empresa Lda"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-amber/50 focus:bg-white/10 outline-none transition-all font-body text-sm text-white placeholder:text-white/20"
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-reveal stagger-3">
                                    <div>
                                        <label className="text-[11px] text-white/40 uppercase font-bold mb-2 block flex items-center gap-2">
                                            <Hash className="w-3 h-3 text-amber" />
                                            NIF / NIPC
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            value={form.nif}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, '').slice(0, 9);
                                                setForm({ ...form, nif: val });
                                                if (val.length > 0 && val.length < 9) {
                                                    setNifError('O NIF deve ter 9 dígitos');
                                                } else {
                                                    setNifError(null);
                                                }
                                            }}
                                            placeholder="Ex: 500123456"
                                            className={`w-full px-4 py-3 bg-white/5 border ${nifError ? 'border-red-400/50' : 'border-white/10'} rounded-xl focus:border-amber/50 focus:bg-white/10 outline-none transition-all font-body text-sm text-white placeholder:text-white/20`}
                                        />
                                        {nifError && (
                                            <span className="text-[10px] text-red-400 font-bold mt-1 block animate-reveal">
                                                {nifError}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <label className="text-[11px] text-white/40 uppercase font-bold mb-2 block flex items-center gap-2">
                                            <Phone className="w-3 h-3 text-amber" />
                                            Telefone
                                        </label>
                                        <input
                                            type="tel"
                                            value={form.telefone}
                                            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                                            placeholder="(00) 00000-0000"
                                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-amber/50 focus:bg-white/10 outline-none transition-all font-body text-sm text-white placeholder:text-white/20"
                                        />
                                    </div>
                                </div>

                                <div className="animate-reveal stagger-4">
                                    <label className="text-[11px] text-white/40 uppercase font-bold mb-2 block flex items-center gap-2">
                                        <Mail className="w-3 h-3 text-amber" />
                                        Endereço de Email
                                    </label>
                                    <input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        placeholder="exemplo@dominio.pt"
                                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:border-amber/50 focus:bg-white/10 outline-none transition-all font-body text-sm text-white placeholder:text-white/20"
                                    />
                                </div>

                                <div className="pt-2 animate-reveal stagger-5">
                                    <div className="relative group">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleConflictCheck();
                                            }}
                                            disabled={checkingConflict}
                                            className="w-full py-3 text-[10px] font-bold uppercase tracking-widest border border-amber-500/50 text-amber-600 bg-amber-50/50 rounded-xl hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-2 relative z-10 active:scale-[0.98]"
                                        >
                                            <Shield size={14} className={checkingConflict ? 'animate-spin' : ''} />
                                            {checkingConflict ? 'Verificando...' : 'Verificar Conflitos de Interesse'}
                                        </button>
                                        
                                        <div className="absolute bottom-full left-0 mb-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-[100] w-full pointer-events-none translate-y-2 group-hover:translate-y-0">
                                            <div className="glass-panel p-4 shadow-premium border border-amber/30 flex items-start gap-3 backdrop-blur-xl bg-navy/90">
                                                <div className="p-1.5 bg-amber/20 rounded-lg">
                                                    <Info size={14} className="shrink-0 text-amber" />
                                                </div>
                                                <div className="leading-tight">
                                                    <strong className="text-amber block text-[10px] mb-1 uppercase tracking-wider font-black">Prevenção de Risco</strong>
                                                    <p className="text-[10px] text-white/60 font-medium">Cruza os dados com todos os processos para detetar impedimentos éticos.</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {conflictResults.length > 0 && (
                                    <div className="p-5 bg-red-50/80 backdrop-blur-sm border border-red-200 rounded-2xl animate-in slide-in-from-top-2 duration-300 shadow-sm">
                                        <div className="flex items-center gap-2 text-red-600 font-bold text-[11px] uppercase mb-3">
                                            <AlertTriangle size={15} />
                                            Conflitos Potenciais Encontrados
                                        </div>
                                        <div className="space-y-2">
                                            {conflictResults.map((conflict: any, idx: number) => (
                                                <div key={idx} className="text-[11px] font-medium text-slate-700 bg-white/50 p-2 rounded-lg border border-red-100">
                                                    <span className="text-red-600 font-bold">PROC:</span> {conflict.courtReference || conflict.id} — <span className="text-slate-400">vs</span> {conflict.opposingParty}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex gap-3 animate-reveal stagger-[6]">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 py-4 text-[11px] font-bold uppercase tracking-widest text-slate-500 bg-slate-50 border border-slate-200 rounded-2xl hover:bg-white hover:border-slate-300 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading || !!nifError || !form.nif || form.nif.length < 9}
                                    className="flex-1 py-4 text-[11px] font-bold uppercase tracking-widest bg-navy text-white rounded-2xl hover:bg-navy/90 hover:shadow-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed border border-white/10 flex items-center justify-center gap-2"
                                >
                                    {loading ? (
                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <Plus className="w-4 h-4" />
                                    )}
                                    <span>{loading ? 'Guardando...' : 'Confirmar Registo'}</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
