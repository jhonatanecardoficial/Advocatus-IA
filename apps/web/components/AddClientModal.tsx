"use client";

import { useState } from 'react';
import { Plus, X, User, Briefcase, Hash, Mail, Phone, Shield, AlertTriangle, Info } from 'lucide-react';
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
                className="bg-navy text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-amber-600 transition-colors border-2 border-navy flex items-center gap-2"
            >
                <Plus className="h-4 w-4" /> Novo Cliente
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="bg-white border-4 border-navy w-full max-w-xl shadow-[8px_8px_0px_#D4A853] animate-in zoom-in-95 duration-200">
                        <div className="bg-navy p-4 flex justify-between items-center">
                            <h2 className="text-white font-display font-black uppercase tracking-widest text-lg flex items-center gap-2">
                                <Plus size={20} className="text-amber" />
                                Novo Registo de Entidade
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:text-amber transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <label className={`flex items-center justify-center gap-2 p-4 border-2 cursor-pointer transition-all ${form.tipo === 'SINGULAR' ? 'border-navy bg-navy/5 text-navy' : 'border-slate-200 text-slate-400 hover:border-navy/30'}`}>
                                    <input
                                        type="radio"
                                        className="hidden"
                                        name="tipo"
                                        value="SINGULAR"
                                        checked={form.tipo === 'SINGULAR'}
                                        onChange={() => setForm({ ...form, tipo: 'SINGULAR' })}
                                    />
                                    <User size={18} />
                                    <span className="text-xs font-bold uppercase">Pessoa Singular</span>
                                </label>
                                <label className={`flex items-center justify-center gap-2 p-4 border-2 cursor-pointer transition-all ${form.tipo === 'COLETIVA' ? 'border-navy bg-navy/5 text-navy' : 'border-slate-200 text-slate-400 hover:border-navy/30'}`}>
                                    <input
                                        type="radio"
                                        className="hidden"
                                        name="tipo"
                                        value="COLETIVA"
                                        checked={form.tipo === 'COLETIVA'}
                                        onChange={() => setForm({ ...form, tipo: 'COLETIVA' })}
                                    />
                                    <Briefcase size={18} />
                                    <span className="text-xs font-bold uppercase">Pessoa Coletiva</span>
                                </label>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-navy mb-1 ml-1 tracking-widest">Nome Completo / Denominação</label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            required
                                            type="text"
                                            value={form.nome}
                                            onChange={(e) => setForm({ ...form, nome: e.target.value })}
                                            placeholder="Ex: João Silva ou Empresa, Lda"
                                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 focus:border-navy outline-none transition-colors font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-navy mb-1 ml-1 tracking-widest">NIF / NIPC</label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                required
                                                type="text"
                                                maxLength={9}
                                                value={form.nif}
                                                onChange={(e) => setForm({ ...form, nif: e.target.value })}
                                                placeholder="999 999 999"
                                                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 focus:border-navy outline-none transition-colors font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-navy mb-1 ml-1 tracking-widest">Telefone</label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="tel"
                                                value={form.telefone}
                                                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                                                placeholder="+351 9xx xxx xxx"
                                                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 focus:border-navy outline-none transition-colors font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-navy mb-1 ml-1 tracking-widest">Endereço de Email</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            type="email"
                                            value={form.email}
                                            onChange={(e) => setForm({ ...form, email: e.target.value })}
                                            placeholder="exemplo@dominio.pt"
                                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 focus:border-navy outline-none transition-colors font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="pt-2">
                                    <div className="relative group">
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleConflictCheck();
                                            }}
                                            disabled={checkingConflict}
                                            className="w-full py-2 text-[10px] font-bold uppercase tracking-widest border-2 border-amber-500 text-amber-600 hover:bg-amber-600 hover:text-white transition-all flex items-center justify-center gap-2 relative z-10 active:scale-95"
                                        >
                                            <Shield size={14} />
                                            {checkingConflict ? 'A Verificar...' : 'Verificar Conflitos de Interesse'}
                                        </button>
                                        
                                        {/* Improved Tooltip logic */}
                                        <div className="absolute bottom-full left-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-[100] w-full pointer-events-none translate-y-1 group-hover:translate-y-0">
                                            <div className="bg-navy text-white text-[10px] p-3 shadow-lg border border-amber-500 flex items-start gap-2 leading-relaxed">
                                                <Info size={14} className="shrink-0 text-amber mt-0.5" />
                                                <span>
                                                    <strong className="text-amber block mb-1 uppercase tracking-tighter italic">Dica de Segurança</strong>
                                                    Cruza Nome e NIF com a base total do escritório para detetar impedimentos éticos antes de registar.
                                                </span>
                                            </div>
                                            {/* Arrow */}
                                            <div className="w-2 h-2 bg-navy border-r border-b border-amber-500 rotate-45 ml-6 -mt-1 absolute left-0 bottom-0 -mb-1"></div>
                                        </div>
                                    </div>
                                </div>

                                {conflictResults.length > 0 && (
                                    <div className="p-4 bg-red-50 border-2 border-red-600 animate-in slide-in-from-top-2">
                                        <div className="flex items-center gap-2 text-red-600 font-bold text-xs uppercase mb-2">
                                            <AlertTriangle size={14} />
                                            Atenção: Conflitos Potenciais
                                        </div>
                                        <div className="space-y-2">
                                            {conflictResults.map((conflict: any, idx: number) => (
                                                <div key={idx} className="text-[10px] font-mono text-navy border-b border-red-200 pb-1 last:border-0">
                                                    PROC: {conflict.courtReference || conflict.id} - Parte Contraria: {conflict.opposingParty}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="pt-4 border-t-2 border-slate-100 flex gap-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 px-4 py-4 text-xs font-bold uppercase tracking-widest text-navy bg-slate-100 hover:bg-slate-200 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-1 px-4 py-4 text-xs font-bold uppercase tracking-widest bg-navy text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'A Gravar...' : 'Confirmar Registo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
