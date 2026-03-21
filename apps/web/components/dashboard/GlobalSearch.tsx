'use client'

import { useRef, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, X, Users, Scale, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

interface SearchResult {
    id: string;
    name?: string;
    title?: string;
    type: 'client' | 'matter';
    subtitle?: string;
}



export function GlobalSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const router = useRouter();

    // Fechar dropdown ao clicar fora
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const performSearch = async (q: string) => {
        if (q.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setIsLoading(true);
        setIsOpen(true);

        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

        try {
            const [clientsRes, mattersRes] = await Promise.all([
                fetch(`${API_URL}/clients?search=${encodeURIComponent(q)}&perPage=5`, { credentials: 'include' }),
                fetch(`${API_URL}/matters?search=${encodeURIComponent(q)}&perPage=5`, { credentials: 'include' }),
            ]);

            const combined: SearchResult[] = [];

            if (clientsRes.ok) {
                const data = await clientsRes.json();
                const clients: SearchResult[] = (data.data ?? []).map((c: {id: string; name: string; nif?: string; email?: string}) => ({
                    id: c.id,
                    name: c.name,
                    type: 'client' as const,
                    subtitle: c.nif ?? c.email ?? 'Cliente',
                }));
                combined.push(...clients);
            }

            if (mattersRes.ok) {
                const data = await mattersRes.json();
                const matters: SearchResult[] = (data.data ?? []).map((m: {id: string; title: string; type?: string; courtReference?: string}) => ({
                    id: m.id,
                    title: m.title,
                    type: 'matter' as const,
                    subtitle: m.courtReference ?? m.type ?? 'Processo',
                }));
                combined.push(...matters);
            }

            setResults(combined);
        } catch {
            setResults([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (value: string) => {
        setQuery(value);
        if (debounceRef.current) clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => performSearch(value), 300);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && query.trim()) {
            setIsOpen(false);
            router.push(`/search?q=${encodeURIComponent(query.trim())}`);
        }
        if (e.key === 'Escape') {
            setIsOpen(false);
            setQuery('');
        }
    };

    const handleResultClick = (result: SearchResult) => {
        setIsOpen(false);
        setQuery('');
        if (result.type === 'client') {
            router.push(`/clients`);
        } else {
            router.push(`/matters`);
        }
    };

    const displayLabel = (r: SearchResult) => r.name ?? r.title ?? '';

    return (
        <div className="relative hidden lg:block" ref={containerRef}>
            <div className={`flex items-center gap-3 px-4 py-2 bg-white/5 border rounded-full text-slate-400 transition-all w-64 ${isOpen || query ? 'border-amber/40' : 'border-white/10'} focus-within:border-amber/50`}>
                {isLoading
                    ? <Loader2 size={14} className="text-amber animate-spin flex-shrink-0" />
                    : <Search size={14} className="flex-shrink-0 group-focus-within:text-amber transition-colors" />
                }
                <input
                    type="text"
                    placeholder="Pesquisar clientes, processos..."
                    value={query}
                    onChange={(e) => handleChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => query.length >= 2 && setIsOpen(true)}
                    className="bg-transparent border-none outline-none text-xs font-bold w-full text-white placeholder:text-slate-500"
                    aria-label="Pesquisa global — clientes e processos"
                />
                {query && (
                    <button
                        onClick={() => { setQuery(''); setResults([]); setIsOpen(false); }}
                        className="text-slate-500 hover:text-white transition-colors flex-shrink-0"
                        aria-label="Limpar pesquisa"
                    >
                        <X size={12} />
                    </button>
                )}
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.97 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-0 top-full mt-2 w-80 glass-panel border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                    >
                        {results.length > 0 ? (
                            <div className="py-2 max-h-80 overflow-y-auto custom-scrollbar">
                                {/* Clientes */}
                                {results.filter(r => r.type === 'client').length > 0 && (
                                    <>
                                        <div className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                            <Users size={10} /> Clientes
                                        </div>
                                        {results.filter(r => r.type === 'client').map(r => (
                                            <button
                                                key={r.id}
                                                onClick={() => handleResultClick(r)}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-all text-left group"
                                            >
                                                <div className="w-7 h-7 rounded-full bg-amber/10 border border-amber/20 flex items-center justify-center flex-shrink-0">
                                                    <Users size={12} className="text-amber" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold text-white group-hover:text-amber transition-colors truncate">{displayLabel(r)}</div>
                                                    <div className="text-[10px] text-slate-500 truncate">{r.subtitle}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </>
                                )}
                                {/* Processos */}
                                {results.filter(r => r.type === 'matter').length > 0 && (
                                    <>
                                        <div className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2 mt-1">
                                            <Scale size={10} /> Processos
                                        </div>
                                        {results.filter(r => r.type === 'matter').map(r => (
                                            <button
                                                key={r.id}
                                                onClick={() => handleResultClick(r)}
                                                className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/5 transition-all text-left group"
                                            >
                                                <div className="w-7 h-7 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                                                    <Scale size={12} className="text-slate-400" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="text-xs font-bold text-white group-hover:text-amber transition-colors truncate">{displayLabel(r)}</div>
                                                    <div className="text-[10px] text-slate-500 truncate">{r.subtitle}</div>
                                                </div>
                                            </button>
                                        ))}
                                    </>
                                )}
                                {/* Ver todos */}
                                <div className="border-t border-white/5 mt-1">
                                    <Link
                                        href={`/search?q=${encodeURIComponent(query)}`}
                                        onClick={() => { setIsOpen(false); setQuery(''); }}
                                        className="w-full flex items-center justify-center py-3 text-[10px] font-black uppercase tracking-widest text-amber/60 hover:text-amber transition-colors"
                                    >
                                        Ver todos os resultados →
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <div className="py-8 text-center text-slate-500 text-xs font-mono">
                                {isLoading ? 'A pesquisar...' : `Sem resultados para "${query}"`}
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
