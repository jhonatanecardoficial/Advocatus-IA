"use client";

import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { Plus, X, Briefcase, User, Calendar, FileText, Scale, Zap, ChevronDown, Search, Loader2, Check } from 'lucide-react';
import { createMatterAction } from '@/app/actions/matters';
import { searchClientsAction } from '@/app/actions/clients';
import { toast } from 'sonner';

interface Client {
    id: string;
    name?: string;
    nome?: string;
}

interface AddMatterModalProps {
    clientId?: string;
    clientName?: string;
    trigger?: React.ReactNode;
}

export default function AddMatterModal({ clientId, clientName, trigger }: AddMatterModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    
    // Autocomplete States
    const [clients, setClients] = useState<Client[]>([]);
    const [searchTerm, setSearchTerm] = useState(clientName || '');
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const portalRef = useRef<HTMLDivElement>(null);

    const [form, setForm] = useState({
        title: '',
        clientId: clientId || '',
        type: 'CIVEL' as any,
        status: 'ATIVO' as any,
        courtReference: '',
        description: '',
        deadlineAt: '',
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    // Atualiza o formulário se o clientId mudar via props ou ao abrir o modal
    useEffect(() => {
        if (isOpen && clientId) {
            setForm(prev => ({ ...prev, clientId }));
            if (clientName) {
                setSearchTerm(clientName);
            }
        }
    }, [isOpen, clientId, clientName]);

    // Lógica de Autocomplete (Debounce)
    useEffect(() => {
        if (!isOpen || clientId) return;

        // Se o campo estiver vazio, não fazemos debounce para a carga inicial rápida no foco
        if (searchTerm.length === 0) {
            fetchClients('');
            return;
        }

        const timer = setTimeout(() => {
            fetchClients(searchTerm);
        }, 300);

        return () => clearTimeout(timer);
    }, [searchTerm, isOpen, clientId]);

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            const isInsideInput = dropdownRef.current && dropdownRef.current.contains(event.target as Node);
            const isInsidePortal = portalRef.current && portalRef.current.contains(event.target as Node);
            
            if (!isInsideInput && !isInsidePortal) {
                setShowResults(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchClients = async (query: string) => {
        setIsSearching(true);
        try {
            const data = await searchClientsAction(query);
            
            if (data.error) {
                console.error('Erro ao procurar clientes:', data.error);
                setClients([]);
                return;
            }

            if (data.data) {
                setClients(data.data);
            } else if (Array.isArray(data)) {
                setClients(data);
            }
        } catch (error) {
            console.error('Erro ao procurar clientes:', error);
            setClients([]);
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectClient = (client: Client) => {
        const displayName = client.nome || client.name || '';
        setForm({ ...form, clientId: client.id });
        setSearchTerm(displayName);
        setShowResults(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!form.clientId) {
            toast.error('Por favor, selecione um cliente.');
            return;
        }

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
                    clientId: clientId || '',
                    type: 'CIVEL',
                    status: 'ATIVO',
                    courtReference: '',
                    description: '',
                    deadlineAt: '',
                });
                setSearchTerm(clientName || '');
            }
        } catch (err) {
            toast.error('Erro ao conectar ao servidor');
        } finally {
            setLoading(false);
        }
    };

    const modalContent = isOpen && (
        <div className="fixed inset-0 bg-slate-950/95 z-[150] flex items-start justify-center p-4 sm:p-8 md:p-12 animate-in fade-in duration-300 overflow-y-auto custom-scrollbar">
            <div className="w-full max-w-2xl bg-[#050b14] border border-white/20 shadow-premium flex flex-col my-auto animate-in zoom-in-95 duration-300">
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

                <form onSubmit={handleSubmit} className="flex flex-col bg-[#050b14] !opacity-100">
                    <div className="p-8 space-y-8 !bg-[#050b14] !bg-opacity-100 !opacity-100">
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
                                className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-none focus:border-amber/50 focus:bg-white/[0.07] focus:ring-4 focus:ring-amber/5 outline-none transition-all font-body text-sm text-white placeholder:text-white/20"
                            />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-reveal" style={{ animationDelay: '200ms' }}>
                            <div className="relative" ref={dropdownRef}>
                                <label className="text-[10px] text-white/40 uppercase font-black tracking-widest mb-3 block flex items-center gap-2">
                                    <User className="w-3.5 h-3.5 text-amber/60" />
                                    Cliente Associado
                                </label>
                                <div className="relative group">
                                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-white/30">
                                        <Search size={16} />
                                    </div>
                                    <input
                                        type="text"
                                        readOnly={!!clientId}
                                        value={searchTerm}
                                        onChange={(e) => {
                                            if (!clientId) {
                                                setSearchTerm(e.target.value);
                                                setForm({ ...form, clientId: '' });
                                            }
                                        }}
                                        onFocus={() => {
                                            if (!clientId) {
                                                setShowResults(true);
                                                if (clients.length === 0) fetchClients(searchTerm);
                                            }
                                        }}
                                        placeholder={clientId ? "" : "Clique para ver clientes ou pesquise..."}
                                        className={`w-full pl-12 pr-12 py-4 bg-white/[0.05] border ${ clientId ? 'border-amber/40 bg-amber/5 text-amber font-bold' : 'border-white/20 text-white' } rounded-none outline-none transition-all font-body text-sm ${ !clientId ? 'focus:border-amber/50 focus:bg-white/[0.07] cursor-pointer' : '' } `}
                                    />
                                    {isSearching && (
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-amber animate-spin">
                                            <Loader2 size={16} />
                                        </div>
                                    )}
                                    {clientId && (
                                        <div className="absolute right-5 top-1/2 -translate-y-1/2 text-amber/50">
                                            <Check size={16} />
                                        </div>
                                    )}
                                </div>

                                {/* Results Dropdown */}
                                 {!clientId && showResults && typeof document !== 'undefined' && createPortal(
                                    <div 
                                        ref={portalRef}
                                        className="fixed w-full mt-1 border border-white/20 shadow-[0_30px_90px_rgba(0,0,0,1)] rounded-none overflow-hidden bg-[#050b14] opacity-100"
                                        style={{ 
                                            zIndex: 9999999,
                                            left: dropdownRef.current?.getBoundingClientRect().left,
                                            top: (dropdownRef.current?.getBoundingClientRect().bottom || 0) + window.scrollY,
                                            width: dropdownRef.current?.offsetWidth,
                                            backgroundColor: '#050b14'
                                        }}
                                    >
                                        <div className="max-h-[340px] overflow-y-auto custom-scrollbar bg-[#050b14] opacity-100">
                                            {clients.length > 0 ? (
                                                clients.map((c) => (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => handleSelectClient(c)}
                                                        className="w-full text-left px-5 py-4 flex items-center justify-between transition-all text-white text-sm font-medium border-b border-white/[0.03] last:border-none hover:bg-[#b3c7f7] hover:text-[#0a192f] bg-[#050b14] hover:!bg-[#b3c7f7]"
                                                    >
                                                        <span className="truncate">{c.nome || c.name}</span>
                                                    </button>
                                                ))
                                            ) : !isSearching && (
                                                <div className="p-10 text-center bg-[#050b14] opacity-100">
                                                    <User size={24} className="mx-auto text-white/5 mb-3" />
                                                    <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Nenhum cliente encontrado</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>,
                                    document.body
                                )}
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
                                        className="w-full px-5 py-4 bg-white/[0.05] border border-white/20 rounded-none focus:border-amber/50 focus:bg-white/[0.07] outline-none transition-all font-body text-sm text-white appearance-none cursor-pointer"
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
                                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-none focus:border-amber/50 focus:bg-white/[0.07] outline-none transition-all font-body text-sm text-white placeholder:text-white/20"
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
                                    className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-none focus:border-amber/50 focus:bg-white/[0.07] outline-none transition-all font-body text-sm text-white [color-scheme:dark]"
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
                                className="w-full px-5 py-4 bg-white/[0.03] border border-white/10 rounded-none focus:border-amber/50 focus:bg-white/[0.07] outline-none transition-all font-body text-sm text-white placeholder:text-white/20 resize-none"
                            ></textarea>
                        </div>
                    </div>

                    <div className="p-6 border-t border-white/10 bg-navy/50 backdrop-blur-xl flex gap-4 shrink-0">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest text-white/60 bg-white/5 border border-white/10 rounded-none hover:bg-white/10 hover:text-white transition-all font-display"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !form.clientId}
                            className="flex-1 py-4 text-[10px] font-black uppercase tracking-widest bg-amber text-navy rounded-none hover:scale-[1.02] active:scale-[0.98] shadow-glow transition-all disabled:opacity-50 flex items-center justify-center gap-3 font-display"
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
    );

    return (
        <>
            {trigger ? (
                <div onClick={() => setIsOpen(true)}>
                    {trigger}
                </div>
            ) : (
                <button
                    onClick={() => setIsOpen(true)}
                    className="btn-premium flex items-center gap-2 group animate-reveal"
                >
                    <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" /> 
                    <span>Novo Processo</span>
                </button>
            )}

            {mounted && isOpen && createPortal(modalContent, document.getElementById('modal-root') || document.body)}
        </>
    );
}
