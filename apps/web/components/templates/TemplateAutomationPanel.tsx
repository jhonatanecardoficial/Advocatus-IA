"use client";

import { useState, useEffect } from 'react';
import { FileText, Sparkles, Wand2, Download, Save, RefreshCw, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface LegalTemplate {
  id: string;
  name: string;
  description?: string;
  category: string;
  content: string;
  placeholders: string[];
}

interface TemplateAutomationPanelProps {
  matterId: string;
}

export default function TemplateAutomationPanel({ matterId }: TemplateAutomationPanelProps) {
  const [templates, setTemplates] = useState<LegalTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<LegalTemplate | null>(null);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refineInstruction, setRefineInstruction] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${API_URL}/legal-templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (error) {
      toast.error('Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (templateId: string) => {
    setIsGenerating(true);
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${API_URL}/legal-templates/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ templateId, matterId }),
      });

      if (!res.ok) throw new Error('Falha ao gerar documento');

      const data = await res.json();
      setGeneratedContent(data.content);
      setSelectedTemplate(templates.find(t => t.id === templateId) || null);
      toast.success('Documento gerado com dados do processo!');
    } catch (error) {
      toast.error('Erro ao gerar documento');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!refineInstruction) return;
    setIsRefining(true);
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${API_URL}/legal-templates/refine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          content: generatedContent, 
          instruction: refineInstruction 
        }),
      });

      if (!res.ok) throw new Error('Falha ao refinar documento');

      const data = await res.json();
      setGeneratedContent(data.refinedContent);
      setRefineInstruction('');
      toast.success('IA: Documento refinado com sucesso!');
    } catch (error) {
      toast.error('Erro ao refinar documento com IA');
    } finally {
      setIsRefining(false);
    }
  };

  const handleSaveToMatter = async () => {
    if (!generatedContent || !selectedTemplate) return;
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const filename = `${selectedTemplate.name}_${new Date().toISOString().split('T')[0]}`;
      
      const res = await fetch(`${API_URL}/legal-templates/save-to-matter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          matterId, 
          content: generatedContent, 
          filename 
        }),
      });

      if (!res.ok) throw new Error('Falha ao salvar documento');

      toast.success('Documento guardado na pasta do processo!');
    } catch (error) {
      toast.error('Erro ao guardar documento');
    }
  };

  const handleDownloadPdf = async () => {
    if (!generatedContent || !selectedTemplate) return;
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const filename = `${selectedTemplate.name}_${new Date().toISOString().split('T')[0]}`;

      const res = await fetch(`${API_URL}/legal-templates/download-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          content: generatedContent, 
          filename 
        }),
      });

      if (!res.ok) throw new Error('Falha ao gerar PDF');

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${filename}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Download do PDF iniciado');
    } catch (error) {
      toast.error('Erro ao descarregar PDF');
    }
  };

  if (loading) return <div className="text-center py-10 text-slate-500">A carregar templates...</div>;

  return (
    <div className="space-y-6">
      {!generatedContent ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templates.map((template) => (
            <motion.div
              key={template.id}
              whileHover={{ scale: 1.02 }}
              onClick={() => handleGenerate(template.id)}
              className="p-6 bg-white/5 border border-white/10 rounded-2xl cursor-pointer hover:bg-white/10 hover:border-amber/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-amber/10 rounded-xl text-amber group-hover:bg-amber group-hover:text-navy transition-colors">
                  <FileText size={24} />
                </div>
                <ChevronRight size={20} className="text-slate-600 group-hover:text-amber" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">{template.name}</h3>
              <p className="text-sm text-slate-400 line-clamp-2">{template.description || 'Sem descrição.'}</p>
              <div className="mt-4 flex gap-2">
                <span className="px-3 py-1 bg-navy rounded-full text-[10px] font-black uppercase text-amber/60 border border-amber/10">
                  {template.category}
                </span>
              </div>
            </motion.div>
          ))}
          
          {templates.length === 0 && (
            <div className="col-span-2 py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
              <FileText className="mx-auto text-slate-800 mb-4" size={48} />
              <p className="text-slate-500 font-medium">Nenhum template disponível para este tenant.</p>
            </div>
          )}
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between mb-4">
            <button 
              onClick={() => {
                setGeneratedContent('');
                setSelectedTemplate(null);
              }}
              className="text-xs font-black uppercase text-slate-500 hover:text-white transition-colors"
            >
              ← Voltar aos Templates
            </button>
            <div className="flex gap-2">
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
               <div className="bg-white text-navy font-serif p-10 min-h-[600px] rounded-sm shadow-2xl whitespace-pre-wrap text-sm leading-relaxed border-t-[8px] border-amber">
                 {generatedContent}
               </div>
            </div>

            <div className="space-y-6">
               <div className="glass-panel p-6 border-amber/20 bg-amber/5">
                  <div className="flex items-center gap-2 mb-4 text-amber">
                    <Sparkles size={18} />
                    <h3 className="text-xs font-black uppercase tracking-widest">Ações Rápidas IA</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 mb-4">Instrua a IA para ajustar o tom ou conteúdo do documento.</p>
                  
                  <textarea 
                    value={refineInstruction}
                    onChange={(e) => setRefineInstruction(e.target.value)}
                    placeholder="Ex: Torna o texto mais formal, ou adiciona uma cláusula de confidencialidade..."
                    className="w-full bg-navy/50 border border-white/10 rounded-xl p-3 text-xs text-white h-24 focus:border-amber/50 outline-none resize-none mb-3"
                  />

                  <button 
                    onClick={handleRefine}
                    disabled={isRefining || !refineInstruction}
                    className="w-full py-3 rounded-xl bg-amber text-navy font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
                  >
                    {isRefining ? <RefreshCw size={14} className="animate-spin" /> : <Wand2 size={14} />}
                    Refinar com IA
                  </button>
               </div>

               <div className="glass-panel p-6">
                  <h3 className="text-xs font-black uppercase text-white tracking-widest mb-4">Exportação</h3>
                  <button 
                    onClick={handleSaveToMatter}
                    className="w-full py-3 mb-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                  >
                    <Save size={14} />
                    Guardar no Processo
                  </button>
                  <button 
                    onClick={handleDownloadPdf}
                    className="w-full py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-white/10 transition-colors"
                  >
                    <Download size={14} />
                    Download PDF
                  </button>
               </div>
            </div>
          </div>
        </motion.div>
      )}

      {isGenerating && (
        <div className="fixed inset-0 bg-navy/80 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="text-center">
                <div className="w-16 h-16 border-4 border-amber border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-amber font-black uppercase tracking-widest text-sm">A processar dados...</p>
            </div>
        </div>
      )}
    </div>
  );
}
