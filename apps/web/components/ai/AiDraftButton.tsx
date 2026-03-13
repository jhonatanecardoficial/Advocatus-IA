"use client";

import { useState } from 'react';
import { Sparkles, X, Copy, Check, Wand2 } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  matterId: string;
}

export default function AiDraftButton({ matterId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [selectedType, setSelectedType] = useState('Notificação Extrajudicial');

  const draftTypes = [
    'Notificação Extrajudicial',
    'Petição Inicial (Simples)',
    'Contestação (Esboço)',
    'Requerimento de Junção',
    'Email de Atualização ao Cliente'
  ];

  const handleGenerate = async () => {
    setLoading(true);
    setDraft(null);
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      
      const res = await fetch(`${API_URL}/ai/draft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ matterId, type: selectedType }),
      });

      if (!res.ok) throw new Error('Falha ao gerar rascunho');
      
      const data = await res.json();
      setDraft(data.draft);
      toast.success('Rascunho gerado pela Advocatus IA!');
    } catch (err) {
      toast.error('Erro ao gerar rascunho. Verifique a configuração da IA.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (draft) {
      navigator.clipboard.writeText(draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copiado para o clipboard.');
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-navy to-navy/80 text-white text-[10px] font-bold uppercase tracking-wider hover:shadow-lg transition-all border border-navy/20"
      >
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        Gerar Peça IA
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-navy/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl border border-slate-200 shadow-2xl flex flex-col max-h-[90vh]">
            <div className="bg-navy p-4 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <Wand2 className="w-4 h-4 text-amber-400" />
                <h3 className="text-white text-xs font-bold uppercase tracking-widest">Assistente de Escrita IA</h3>
              </div>
              <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto">
              {!draft ? (
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] text-slate-500 uppercase font-black mb-3 block">Selecionar tipo de peça</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {draftTypes.map(type => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`p-3 text-left text-xs border transition-all ${
                            selectedType === type 
                              ? 'border-navy bg-navy/5 font-bold text-navy' 
                              : 'border-slate-200 text-slate-600 hover:border-navy/30'
                          }`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-amber-50 border-l-2 border-amber-500 p-4 flex gap-4">
                    <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-900 mb-1">Inteligência de Contexto</p>
                      <p className="text-[10px] text-amber-800 leading-relaxed">
                        A IA irá analisar automaticamente as partes, o tribunal e o histórico de factos deste processo para gerar um rascunho personalizado.
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleGenerate}
                    disabled={loading}
                    className="w-full py-4 bg-navy text-white text-xs font-bold uppercase tracking-widest hover:bg-navy/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        A Redigir...
                      </>
                    ) : (
                      <>Gerar Rascunho AGORA</>
                    )}
                  </button>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-slate-500 uppercase font-black">Rascunho Gerado ({selectedType})</span>
                    <button
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-[10px] font-bold text-navy hover:text-amber-600 transition-colors uppercase"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copiado' : 'Copiar Texto'}
                    </button>
                  </div>
                  
                  <div className="p-6 bg-slate-50 border border-slate-200 font-serif text-sm text-slate-800 leading-relaxed whitespace-pre-wrap select-text max-h-[50vh] overflow-y-auto">
                    {draft}
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={() => setDraft(null)}
                      className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                      Refazer
                    </button>
                    <button
                      onClick={() => setIsOpen(false)}
                      className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest bg-navy text-white hover:bg-navy/90 transition-all"
                    >
                      Concluir
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
