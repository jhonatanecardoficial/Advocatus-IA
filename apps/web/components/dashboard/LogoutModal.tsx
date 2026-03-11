'use client'

import { useLogout } from '@/context/logout-context'
import { LogOut, X, Loader2 } from 'lucide-react'
import { useEffect } from 'react'

export function LogoutModal() {
    const { isOpen, closeLogoutModal, confirmLogout, isLoading } = useLogout()

    // Fechar ao pressionar ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') closeLogoutModal()
        }
        if (isOpen) window.addEventListener('keydown', handleEsc)
        return () => window.removeEventListener('keydown', handleEsc)
    }, [isOpen, closeLogoutModal])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Overlay */}
            <div
                className="absolute inset-0 bg-navy-950/80 backdrop-blur-sm cursor-alias"
                onClick={closeLogoutModal}
            />

            {/* Modal Content */}
            <div className={`relative w-full max-w-md bg-white border-2 border-navy shadow-2xl animate-in zoom-in-95 duration-200 
                ${isLoading ? 'pointer-events-none' : ''}`}>
                
                {/* Accent Top Bar */}
                <div className="h-1 bg-amber w-full" />

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-100 text-amber-600 flex items-center justify-center rounded-none border border-amber-200">
                            <LogOut size={20} />
                        </div>
                        <h3 className="font-display text-xl font-bold text-navy uppercase tracking-tight">
                            Confirmar Saída
                        </h3>
                    </div>
                    <button
                        onClick={closeLogoutModal}
                        className="p-1 text-slate-400 hover:text-navy transition-colors"
                        aria-label="Voltar"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    <p className="text-slate-600 font-body leading-relaxed">
                        Tem a certeza que deseja terminar a sessão de trabalho atual? Qualquer processo não guardado poderá ser perdido.
                    </p>
                </div>

                {/* Footer */}
                <div className="flex bg-slate-50 p-6 gap-4">
                    <button
                        onClick={closeLogoutModal}
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 text-sm font-bold text-slate-600 hover:text-navy hover:bg-slate-100 transition-all uppercase tracking-wider border border-slate-200 rounded-none disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={confirmLogout}
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 bg-navy text-white hover:bg-amber-600 hover:text-white transition-all font-bold text-sm uppercase tracking-wider rounded-none shadow-sm flex items-center justify-center gap-2 relative group disabled:opacity-80"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="animate-spin" size={18} />
                                <span>A encerrar...</span>
                            </>
                        ) : (
                            <>
                                <span className="group-hover:-translate-x-1 transition-transform">Sim, Sair</span>
                                <LogOut size={16} className="group-hover:translate-x-1 transition-transform" />
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}
