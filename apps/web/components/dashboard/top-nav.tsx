'use client'

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, Scale, Bell, Search, AlertTriangle, Clock, X } from 'lucide-react';
import { useLogout } from '@/context/logout-context';
import { motion, AnimatePresence } from 'framer-motion';

interface DeadlineAlert {
    id: string;
    title: string;
    daysUntilDue: number;
    type: 'fatal' | 'warning';
}

/**
 * Gera as iniciais a partir do nome completo do utilizador.
 * Exemplo: "João do Santos Martins" → "JM" (1ª letra do 1º nome + 1ª letra do último nome)
 */
function getInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return '??';
    const first = parts[0][0] ?? '';
    const last = parts.length > 1 ? (parts[parts.length - 1][0] ?? '') : '';
    return (first + last).toUpperCase() || '??';
}

export function TopNav() {
    const [isMounted, setIsMounted] = useState(false);
    const [user, setUser] = useState<{ name: string } | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showNotifications, setShowNotifications] = useState(false);
    const [deadlineAlerts, setDeadlineAlerts] = useState<DeadlineAlert[]>([]);
    const pathname = usePathname();
    const router = useRouter();
    const { openLogoutModal } = useLogout();
    const notifRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setIsMounted(true);
        fetchProfile();
        fetchDeadlineAlerts();
    }, []);

    // Fechar dropdown de notificações ao clicar fora
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchProfile = async () => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
        try {
            const res = await fetch(`${API_URL}/auth/me`, {
                headers: { 
                    'Authorization': `Bearer ${getCookie('accessToken')}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                setUser(data.data);
            }
        } catch (err) {
            console.error('Erro ao buscar perfil:', err);
        }
    };

    const fetchDeadlineAlerts = async () => {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
        try {
            const res = await fetch(`${API_URL}/reports/dashboard-metrics`, {
                headers: { 
                    'Authorization': `Bearer ${getCookie('accessToken')}`
                }
            });
            if (res.ok) {
                const data = await res.json();
                const alerts: DeadlineAlert[] = [];
                if (data.data?.fatalDeadlines > 0) {
                    alerts.push({
                        id: 'fatal',
                        title: `${data.data.fatalDeadlines} prazo(s) crítico(s) próximo(s)`,
                        daysUntilDue: 0,
                        type: 'fatal'
                    });
                }
                if (data.data?.upcomingTasks > 0) {
                    alerts.push({
                        id: 'upcoming',
                        title: `${data.data.upcomingTasks} tarefa(s) nos próximos 7 dias`,
                        daysUntilDue: 7,
                        type: 'warning'
                    });
                }
                setDeadlineAlerts(alerts);
            }
        } catch {
            // Silencioso — notificações são opcionais
        }
    };

    const getCookie = (name: string) => {
        if (typeof document === 'undefined') return undefined;
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop()?.split(';').shift();
        return undefined;
    };

    const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && searchQuery.trim()) {
            router.push(`/ai-search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchQuery('');
        }
    };

    const isDashboard = pathname === '/dashboard';

    const handleLogoClick = (e: React.MouseEvent) => {
        if (isDashboard) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (!isMounted) return null;

    const hasAlerts = deadlineAlerts.length > 0;
    const initials = user?.name ? getInitials(user.name) : '??';

    return (
        <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 text-white bg-navy/10 backdrop-blur-xl">
            <div className="flex h-20 items-center justify-between px-6 md:px-12">
                <div className="flex items-center gap-8 lg:gap-12">
                    <Link 
                        href="/dashboard" 
                        onClick={handleLogoClick}
                        className="flex items-center gap-2 group transition-all"
                        suppressHydrationWarning
                    >
                        <motion.div
                            whileHover={{ rotate: -10, scale: 1.1 }}
                            transition={{ type: "spring", stiffness: 400, damping: 10 }}
                        >
                            <Scale className="h-7 w-7 text-amber" />
                        </motion.div>
                        <span className="font-display text-2xl font-bold tracking-tight text-gradient group-hover:tracking-wider transition-all">
                            ADVOCATUS<span className="text-amber">.</span>IA
                        </span>
                    </Link>
                </div>

                <div className="flex items-center gap-6">
                    {/* Barra de Pesquisa Global — redireciona para /ai-search */}
                    <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-slate-400 group focus-within:border-amber/50 transition-all w-64">
                        <Search size={14} className="group-focus-within:text-amber transition-colors flex-shrink-0" />
                        <input 
                            type="text" 
                            placeholder="Pesquisar... (Enter)" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleSearch}
                            className="bg-transparent border-none outline-none text-xs font-bold w-full text-white placeholder:text-slate-500"
                            aria-label="Pesquisa global — pressione Enter para pesquisar"
                        />
                        {searchQuery && (
                            <button onClick={() => setSearchQuery('')} className="text-slate-500 hover:text-white transition-colors">
                                <X size={12} />
                            </button>
                        )}
                    </div>

                    {/* Botão de Notificações com Dropdown */}
                    <div className="relative" ref={notifRef}>
                        <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => setShowNotifications(!showNotifications)}
                            className="p-2.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/5 relative"
                            aria-label="Notificações e alertas de prazos"
                            title="Alertas de Prazos"
                        >
                            <Bell size={18} />
                            {hasAlerts && (
                                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-amber rounded-full border border-navy shadow-sm animate-pulse" />
                            )}
                        </motion.button>

                        <AnimatePresence>
                            {showNotifications && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute right-0 top-full mt-2 w-80 glass-panel border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50"
                                >
                                    <div className="p-4 border-b border-white/10 flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-white">Alertas</h3>
                                        <Link 
                                            href="/tasks"
                                            onClick={() => setShowNotifications(false)}
                                            className="text-[10px] font-bold text-amber hover:text-white transition-colors uppercase tracking-widest"
                                        >
                                            Ver Todos
                                        </Link>
                                    </div>
                                    <div className="p-3 space-y-2 max-h-64 overflow-y-auto">
                                        {hasAlerts ? deadlineAlerts.map((alert) => (
                                            <Link
                                                key={alert.id}
                                                href="/tasks"
                                                onClick={() => setShowNotifications(false)}
                                                className={`flex items-start gap-3 p-3 rounded-xl transition-all hover:bg-white/5 cursor-pointer ${
                                                    alert.type === 'fatal' 
                                                        ? 'border border-red-500/20 bg-red-500/5' 
                                                        : 'border border-amber/20 bg-amber/5'
                                                }`}
                                            >
                                                {alert.type === 'fatal' 
                                                    ? <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                                                    : <Clock size={16} className="text-amber flex-shrink-0 mt-0.5" />
                                                }
                                                <span className="text-xs font-semibold text-white/80">{alert.title}</span>
                                            </Link>
                                        )) : (
                                            <div className="text-center py-6 text-slate-500 text-xs font-mono">
                                                Sem alertas activos
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="h-4 w-[1px] bg-white/10 hidden md:block" />

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-xs font-black text-white uppercase tracking-widest">
                                {user?.name || 'Advogado'}
                            </span>
                            <span className="text-[10px] text-amber/60 font-mono font-bold tracking-tighter">PREMIUM MEMBER</span>
                        </div>
                        <motion.div 
                            whileHover={{ scale: 1.05 }}
                            className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber to-navy-600 border border-white/20 flex items-center justify-center font-bold text-navy shadow-lg text-xs"
                            title={user?.name || 'Utilizador'}
                        >
                            {initials}
                        </motion.div>
                    </div>

                    <div className="h-4 w-[1px] bg-white/10" />

                    <button 
                        onClick={openLogoutModal}
                        className="group flex items-center justify-center p-3 text-slate-400 hover:text-red-400 transition-all bg-white/5 hover:bg-white/10 rounded-full border border-white/5 shadow-sm active:scale-95"
                        title="Terminar Sessão"
                    >
                        <LogOut className="h-5 w-5 group-hover:-translate-y-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </header>
    );
}
