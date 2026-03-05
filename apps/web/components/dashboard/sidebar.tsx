'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronDown, LayoutDashboard, FileText, Users, Calendar, Settings, ChevronLeft, ChevronRight } from 'lucide-react'

export function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(true)

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', href: '/app' },
        { icon: FileText, label: 'Processos', href: '/app/matters' },
        { icon: Users, label: 'Clientes', href: '/app/clients' },
        { icon: Calendar, label: 'Calendário', href: '/app/calendar' },
        { icon: Settings, label: 'Configurações', href: '/app/settings' },
    ]

    return (
        <div className={`${isExpanded ? 'w-64' : 'w-20'} bg-white border-r border-slate-200 transition-all duration-200 flex flex-col`}>
            {/* Toggle Button */}
            <div className="p-4 border-b border-slate-200 flex justify-end">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="text-slate-600 hover:text-navy transition"
                    aria-label="Toggle sidebar"
                >
                    {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
                </button>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 p-4 space-y-2">
                {navItems.map((item) => {
                    const Icon = item.icon
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:text-navy hover:bg-navy-50 rounded-lg transition group"
                            title={!isExpanded ? item.label : ''}
                        >
                            <Icon size={20} className="flex-shrink-0" />
                            {isExpanded && <span className="font-medium text-sm">{item.label}</span>}
                        </Link>
                    )
                })}
            </nav>

            {/* Footer */}
            <div className={`p-4 border-t border-slate-200 text-xs text-slate-500 ${!isExpanded && 'text-center'}`}>
                {isExpanded ? 'Advocatus IA v1.0' : '1.0'}
            </div>
        </div>
    )
}
