'use client'

import { useState } from 'react'
import Link from 'next/link'
import { LayoutDashboard, FileText, Users, Calendar, Settings, ChevronLeft, ChevronRight, LogOut, Search, Wallet } from 'lucide-react'

export function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(true)

    const navItems = [
        { icon: LayoutDashboard, label: 'Painel Central', href: '/dashboard' },
        { icon: FileText, label: 'Processos', href: '/matters' },
        { icon: Users, label: 'Cadastro de Clientes', href: '/clients' },
        { icon: Wallet, label: 'Faturação', href: '/billing' },
        { icon: Search, label: 'Pesquisa JurÃ­dica IA', href: '/ai-search' },
        { icon: Calendar, label: 'Prazos & Agenda', href: '/calendar' },
        { icon: Settings, label: 'DefiniÃ§Ãµes do EscritÃ³rio', href: '/settings' },
    ]

    return (
        <div className={`${isExpanded ? 'w-64' : 'w-20'} bg-[#0F1D3A] text-white border-r border-[#1a2b4c] transition-all duration-200 flex flex-col font-body`}>
            {/* Header Area */}
            <div className="h-16 border-b border-[#1a2b4c] flex items-center justify-between px-4">
                {isExpanded && (
                    <div className="flex items-center gap-3 overflow-hidden">
                        <div className="w-8 h-8 bg-amber flex items-center justify-center text-[#0F1D3A] font-display font-bold shadow-sm shrink-0">A</div>
                        <span className="font-display font-bold tracking-tight text-white whitespace-nowrap">Advocatus IA</span>
                    </div>
                )}
                {!isExpanded && (
                    <div className="w-8 h-8 bg-amber w-full flex items-center justify-center text-[#0F1D3A] font-display font-bold shadow-sm">A</div>
                )}
            </div>

            {/* Toggle Button Container - Moved below header for cleaner look in dark theme */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full py-2 bg-[#122345] hover:bg-[#1a2b4c] transition-colors border-b border-[#1a2b4c] flex justify-center text-slate-400 hover:text-white"
                aria-label="Toggle sidebar"
            >
                {isExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
            </button>

            {/* Navigation Items */}
            <nav className="flex-1 py-6 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon
                    // Highlighting the AI Search with a subtle amber tint
                    const isAiSearch = item.href === '/app/ai-search'

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex items-center ${isExpanded ? 'px-6' : 'justify-center'} py-3 transition-colors group relative
                                ${isAiSearch
                                    ? 'hover:bg-amber/10 text-slate-300 hover:text-amber'
                                    : 'hover:bg-[#1a2b4c] text-slate-300 hover:text-white'}`}
                            title={!isExpanded ? item.label : ''}
                        >
                            {/* Active indicator bar - left edge */}
                            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-amber scale-y-0 group-hover:scale-y-100 transition-transform origin-left`}></div>

                            <Icon size={20} className={`flex-shrink-0 ${isAiSearch ? 'group-hover:text-amber' : ''}`} />

                            {isExpanded && (
                                <span className={`ml-4 font-medium text-sm whitespace-nowrap ${isAiSearch ? 'group-hover:text-amber' : ''}`}>
                                    {item.label}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User Area Footer */}
            <div className="border-t border-[#1a2b4c] p-4">
                <Link
                    href="/login"
                    className={`flex items-center ${isExpanded ? 'px-2' : 'justify-center'} py-2 text-slate-400 hover:text-white transition-colors`}
                >
                    <LogOut size={20} className="flex-shrink-0" />
                    {isExpanded && <span className="ml-4 font-medium text-sm">Terminar SessÃ£o</span>}
                </Link>
                {isExpanded && (
                    <div className="mt-4 px-2 text-xs text-slate-500 font-mono">
                        Build v1.0.0-pilot
                    </div>
                )}
            </div>
        </div>
    )
}

