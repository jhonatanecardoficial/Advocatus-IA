"use client";

import { useState, useEffect } from 'react';
import { Plus, X, Briefcase, User, Calendar, FileText, Scale } from 'lucide-react';
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
                headers: { 
                    'Authorization': `Bearer ${getCookie('access_token')}`
                }
            });
            const data = await res.json();
            setClients(data.data || []);
        } catch (err) {
            console.error('Erro ao procurar clientes:', err);
        }
    };

    const getCookie = (name: string) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return undefined;
    };

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
                className="bg-navy text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-amber-600 transition-colors border-2 border-navy flex items-center gap-2"
            >
                <Plus className="h-4 w-4" /> Novo Processo
            </button>

            {isOpen && (
                <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300 overflow-y-auto">
                    <div className="bg-white border-4 border-navy w-full max-w-2xl my-8 shadow-[8px_8px_0px_#D4A853] animate-in zoom-in-95 duration-200">
                        <div className="bg-navy p-4 flex justify-between items-center sticky top-0 z-10">
                            <h2 className="text-white font-display font-black uppercase tracking-widest text-lg flex items-center gap-2">
                                <Scale size={20} className="text-amber" />
                                Abrir Novo Processo
                            </h2>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-white hover:text-amber transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-8 space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-navy mb-1 ml-1 tracking-widest">Título do Processo</label>
                                    <div className="relative">
                                        <FileText className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                        <input
                                            required
                                            type="text"
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            placeholder="Ex: Acção de Despejo - Fracção B"
                                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 focus:border-navy outline-none transition-colors font-mono text-sm"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-navy mb-1 ml-1 tracking-widest">Cliente Associado</label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <select
                                                required
                                                value={form.clientId}
                                                onChange={(e) => setForm({ ...form, clientId: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 focus:border-navy outline-none transition-colors font-mono text-sm appearance-none bg-white"
                                            >
                                                <option value="">Seleccionar Cliente...</option>
                                                {clients.map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-navy mb-1 ml-1 tracking-widest">Área de Prática</label>
                                        <div className="relative">
                                            <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <select
                                                required
                                                value={form.type}
                                                onChange={(e) => setForm({ ...form, type: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 focus:border-navy outline-none transition-colors font-mono text-sm appearance-none bg-white"
                                            >
                                                <option value="CIVEL">Cível</option>
                                                <option value="PENAL">Penal</option>
                                                <option value="LABORAL">Laboral</option>
                                                <option value="ADMINISTRATIVO">Administrativo</option>
                                                <option value="FISCAL">Fiscal</option>
                                                <option value="FAMILIA">Família</option>
                                                <option value="COMERCIAL">Comercial</option>
                                                <option value="OUTRO">Outro</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-navy mb-1 ml-1 tracking-widest">Ref. Tribunal / CITIUS</label>
                                        <div className="relative">
                                            <Scale className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="text"
                                                value={form.courtReference}
                                                onChange={(e) => setForm({ ...form, courtReference: e.target.value })}
                                                placeholder="Ex: 123/24.5LSB"
                                                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 focus:border-navy outline-none transition-colors font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-bold uppercase text-navy mb-1 ml-1 tracking-widest">Data Limite / Prazo</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                                            <input
                                                type="date"
                                                value={form.deadlineAt}
                                                onChange={(e) => setForm({ ...form, deadlineAt: e.target.value })}
                                                className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 focus:border-navy outline-none transition-colors font-mono text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[10px] font-bold uppercase text-navy mb-1 ml-1 tracking-widest">Notas / Descrição</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        rows={4}
                                        placeholder="Breve descrição dos factos ou objectivos do processo..."
                                        className="w-full px-4 py-3 border-2 border-slate-200 focus:border-navy outline-none transition-colors font-body text-sm resize-none"
                                    ></textarea>
                                </div>
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
                                    {loading ? 'A Gravar...' : 'Abrir Processo'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
