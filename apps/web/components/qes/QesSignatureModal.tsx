'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShieldCheck, X, Phone, CheckCircle2, AlertCircle, Loader2, CreditCard, Smartphone, ExternalLink } from 'lucide-react'
import { toast } from 'sonner'

interface QesSignatureModalProps {
    isOpen: boolean
    onClose: () => void
    documentId: string
    filename: string
    onSuccess?: () => void
}

type QesMethod = 'CMD' | 'CC'
type Step = 'choice' | 'cmd_input' | 'cc_waiting' | 'processing' | 'success' | 'error'

export default function QesSignatureModal({ isOpen, onClose, documentId, filename, onSuccess }: QesSignatureModalProps) {
    const [step, setStep] = useState<Step>('choice')
    const [_, setMethod] = useState<QesMethod | null>(null)
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState('')

    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'

    const handleChoice = (m: QesMethod) => {
        setMethod(m)
        if (m === 'CMD') setStep('cmd_input')
        else startCcFlow()
    }

    const startCcFlow = async () => {
        setStep('processing')
        setLoading(true)
        try {
            const token = localStorage.getItem('accessToken')

            // 1. Obter Hash do documento no Servidor
            const hashRes = await fetch(`${API_URL}/qes/cc/hash`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ documentId })
            })

            if (!hashRes.ok) throw new Error('Falha ao gerar hash do documento.')
            const { hash } = await hashRes.json()

            // 2. Chamar Middleware Local do Cartão de Cidadão (Porta 13894)
            // Nota: Forçamos o protocolo HTTP para o middleware local
            setStep('cc_waiting')
            
            // Simulação de chamada ao middleware local (em ambiente real o browser faria o POST)
            // Aqui fazemos uma simulação UX, mas preparamos o código real
            const middlewareRes = await fetch('http://localhost:13894/signer/sign', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    hash: hash,
                    type: 'SHA256'
                })
            }).catch(() => {
                throw new Error('Certifique-se que o Middleware do Cartão de Cidadão está em execução.')
            })

            if (!middlewareRes.ok) throw new Error('O Cartão de Cidadão foi removido ou o PIN está incorreto.')
            const { signature } = await middlewareRes.json()

            // 3. Finalizar no Servidor
            const finalizeRes = await fetch(`${API_URL}/qes/cc/finalize`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ documentId, signature })
            })

            if (!finalizeRes.ok) throw new Error('Erro ao guardar documento assinado.')
            
            setStep('success')
            onSuccess?.()
        } catch (err: any) {
            setErrorMsg(err.message)
            setStep('error')
        } finally {
            setLoading(false)
        }
    }

    const handleCmdRequest = async () => {
        setLoading(true)
        setStep('processing')

        try {
            const token = localStorage.getItem('accessToken')

            // Obter URL de autenticação
            const urlRes = await fetch(`${API_URL}/qes/auth-url?documentId=${documentId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            const { url } = await urlRes.json()

            // Abrir em popup para autenticação CMD
            window.open(url, 'CMD Auth', 'width=600,height=700')

            // Simular espera de confirmação (em Real, teríamos um websocket ou polling)
            setTimeout(async () => {
                const reqRes = await fetch(`${API_URL}/qes/request`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ documentId })
                })
                
                if (reqRes.ok) {
                    setStep('success')
                    onSuccess?.()
                } else {
                    setStep('error')
                }
            }, 2000)

        } catch (err) {
            setStep('error')
            toast.error('Erro ao iniciar processo CMD.')
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
                                    <h2 className="text-sm font-black uppercase tracking-widest text-white">Assinatura Qualificada</h2>
                                    <p className="text-[10px] text-white/40 font-mono italic">{filename}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors text-white/60">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-8">
                            {step === 'choice' && (
                                <div className="space-y-4">
                                    <p className="text-[10px] text-white/60 uppercase font-black tracking-widest text-center mb-6">Escolha o seu método de assinatura</p>
                                    
                                    <button 
                                        onClick={() => handleChoice('CMD')}
                                        className="w-full flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-amber/50 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform">
                                            <Smartphone size={24} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-white uppercase tracking-tight">Chave Móvel Digital</p>
                                            <p className="text-[10px] text-white/40">Assine via App Autenticação.gov ou código SMS.</p>
                                        </div>
                                    </button>

                                    <button 
                                        onClick={() => handleChoice('CC')}
                                        className="w-full flex items-center gap-4 p-5 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-amber/50 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-amber/20 rounded-xl flex items-center justify-center text-amber group-hover:scale-110 transition-transform">
                                            <CreditCard size={24} />
                                        </div>
                                        <div className="text-left">
                                            <p className="text-xs font-bold text-white uppercase tracking-tight">Cartão de Cidadão</p>
                                            <p className="text-[10px] text-white/40">Utilize o seu leitor de cartões e o PIN de assinatura.</p>
                                        </div>
                                    </button>

                                    <div className="pt-4 flex items-center gap-3 justify-center">
                                        <ShieldCheck size={14} className="text-green-400" />
                                        <span className="text-[8px] text-white/30 uppercase tracking-[0.2em]">Norma eIDAS - Validade Jurídica Plena</span>
                                    </div>
                                </div>
                            )}

                            {step === 'cmd_input' && (
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-amber">Autenticação CMD</label>
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
                                            * Será redirecionado para o portal de justiça para autorizar o acesso.
                                        </p>
                                    </div>

                                    <button
                                        onClick={handleCmdRequest}
                                        disabled={loading}
                                        className="w-full bg-amber text-navy py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-amber/20 hover:bg-white transition-all flex items-center justify-center gap-2"
                                    >
                                        {loading ? <Loader2 className="animate-spin" size={18} /> : (
                                            <>
                                                Continuar <ExternalLink size={14} />
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}

                            {step === 'cc_waiting' && (
                                <div className="py-8 flex flex-col items-center text-center space-y-6">
                                    <div className="relative">
                                        <div className="w-20 h-20 border-4 border-amber/10 border-t-amber rounded-full animate-spin" />
                                        <CreditCard className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-amber animate-pulse" size={28} />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold uppercase tracking-widest text-xs mb-2">Comunicação Middleware</h3>
                                        <p className="text-[10px] text-white/40 max-w-[240px]">
                                            Por favor, insira o seu Cartão de Cidadão no leitor e digite o seu <strong className="text-white">PIN de Assinatura</strong> na janela do sistema.
                                        </p>
                                    </div>
                                    <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-full">
                                        <p className="text-[9px] text-white/40 flex items-center gap-2">
                                            <Loader2 size={12} className="animate-spin" /> Aguardando resposta do hardware...
                                        </p>
                                    </div>
                                </div>
                            )}

                            {step === 'processing' && (
                                <div className="py-12 flex flex-col items-center text-center space-y-4">
                                    <div className="w-16 h-16 border-4 border-amber/20 border-t-amber rounded-full animate-spin" />
                                    <h3 className="text-white font-bold uppercase tracking-widest text-xs">A processar assinatura...</h3>
                                    <p className="text-[10px] text-white/40 max-w-[200px]">Isto pode demorar alguns segundos.</p>
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
                                    <h3 className="text-white font-bold uppercase tracking-widest text-xs">Documento Assinado!</h3>
                                    <p className="text-[10px] text-white/40 max-w-[200px]">A assinatura foi verificada e gravada com sucesso.</p>
                                    <button 
                                        onClick={onClose}
                                        className="mt-4 text-[10px] bg-white/10 hover:bg-white/20 text-white px-6 py-2 rounded-full transition-all uppercase font-black"
                                    >
                                        Fechar
                                    </button>
                                </div>
                            )}

                            {step === 'error' && (
                                <div className="py-12 flex flex-col items-center text-center space-y-4">
                                    <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
                                        <AlertCircle size={32} className="text-red-500" />
                                    </div>
                                    <h3 className="text-white font-bold uppercase tracking-widest text-xs">Erro na Assinatura</h3>
                                    <p className="text-[10px] text-red-300 font-medium px-4">{errorMsg || 'Não foi possível completar o processo.'}</p>
                                    <button 
                                        onClick={() => setStep('choice')}
                                        className="text-[10px] font-black uppercase text-amber hover:underline pt-4"
                                    >
                                        Voltar ao início
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
