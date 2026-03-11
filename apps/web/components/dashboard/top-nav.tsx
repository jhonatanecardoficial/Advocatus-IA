'use client'

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, Scale } from 'lucide-react';
import { useLogout } from '@/context/logout-context';

export function TopNav() {
    const pathname = usePathname();
    const { openLogoutModal } = useLogout();

    const isDashboard = pathname === '/dashboard';

    const handleLogoClick = (e: React.MouseEvent) => {
        if (isDashboard) {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    return (
        <header className="sticky top-0 z-50 w-full border-b-2 border-navy-800 bg-navy text-white">
            <div className="flex h-16 items-center justify-between px-6 md:px-12">
                <div className="flex items-center gap-8 lg:gap-12">
                    <Link 
                        href="/dashboard" 
                        onClick={handleLogoClick}
                        className="flex items-center gap-2 group transition-all"
                        suppressHydrationWarning
                    >
                        <Scale className="h-6 w-6 text-amber-500 group-hover:scale-110 transition-transform" />
                        <span className="font-display text-xl font-bold tracking-tight text-white group-hover:text-amber-500 transition-colors">
                            ADVOCATUS<span className="text-amber-500">.</span>IA
                        </span>
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Dr. Silva</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: ADV-4921</span>
                    </div>
                    <button 
                        onClick={openLogoutModal}
                        className="group flex items-center justify-center p-2 text-slate-400 hover:text-amber-500 transition-all border border-transparent hover:border-amber-500/30 active:scale-95"
                        title="Terminar Sessão"
                    >
                        <LogOut className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" />
                    </button>
                </div>
            </div>
        </header>
    );
}
