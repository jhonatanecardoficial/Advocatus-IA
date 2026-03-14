'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Send, Sparkles, AlertCircle, ExternalLink, Bot, User } from 'lucide-react'
import { aiSearchAction } from '@/app/actions/ai'

interface SearchResult {
    id: string
    title: string
    source: string
    type: string
    content: string
    reference: string | null
    url: string | null
    similarity: number
}

interface Message {
    role: 'user' | 'assistant'
    content: string
    results?: SearchResult[]
}

export default function AiSearchPage() {
    const [query, setQuery] = useState('')
    const [loading, setLoading] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!query.trim() || loading) return

        const userQuery = query.trim()
        setQuery('')
        setMessages(prev => [...prev, { role: 'user', content: userQuery }])
        setLoading(true)

        try {
            const data = await aiSearchAction(userQuery)

            if (data.error) throw new Error(data.error)

            setMessages(prev => [...prev, {
                role: 'assistant',
                content: data.answer || (data.results && data.results.length > 0
                    ? `Encontrei ${data.results.length} referências relevantes para a sua pesquisa no Diário da República e bases de jurisprudência.`
                    : 'Não encontrei resultados específicos para essa consulta nas bases legais oficiais.'),
                results: data.results || []
            }])
        } catch (err: any) {
            setMessages(prev => [...prev, { role: 'assistant', content: err.message || 'Desculpe, ocorreu um erro ao processar a sua pesquisa IA. Por favor, tente novamente.' }])
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-700">
            {/* Header */}
            <div className="mb-8 flex justify-between items-end">
                <div>
                   <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber/10 rounded-lg border border-amber/20">
                            <Sparkles className="w-5 h-5 text-amber" />
                        </div>
                        <span className="text-[10px] text-amber font-black uppercase tracking-[0.3em]">Neuralis</span>
                    </div>
                    <h1 className="text-4xl font-display font-black text-white uppercase tracking-tighter leading-none">
                        Pesquisa Jurídica IA
                    </h1>
                    <p className="text-white/40 mt-3 font-mono text-[10px] uppercase tracking-widest">
                        Diário da República & Bases Oficiais • Jurisprudência em Tempo Real
                    </p>
                </div>
            </div>

            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto mb-6 p-6 space-y-8 glass-panel border border-white/5 backdrop-blur-2xl bg-navy/20 custom-scrollbar"
            >
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                        <div className="w-24 h-24 bg-amber/5 rounded-full flex items-center justify-center mb-8 border border-amber/10 shadow-glow animate-pulse">
                            <Bot className="text-amber" size={48} />
                        </div>
                        <h3 className="text-2xl font-display font-black text-white uppercase tracking-tight">Como posso ajudar hoje?</h3>
                        <p className="text-white/40 max-w-md mt-3 font-medium text-xs leading-relaxed uppercase tracking-widest">
                            Consulte legislação e jurisprudência portuguesa utilizando linguagem natural.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-10 w-full max-w-2xl">
                            {['Prazos de despejo no NRAU', 'Requisitos de validade do testamento', 'Jurisprudência sobre despedimento coletivo', 'IVA em serviços jurídicos'].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => { setQuery(suggestion); }}
                                    className="p-4 text-left text-[11px] font-bold uppercase tracking-widest bg-white/5 border border-white/10 hover:border-amber/40 hover:bg-amber/5 transition-all text-white/50 hover:text-amber group relative overflow-hidden"
                                >
                                    <div className="absolute left-0 top-0 w-1 h-full bg-amber/0 group-hover:bg-amber transition-all"></div>
                                    "{suggestion}"
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
                        <div className={`max-w-[85%] flex gap-6 ${msg.role === 'user' ? 'flex-row-reverse text-right' : 'flex-row'}`}>
                            <div className={`w-12 h-12 shrink-0 flex items-center justify-center border shadow-lg ${msg.role === 'user' ? 'bg-white/5 border-white/10 text-white' : 'bg-amber border-amber text-navy'}`}>
                                {msg.role === 'user' ? <User size={24} /> : <Sparkles size={24} />}
                            </div>
                            <div className="space-y-6 flex-1">
                                <div className={`p-6 shadow-premium relative ${msg.role === 'user' ? 'bg-navy/40 border border-white/5 text-white/90' : 'bg-white/5 border border-white/10 text-white'}`}>
                                    <p className="leading-relaxed whitespace-pre-wrap font-body text-sm">{msg.content}</p>
                                    {msg.role === 'assistant' && <div className="absolute -left-1.5 top-5 w-3 h-3 bg-white/5 border-l border-t border-white/10 rotate-[-45deg]"></div>}
                                </div>

                                {msg.results && msg.results.length > 0 && (
                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="flex items-center gap-3 px-2">
                                            <div className="h-[1px] flex-1 bg-white/5"></div>
                                            <span className="text-[10px] font-black text-amber uppercase tracking-[0.3em]">Fontes Encontradas</span>
                                            <div className="h-[1px] flex-1 bg-white/5"></div>
                                        </div>
                                        {msg.results.map((result) => (
                                            <div key={result.id} className="group p-6 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-amber/40 transition-all relative overflow-hidden">
                                                <div className="absolute right-0 top-0 p-4 opacity-5 group-hover:opacity-20 transition-opacity">
                                                    <ExternalLink size={60} className="text-white" />
                                                </div>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="flex gap-2">
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-amber bg-amber/10 px-2 py-1 border border-amber/10">{result.source}</span>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/40 bg-white/5 px-2 py-1 border border-white/5">{result.type}</span>
                                                    </div>
                                                    <span className="text-[10px] font-black text-white/20 font-mono tracking-tighter uppercase whitespace-nowrap">RELEVÂNCIA: {(result.similarity * 100).toFixed(0)}%</span>
                                                </div>
                                                <h4 className="font-display font-bold text-lg text-white mb-3 group-hover:text-amber transition-colors drop-shadow-sm">{result.title}</h4>
                                                <p className="text-xs text-white/50 leading-relaxed mb-6 font-body line-clamp-3">{result.content}</p>
                                                {result.url && (
                                                    <a
                                                        href={result.url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-[10px] font-black text-white border border-white/10 px-4 py-2 hover:bg-amber hover:text-navy hover:border-amber transition-all inline-flex items-center gap-2 uppercase tracking-widest"
                                                    >
                                                        CONSULTAR FONTE <ExternalLink size={12} />
                                                    </a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex justify-start">
                        <div className="flex gap-6">
                            <div className="w-12 h-12 bg-amber text-navy flex items-center justify-center animate-pulse shadow-glow">
                                <Sparkles size={24} />
                            </div>
                            <div className="p-6 bg-white/5 border border-white/10 flex items-center gap-3">
                                <div className="w-2 h-2 bg-amber rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-amber rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                                <div className="w-2 h-2 bg-amber rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                                <span className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] ml-2">Analisando Ordenamento Jurídico...</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="relative">
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 flex justify-center pointer-events-none w-full">
                    <div className="bg-amber/10 border border-amber/20 text-[9px] font-black text-amber/80 px-4 py-1.5 uppercase tracking-[0.2em] flex items-center gap-2 backdrop-blur-md pointer-events-auto rounded-full shadow-lg">
                        <AlertCircle size={12} className="text-amber" />
                        Esta IA pode cometer erros • Valide sempre com fontes oficiais
                    </div>
                </div>

                <form onSubmit={handleSearch} className="flex gap-3 bg-navy/40 border border-white/5 p-2 backdrop-blur-3xl shadow-2xl">
                    <div className="relative flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" size={20} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Descreva a sua dúvida jurídica (ex: Prazos de despejo no NRAU)..."
                            className="w-full pl-14 pr-4 py-5 bg-white/5 border border-white/5 focus:border-amber/40 focus:bg-white/10 outline-none transition-all text-white text-sm font-body"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!query.trim() || loading}
                        className="px-10 bg-amber text-navy font-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-all disabled:bg-white/10 disabled:text-white/20 disabled:cursor-not-allowed shadow-glow flex items-center gap-2 group"
                    >
                        CONSULTAR
                        <Send size={16} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                </form>
            </div>
        </div>
    )
}
