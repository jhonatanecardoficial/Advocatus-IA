'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, X, Phone, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface QesSignatureModalProps {
    isOpen: boolean
    onClose: () => void
    documentId: string
    filename: string
    onSuccess?: () => void
}

export default function QesSignatureModal({ isOpen, onClose, documentId, filename, onSuccess }: QesSignatureModalProps) {
    const [step, setStep] = useState<'input' | 'processing' | 'success' | 'error'>('input')
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)

    const handleRequestSignature = async () => {
        if (!phone || phone.length < 9) {
            toast.error('Por favor, insira um número de telemóvel válido.')
            return
        }

        setLoading(true)
        setStep('processing')

        try {
            const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'
            const token = localStorage.getItem('access_token')

            const response = await fetch(`${API_URL}/qes/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ documentId })
            })

            if (!response.ok) throw new Error('Falha ao solicitar assinatura')

            const data = await response.json()
            
            if (data.success) {
                setStep('success')
                toast.success('Pedido de assinatura enviado!')
                setTimeout(() => {
                    onSuccess?.()
                    onClose()
                }, 3000)
            } else {
                setStep('error')
            }
        } catch (_err) {
            setStep('error')
            toast.error('Erro ao processar assinatura via CMD.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-navy/60 backdrop-blur-md">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="glass-panel w-full max-w-md overflow-hidden bg-navy/90 border border-white/20 shadow-2xl relative"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/5">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-amber rounded-lg">
                                    <ShieldCheck size={20} className="text-navy" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-black uppercase tracking-widest text-white">Assinatura QES (CMD)</h2>
                                    <p className="text-[10px] text-white/40 font-mono">{filename}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {step === 'input' && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-amber">Nº Telemóvel (CMD)</label>
                                        <div className="relative group">
                                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/30 group-focus-within:text-amber transition-colors" size={18} />
                                            <input 
                                                type="tel"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                placeholder="912 345 678"
                                                className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-amber/50 focus:ring-1 focus:ring-amber/20 transition-all font-mono"
                                            />
                                        </div>
                                        <p className="text-[10px] text-white/40 leading-relaxed mt-2 italic">
                                            * Irá receber uma notificação na aplicação Autenticação.gov ou SMS para confirmar a assinatura com o seu PIN.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleRequestSignature}
                                        disabled={loading}
                                        className="w-full bg-amber text-navy py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-amber/20 hover:bg-white hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : 'Solicitar Assinatura'}
                                    </button>
                                </div>
                            )}

                            {step === 'processing' && (
                                <div className="py-12 flex flex-col items-center text-center space-y-4">
                                    <div className="w-16 h-16 border-4 border-amber/20 border-t-amber rounded-full animate-spin" />
                                    <h3 className="text-white font-bold uppercase tracking-widest text-xs">Comunicando com AMA...</h3>
                                    <p className="text-[10px] text-white/40 max-w-[200px]">Aguarde enquanto geramos o pedido de assinatura qualificada.</p>
                                </div>
                            )}

                            {step === 'success' && (
                                <div className="py-12 flex flex-col items-center text-center space-y-4">
                                    <motion.div 
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center shadow-lg shadow-green-500/20"
                                    >
                                        <CheckCircle2 size={32} className="text-white" />
                                    </motion.div>
                                    <h3 className="text-white font-bold uppercase tracking-widest text-xs">Pedido Enviado!</h3>
                                    <p className="text-[10px] text-white/40 max-w-[200px]">Confirme agora no seu dispositivo móvel para concluir o processo.</p>
                                </div>
                            )}

                            {step === 'error' && (
                                <div className="py-12 flex flex-col items-center text-center space-y-4">
                                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                                        <AlertCircle size={32} className="text-red-500" />
                                    </div>
                                    <h3 className="text-white font-bold uppercase tracking-widest text-xs">Erro na Solicitação</h3>
                                    <p className="text-[10px] text-white/40 max-w-[200px]">Não foi possível comunicar com o serviço Autenticação.gov.</p>
                                    <button 
                                        onClick={() => setStep('input')}
                                        className="text-[10px] font-black uppercase text-amber hover:underline"
                                    >
                                        Tentar Novamente
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Footer decorative bar */}
                        <div className="h-1 w-full bg-gradient-to-r from-transparent via-amber/30 to-transparent" />
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
