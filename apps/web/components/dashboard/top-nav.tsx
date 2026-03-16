'use client'

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Scale, Bell, Search } from 'lucide-react';
import { useLogout } from '@/context/logout-context';
import { motion } from 'framer-motion';

export function TopNav() {
    const [isMounted, setIsMounted] = useState(false);
    const pathname = usePathname();
    const { openLogoutModal } = useLogout();

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const isDashboard = pathname === '/dashboard';

    const handleLogoClick = (e: React.MouseEvent) => {
        if (isDashboard) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    if (!isMounted) return null;

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
                    {/* Search Bar Placeholder */}
                    <div className="hidden lg:flex items-center gap-3 px-4 py-2 bg-white/5 border border-white/10 rounded-full text-slate-400 group focus-within:border-amber/50 transition-all w-64">
                        <Search size={14} className="group-focus-within:text-amber transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Pesquisar..." 
                            className="bg-transparent border-none outline-none text-xs font-bold w-full text-white placeholder:text-slate-500"
                        />
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="p-2.5 text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full border border-white/5 relative"
                    >
                        <Bell size={18} />
                        <span className="absolute top-2 right-2 w-2 h-2 bg-amber rounded-full border border-navy shadow-sm"></span>
                    </motion.button>

                    <div className="h-4 w-[1px] bg-white/10 hidden md:block" />

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-xs font-black text-white uppercase tracking-widest">Dr. Silva</span>
                            <span className="text-[10px] text-amber/60 font-mono font-bold tracking-tighter">PREMIUM MEMBER</span>
                        </div>
                        <motion.div 
                            whileHover={{ scale: 1.05, border: "1px solid rgba(251, 191, 36, 0.5)" }}
                            className="h-10 w-10 rounded-full bg-gradient-to-tr from-amber to-navy-600 border border-white/20 flex items-center justify-center font-bold text-navy shadow-lg"
                        >
                            DS
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
