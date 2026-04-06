import React, { useState } from 'react'
import { AlertTriangle, Trash2, X } from 'lucide-react'
import { ButtonSecondary } from './ui/premium'

interface DeleteDocumentModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: () => Promise<void>
    filename: string
}

export function DeleteDocumentModal({ isOpen, onClose, onConfirm, filename }: DeleteDocumentModalProps) {
    const [isDeleting, setIsDeleting] = useState(false)

    if (!isOpen) return null

    const handleConfirm = async () => {
        setIsDeleting(true)
        try {
            await onConfirm()
            onClose()
        } catch (error) {
            console.error('Erro ao apagar documento:', error)
            // Opcional: mostrar erro ao user via toast se disponível no contexto superior
        } finally {
            setIsDeleting(false)
        }
    }

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div 
                className="relative w-full max-w-md overflow-hidden bg-slate-900/80 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-md animate-in zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header Deco */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500/50 via-red-600 to-red-500/50" />
                
                <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500">
                                <AlertTriangle size={24} />
                            </div>
                            <div>
                                <h2 className="text-xl font-bold text-white leading-tight">Remover Documento</h2>
                                <p className="text-sm text-slate-400 mt-1">Esta ação é irreversível</p>
                            </div>
                        </div>
                        <button 
                            onClick={onClose}
                            className="p-1 text-slate-400 hover:text-white transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="mb-8">
                        <p className="text-slate-300 leading-relaxed text-left">
                            Tem a certeza que deseja apagar permanentemente o ficheiro <span className="text-white font-semibold">"{filename}"</span>?
                        </p>
                        <p className="text-slate-400 text-xs mt-3 p-3 bg-red-500/5 border border-red-500/10 rounded-lg text-left">
                             Aviso: Isto removerá o documento original e todas as versões de histórico associadas tanto da base de dados quanto do armazenamento no Supabase Cloud.
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <ButtonSecondary 
                            onClick={onClose} 
                            disabled={isDeleting}
                            className="flex-1 py-3"
                        >
                            Cancelar
                        </ButtonSecondary>
                        <button
                            onClick={handleConfirm}
                            disabled={isDeleting}
                            className={`flex-1 py-3 px-4 rounded-xl font-bold transition-all duration-300 flex items-center justify-center gap-2 
                                ${isDeleting 
                                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                                    : 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_20px_rgba(220,38,38,0.3)] hover:shadow-[0_0_25px_rgba(220,38,38,0.4)] active:scale-[0.98]'
                                }`}
                        >
                            {isDeleting ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    A remover...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={18} />
                                    Confirmar Remoção
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
            
            {/* Overlay para fechar ao clicar fora */}
            <div className="absolute inset-0 z-[-1]" onClick={onClose} />
        </div>
    )
}
