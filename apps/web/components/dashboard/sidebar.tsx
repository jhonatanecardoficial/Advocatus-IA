'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Users, Calendar, Settings, ChevronLeft, ChevronRight, LogOut, Search, Wallet } from 'lucide-react'
import { useLogout } from '@/context/logout-context'

export function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(true)
    const pathname = usePathname()
    const { openLogoutModal } = useLogout()

    const navItems = [
        { icon: LayoutDashboard, label: 'Painel Central', href: '/dashboard' },
        { icon: FileText, label: 'Processos', href: '/matters' },
        { icon: Users, label: 'Cadastro de Clientes', href: '/clients' },
        { icon: Wallet, label: 'Faturação', href: '/billing' },
        { icon: Search, label: 'Pesquisa Jurídica IA', href: '/ai-search' },
        { icon: Calendar, label: 'Prazos & Agenda', href: '/dashboard' }, // Links para o dashboard por enquanto
        { icon: Settings, label: 'Definições do Escritório', href: '/settings' },
    ]

    const isDashboard = pathname === '/dashboard'
    const handleLogoClick = (e: React.MouseEvent) => {
        if (isDashboard) {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    return (
        <div className={`${isExpanded ? 'w-64' : 'w-20'} bg-[#0F1D3A] text-white border-r border-[#1a2b4c] transition-all duration-200 flex flex-col font-body`}>
            {/* Header Area */}
            <div className="h-16 border-b border-[#1a2b4c] flex items-center justify-between px-4">
                <Link
                    href="/dashboard"
                    onClick={handleLogoClick}
                    className="flex-1 flex items-center h-full group transition-all"
                    suppressHydrationWarning
                >
                    {isExpanded && (
                        <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 bg-amber flex items-center justify-center text-[#0F1D3A] font-display font-bold shadow-sm shrink-0 group-hover:scale-110 transition-transform">A</div>
                            <span className="font-display font-bold tracking-tight text-white whitespace-nowrap group-hover:text-amber transition-colors text-sm">Advocatus IA</span>
                        </div>
                    )}
                    {!isExpanded && (
                        <div className="w-8 h-8 bg-amber w-full flex items-center justify-center text-[#0F1D3A] font-display font-bold shadow-sm group-hover:scale-110 transition-transform">A</div>
                    )}
                </Link>
            </div>

            {/* Toggle Button Container */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full py-2 bg-[#122345] hover:bg-[#1a2b4c] transition-colors border-b border-[#1a2b4c] flex justify-center text-slate-400 hover:text-white"
                aria-label="Toggle sidebar"
            >
                {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>

            {/* Navigation Items */}
            <nav className="flex-1 py-6 space-y-1 overflow-y-auto custom-scrollbar">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    const isAiSearch = item.href === '/ai-search'

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center ${isExpanded ? 'px-6' : 'justify-center'} py-3 transition-all group relative ${isActive ? 'bg-[#1a2b4c] text-white' : 'text-slate-400 hover:text-white hover:bg-[#1a2b4c]/50'} ${isAiSearch ? 'hover:text-amber' : ''}`}
                            title={!isExpanded ? item.label : ''}
                        >
                            {/* Active indicator bar - left edge */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-amber transition-all duration-300 ${isActive ? 'scale-y-100' : 'scale-y-0 group-hover:scale-y-100'}`}></div>

                            <Icon size={18} className={`flex-shrink-0 transition-transform group-hover:scale-110 ${isActive ? 'text-amber' : ''}`} />

                            {isExpanded && (
                                <span className="ml-4 font-medium text-xs whitespace-nowrap">
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User Area Footer */}
            <div className="border-t border-[#1a2b4c] p-4 bg-[#0a1529]">
                <button
                    onClick={openLogoutModal}
                    className={`w-full flex items-center ${isExpanded ? 'px-2' : 'justify-center'} py-2.5 text-slate-400 hover:text-white hover:bg-red-500/10 transition-all group rounded-none`}
                    title="Terminar Sessão"
                >
                    <LogOut size={18} className="flex-shrink-0 group-hover:-translate-x-1 transition-transform" />
                    {isExpanded && <span className="ml-4 font-medium text-xs">Terminar Sessão</span>}
                </button>
                {isExpanded && (
                    <div className="mt-4 px-2 text-[10px] text-slate-600 font-mono tracking-tighter opacity-50 italic">
                        BUILD v1.0.0-PILOT
                    </div>
                )}
            </div>
        </div>
    )
}

