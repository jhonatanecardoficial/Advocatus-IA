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
        <div className="flex flex-col h-[calc(100vh-140px)]">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-display font-bold text-[#0F1D3A] flex items-center gap-3">
                    <Sparkles className="text-amber" size={32} />
                    Pesquisa Jurídica IA
                </h1>
                <p className="text-slate-500 mt-2">
                    Consulte legislação e jurisprudência portuguesa utilizando linguagem natural.
                </p>
            </div>

            {/* Chat Area */}
            <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto mb-6 p-4 space-y-6 bg-white border border-slate-200 shadow-sm rounded-none"
            >
                {messages.length === 0 && (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4">
                        <div className="w-16 h-16 bg-amber/10 rounded-full flex items-center justify-center mb-4">
                            <Sparkles className="text-amber" size={32} />
                        </div>
                        <h3 className="text-xl font-display font-semibold text-[#0F1D3A]">Como posso ajudar hoje?</h3>
                        <p className="text-slate-500 max-w-md mt-2">
                            Experimente perguntar sobre prazos de despejo, requisitos de contratos de trabalho ou jurisprudência recente sobre RGPD.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 w-full max-w-xl">
                            {['Prazos de despejo no NRAU', 'Requisitos de validade do testamento', 'Jurisprudência sobre despedimento coletivo', 'IVA em serviços jurídicos'].map((suggestion) => (
                                <button
                                    key={suggestion}
                                    onClick={() => { setQuery(suggestion); }}
                                    className="p-3 text-left text-sm border border-slate-200 hover:border-amber hover:bg-amber/5 transition-colors text-slate-700"
                                >
                                    "{suggestion}"
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {messages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse text-right' : 'flex-row'}`}>
                            <div className={`w-10 h-10 shrink-0 flex items-center justify-center rounded-none shadow-sm ${msg.role === 'user' ? 'bg-[#0F1D3A] text-white' : 'bg-amber text-[#0F1D3A]'}`}>
                                {msg.role === 'user' ? <User size={20} /> : <Bot size={20} />}
                            </div>
                            <div className="space-y-4">
                                <div className={`p-4 shadow-sm ${msg.role === 'user' ? 'bg-slate-100 text-[#0F1D3A]' : 'bg-white border border-slate-200 text-[#0F1D3A]'}`}>
                                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                </div>

                                {msg.results && msg.results.length > 0 && (
                                    <div className="grid grid-cols-1 gap-3">
                                        {msg.results.map((result) => (
                                            <div key={result.id} className="group p-5 border-l-4 border-amber bg-slate-50 border-r border-t border-b border-slate-200 hover:shadow-md transition-all">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex gap-2">
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-[#0F1D3A] bg-amber/30 px-2 py-0.5">{result.source}</span>
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 bg-slate-200/50 px-2 py-0.5">{result.type}</span>
                                                    </div>
                                                    <span className="text-[10px] text-slate-400 font-mono">CONFIDÊNCIA: {(result.similarity * 100).toFixed(0)}%</span>
                                                </div>
                                                <h4 className="font-display font-bold text-base text-[#0F1D3A] mb-2 group-hover:text-amber transition-colors">{result.title}</h4>
                                                <p className="text-sm text-slate-600 leading-relaxed mb-4">{result.content}</p>
                                                {result.url && (
                                                    <div className="flex justify-end border-t border-slate-200 pt-3">
                                                        <a
                                                            href={result.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-[11px] font-bold text-[#0F1D3A] flex items-center gap-2 hover:text-amber transition-colors"
                                                        >
                                                            CONSULTAR FONTE OFICIAL <ExternalLink size={12} />
                                                        </a>
                                                    </div>
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
                        <div className="flex gap-4">
                            <div className="w-10 h-10 bg-amber text-[#0F1D3A] flex items-center justify-center rounded-none animate-pulse">
                                <Sparkles size={20} />
                            </div>
                            <div className="p-4 bg-white border border-slate-200 flex items-center gap-2">
                                <div className="w-2 h-2 bg-amber rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                <div className="w-2 h-2 bg-amber rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                                <div className="w-2 h-2 bg-amber rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Input Area */}
            <div className="relative">
                <div className="absolute -top-10 left-0 right-0 flex justify-center pointer-events-none">
                    <div className="bg-amber/10 border border-amber/20 text-[10px] font-bold text-amber-800 px-3 py-1 uppercase tracking-widest flex items-center gap-2 backdrop-blur-sm pointer-events-auto">
                        <AlertCircle size={12} />
                        Esta IA pode cometer erros. Valide sempre com fontes oficiais.
                    </div>
                </div>

                <form onSubmit={handleSearch} className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Descreva a sua dúvida jurídica..."
                            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 focus:border-amber focus:ring-1 focus:ring-amber outline-none transition-all"
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!query.trim() || loading}
                        className="px-8 bg-[#0F1D3A] text-white font-bold hover:bg-[#1a2b4c] disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
                    >
                        PESQUISAR
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </div>
    )
}
