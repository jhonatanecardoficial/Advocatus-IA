'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, FileText, Users, Calendar, Settings, ChevronLeft, ChevronRight, LogOut, Search, Wallet } from 'lucide-react'
import { useLogout } from '@/context/logout-context'
import { motion, AnimatePresence } from 'framer-motion'

export function Sidebar() {
    const [isExpanded, setIsExpanded] = useState(true)
    const [isMounted, setIsMounted] = useState(false)
    const pathname = usePathname()
    const { openLogoutModal } = useLogout()

    useEffect(() => {
        setIsMounted(true)
    }, [])

    const navItems = [
        { icon: LayoutDashboard, label: 'Painel Central', href: '/dashboard' },
        { icon: FileText, label: 'Processos', href: '/matters' },
        { icon: Users, label: 'Cadastro de Clientes', href: '/clients' },
        { icon: Wallet, label: 'Faturação', href: '/billing' },
        { icon: Search, label: 'Pesquisa Jurídica IA', href: '/ai-search' },
        { icon: Calendar, label: 'Prazos & Agenda', href: '/tasks' },
        { icon: Settings, label: 'Definições do Escritório', href: '/settings' },
    ]

    const isDashboard = pathname === '/dashboard'
    const handleLogoClick = (e: React.MouseEvent) => {
        if (isDashboard) {
            e.preventDefault()
            window.scrollTo({ top: 0, behavior: 'smooth' })
        }
    }

    if (!isMounted) return null

    return (
        <motion.div 
            animate={{ width: isExpanded ? 256 : 80 }}
            className="glass-panel border-r border-white/5 flex flex-col font-body h-full sticky top-0 left-0 z-50 bg-navy/20 backdrop-blur-xl shrink-0"
        >
            {/* Header Area */}
            <div className="h-20 flex items-center justify-between px-4 border-b border-white/5 overflow-hidden">
                <Link
                    href="/dashboard"
                    onClick={handleLogoClick}
                    className="flex-1 flex items-center h-full group transition-all"
                    suppressHydrationWarning
                >
                    <AnimatePresence mode="wait">
                        {isExpanded ? (
                            <motion.div 
                                key="expanded"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex items-center gap-3 overflow-hidden"
                            >
                                <div className="w-10 h-10 bg-amber flex items-center justify-center text-navy font-display font-bold rounded-lg shadow-lg group-hover:rotate-6 transition-transform">A</div>
                                <span className="font-display font-bold tracking-tight text-gradient whitespace-nowrap text-lg">Advocatus IA</span>
                            </motion.div>
                        ) : (
                            <motion.div 
                                key="collapsed"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="w-10 h-10 bg-amber mx-auto flex items-center justify-center text-navy font-display font-bold rounded-lg shadow-lg"
                            >
                                A
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Link>
            </div>

            {/* Toggle Button */}
            <motion.button
                onClick={() => setIsExpanded(!isExpanded)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -right-3 top-24 bg-amber hover:bg-white text-navy w-6 h-6 rounded-full flex items-center justify-center shadow-lg transition-all z-50"
            >
                {isExpanded ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </motion.button>

            <nav className="flex-1 py-8 space-y-2 overflow-y-auto px-3 custom-scrollbar">
                {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    const isAiSearch = item.href === '/ai-search'

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex items-center ${isExpanded ? 'px-4' : 'justify-center'} py-3 transition-all rounded-xl relative group ${
                                isMounted && isActive 
                                ? 'bg-amber text-navy shadow-lg shadow-amber/20' 
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }`}
                            title={!isExpanded ? item.label : ''}
                            suppressHydrationWarning
                        >
                            <motion.div
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            >
                                <Icon size={isExpanded ? 18 : 22} className={`flex-shrink-0 ${isActive ? 'text-navy' : isAiSearch ? 'text-amber' : ''}`} />
                            </motion.div>

                            {isExpanded && (
                                <motion.span 
                                    initial={{ opacity: 0, x: -5 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="ml-4 font-semibold text-xs whitespace-nowrap"
                                >
                                    {item.label}
                                </motion.span>
                            )}
                            
                            {isActive && isExpanded && (
                                <motion.div 
                                    layoutId="active-indicator"
                                    className="absolute right-2 w-1.5 h-1.5 bg-navy rounded-full"
                                />
                            )}
                        </Link>
                    )
                })}
            </nav>

            {/* User Area Footer with fixed visibility */}
            <div className="p-4 border-t border-white/10 bg-black/20 backdrop-blur-md">
                <button
                    onClick={openLogoutModal}
                    className={`w-full flex items-center ${isExpanded ? 'px-4' : 'justify-center'} py-3 text-white hover:text-red-400 hover:bg-red-500/10 transition-all rounded-xl group border border-white/10 hover:border-red-500/40 shadow-lg`}
                >
                    <LogOut size={18} className="flex-shrink-0 group-hover:-translate-x-1 transition-transform text-red-500" />
                    {isExpanded && <span className="ml-4 font-black text-xs uppercase tracking-widest text-white brightness-125">Sair do Sistema</span>}
                </button>
                {isExpanded && (
                    <div className="mt-4 px-4 text-[10px] text-slate-400 font-mono tracking-widest opacity-60 uppercase flex items-center gap-2">
                        <div className="w-1 h-1 bg-amber rounded-full animate-pulse" />
                        v1.2.0 PREMIUM
                    </div>
                )}
            </div>
        </motion.div>
    )
}

