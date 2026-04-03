"use client";

import { useState, useEffect } from 'react';
import { Sparkles, X, Wand2, Lightbulb, Zap, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import dynamic from 'next/dynamic';
import { aiDraftAction, aiRefineAction, aiSaveDraftAction } from '@/app/actions/ai';

const DocumentEditor = dynamic(() => import('./DocumentEditor'), { 
  ssr: false,
  loading: () => (
    <div className="flex-1 flex flex-col items-center justify-center bg-navy/50 gap-4">
      <RefreshCw className="animate-spin text-amber" size={32} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">A carregar editor...</p>
    </div>
  )
});

interface Props {
  matterId: string;
}

export default function AiDraftButton({ matterId }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [draft, setDraft] = useState<string | null>(null);
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [selectedType, setSelectedType] = useState('Notificação Extrajudicial');
  const [draftTypes, setDraftTypes] = useState<string[]>([
    'Notificação Extrajudicial',
    'Petição Inicial (Simples)',
    'Contestação (Esboço)',
    'Requerimento de Junção',
    'Email de Atualização ao Cliente'
  ]);

  useEffect(() => {
    async function loadTemplates() {
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
        const res = await fetch(`${API_URL}/legal-templates`, { credentials: 'include' });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const names = data.map((t: any) => t.name);
            setDraftTypes(prev => [...new Set([...prev, ...names])]);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar templates:', err);
      }
    }
    loadTemplates();
  }, []);

  const handleGenerate = async () => {
    setLoading(true);
    setDraft(null);
    try {
      const data = await aiDraftAction(matterId, selectedType);
      
      if (data.error) {
        toast.error(data.error);
        return;
      }
      
      setDraft(data.draft);
      setIsEditorActive(true);
      toast.success('Rascunho gerado pela Advocatus IA!');
    } catch (err) {
      toast.error('Erro ao gerar rascunho. Verifique a configuração da IA.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (htmlContent: string) => {
    try {
      const result = await aiSaveDraftAction(matterId, selectedType, htmlContent);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }
      
      toast.success('Rascunho salvo com sucesso no processo!');
      setIsOpen(false);
      setIsEditorActive(false);
    } catch (err) {
      toast.error('Erro ao salvar o documento.');
      console.error(err);
    }
  };

  const handleRefine = async (currentContent: string, instruction: string): Promise<string> => {
    try {
      const data = await aiRefineAction(matterId, currentContent, instruction);
      
      if (data.error) {
        toast.error(data.error);
        throw new Error(data.error);
      }
      
      return data.draft;
    } catch (err) {
      toast.error('Erro ao refinar rascunho.');
      throw err;
    }
  };



  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="btn-premium flex items-center gap-2 group relative overflow-hidden animate-reveal"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        <Sparkles className="w-4 h-4 text-amber-400 group-hover:scale-125 transition-transform duration-300" />
        <span className="relative z-10">Gerar Peça IA</span>
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-md z-[100] flex items-start justify-center p-4 overflow-y-auto custom-scrollbar animate-in fade-in duration-300">
          <div className="glass-panel w-full max-w-2xl border border-white/20 shadow-premium flex flex-col my-8 animate-in zoom-in-95 duration-300 overflow-hidden relative">
            {/* Header */}
            <div className="bg-gradient-to-r from-navy via-navy/90 to-navy/80 p-5 flex justify-between items-center shrink-0 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-amber-400/10 rounded-lg border border-amber-400/20">
                  <Wand2 className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-white text-sm font-bold uppercase tracking-widest">Advocatus IA</h3>
                  <p className="text-[10px] text-white/50 font-medium">Assistente de Escrita Jurídica</p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)} 
                className="p-2 hover:bg-white/10 rounded-full transition-colors group"
              >
                <X className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
              </button>
            </div>
            <div className="p-8 overflow-y-auto custom-scrollbar flex-1 relative">
              {!draft && (
                <div className="space-y-8 pb-4">
                  <div className="animate-reveal stagger-1">
                    <label className="text-[11px] text-slate-400 uppercase font-bold mb-4 block flex items-center gap-2">
                      <Zap className="w-3 h-3 text-amber-400 shadow-glow" />
                      Tipo de Documento
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {draftTypes.map((type, idx) => (
                        <button
                          key={type}
                          onClick={() => setSelectedType(type)}
                          className={`p-4 text-left text-xs rounded-xl border transition-all duration-300 animate-reveal stagger-${(idx % 3) + 1} ${
                            selectedType === type 
                              ? 'border-amber bg-amber/30 shadow-glow ring-2 ring-amber/30 scale-[1.02]' 
                              : 'border-white/10 bg-white/5 hover:border-amber/40 hover:bg-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={selectedType === type ? 'font-black text-white' : 'text-white/60'}>
                              {type}
                            </span>
                            {selectedType === type && (
                              <div className="w-2 h-2 rounded-full bg-amber animate-pulse shadow-glow" />
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
 
                  <div className="bg-amber-400/5 border border-amber-400/10 rounded-2xl p-5 flex gap-4 animate-reveal stagger-2 backdrop-blur-sm">
                    <div className="p-3 bg-amber-400/10 rounded-xl shadow-sm h-fit">
                      <Lightbulb className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-amber-100 mb-1 leading-none">Inteligência Estrutural</p>
                      <p className="text-[11px] text-white/50 leading-relaxed font-medium">
                        Nossa IA analisa o <span className="text-amber-400 font-bold">contexto fático</span>, as partes envolvidas e a jurisdição para redigir uma peça coerente e fundamentada.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Editor Integration */}
            {isEditorActive && draft && (
              <div className="absolute inset-0 z-50 bg-navy">
                <DocumentEditor
                  title={selectedType}
                  initialContent={draft}
                  onClose={() => setIsEditorActive(false)}
                  onSave={handleSave}
                  onRefine={handleRefine}
                />
              </div>
            )}

            {/* Fixed Footer Actions */}
            <div className="p-6 border-t border-white/10 bg-navy/50 backdrop-blur-xl shrink-0">
              {!draft ? (
                <button
                  onClick={handleGenerate}
                  disabled={loading}
                  className="w-full py-5 bg-amber text-navy text-xs font-black uppercase tracking-widest rounded-2xl hover:scale-[1.01] active:scale-[0.99] shadow-glow transition-all disabled:opacity-50 flex items-center justify-center gap-3 relative overflow-hidden group"
                >
                  {loading && (
                    <div className="absolute inset-0 bg-navy/20 backdrop-blur-sm flex items-center justify-center z-20">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-navy rounded-full animate-bounce [animation-delay:-0.3s]" />
                        <div className="w-2 h-2 bg-navy rounded-full animate-bounce [animation-delay:-0.15s]" />
                        <div className="w-2 h-2 bg-navy rounded-full animate-bounce" />
                      </div>
                    </div>
                  )}
                  <Sparkles className={`w-4 h-4 text-navy ${loading ? 'opacity-0' : 'group-hover:rotate-12 transition-transform'}`} />
                  <span className={loading ? 'opacity-0' : ''}>Iniciar Geração Inteligente</span>
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={() => setDraft(null)}
                    className="flex-1 py-4 text-[11px] font-bold uppercase tracking-widest text-white/70 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all"
                  >
                    Refazer
                  </button>
                  <button
                    onClick={() => setIsOpen(false)}
                    className="flex-1 py-4 text-[11px] font-bold uppercase tracking-widest bg-amber text-navy rounded-2xl hover:shadow-glow transition-all active:scale-[0.98]"
                  >
                    Finalizar
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
