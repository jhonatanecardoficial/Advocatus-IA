import Link from 'next/link';
import { LogOut, Scale } from 'lucide-react';

export function TopNav() {
    return (
        <header className="sticky top-0 z-50 w-full border-b-2 border-navy-800 bg-navy text-white">
            <div className="flex h-16 items-center justify-between px-6 md:px-12">
                <div className="flex items-center gap-8 lg:gap-12">
                    <Link href="/dashboard" className="flex items-center gap-2" suppressHydrationWarning>
                        <Scale className="h-6 w-6 text-amber-500" />
                        <span className="font-display text-xl font-bold tracking-tight text-white">
                            ADVOCATUS<span className="text-amber-500">.</span>IA
                        </span>
                    </Link>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end mr-4">
                        <span className="text-xs font-bold text-white uppercase tracking-wider">Dr. Silva</span>
                        <span className="text-[10px] text-slate-400 font-mono">ID: ADV-4921</span>
                    </div>
                    <button className="flex items-center justify-center p-2 text-slate-400 hover:text-amber-500 transition-colors border border-transparent hover:border-amber-500/30">
                        <LogOut className="h-4 w-4" />
                    </button>
                </div>
            </div>
        </header>
    );
}
