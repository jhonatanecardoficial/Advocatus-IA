"use client";

import { useState, useEffect } from 'react';
import { FileText, Sparkles, Wand2, Download, Save, RefreshCw, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

function getCookie(name: string): string | undefined {
    if (typeof document === 'undefined') return undefined;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
}

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
    const token = getCookie('accessToken');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${API_URL}/legal-templates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setTemplates(data);
      }
    } catch (_) {
      toast.error('Erro ao carregar templates');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (templateId: string) => {
    setIsGenerating(true);
    const token = getCookie('accessToken');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${API_URL}/legal-templates/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ templateId, matterId })
      });
      const data = await res.json();
      setGeneratedContent(data.content);
      setSelectedTemplate(templates.find(t => t.id === templateId) || null);
      toast.success('Documento gerado com dados do processo!');
    } catch (_) {
      toast.error('Erro ao gerar documento');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleRefine = async () => {
    if (!refineInstruction || !generatedContent) return;
    setIsRefining(true);
    const token = getCookie('accessToken');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${API_URL}/legal-templates/refine`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ content: generatedContent, instruction: refineInstruction })
      });
      const data = await res.json();
      setGeneratedContent(data.refinedContent);
      setRefineInstruction('');
      toast.success('IA: Documento refinado com sucesso!');
    } catch (_) {
      toast.error('Erro ao refinar documento com IA');
    } finally {
      setIsRefining(false);
    }
  };

  const handleSaveToMatter = async () => {
    const token = getCookie('accessToken');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${API_URL}/legal-templates/save-to-matter`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          matterId, 
          content: generatedContent,
          filename: `${selectedTemplate?.name || 'documento'}_gerado`
        })
      });

      if (!res.ok) throw new Error('Falha ao salvar documento');

      toast.success('Documento guardado na pasta do processo!');
    } catch (_) {
      toast.error('Erro ao guardar documento');
    }
  };

  const handleDownloadPdf = async () => {
    const token = getCookie('accessToken');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${API_URL}/legal-templates/download-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          content: generatedContent,
          filename: `${selectedTemplate?.name || 'documento'}_gerado`
        })
      });

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedTemplate?.name || 'documento'}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success('Download do PDF iniciado');
    } catch (_) {
      toast.error('Erro ao descarregar PDF');
    }
  };

  if (loading) return (
    <div className="p-12 flex flex-col items-center justify-center gap-4 text-white/40">
      <RefreshCw size={32} className="animate-spin" />
      <span className="text-[10px] font-black uppercase tracking-widest">Carregando Templates...</span>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-6">
      {/* List Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber/20 rounded-lg">
              <FileText size={18} className="text-amber" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Modelos Disponíveis</h3>
          </div>
          <span className="text-[10px] bg-white/5 px-3 py-1 rounded-full text-white/40 font-mono tracking-tighter">
            {templates.length} TEMPLATES
          </span>
        </div>

        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
          {templates.map((template) => (
            <div 
              key={template.id}
              onClick={() => handleGenerate(template.id)}
              className={`p-5 rounded-2xl border transition-all cursor-pointer group ${
                selectedTemplate?.id === template.id 
                ? 'bg-amber border-amber shadow-glow-amber' 
                : 'bg-white/5 border-white/10 hover:border-white/30 hover:bg-white/10'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`p-2 rounded-lg ${selectedTemplate?.id === template.id ? 'bg-navy/20' : 'bg-white/5'}`}>
                    <FileText size={20} className={selectedTemplate?.id === template.id ? 'text-navy' : 'text-slate-400'} />
                  </div>
                  <div>
                    <h4 className={`text-xs font-black uppercase tracking-tight ${
                      selectedTemplate?.id === template.id ? 'text-navy' : 'text-white'
                    }`}>
                      {template.name}
                    </h4>
                    <p className={`text-[10px] mt-0.5 line-clamp-1 ${
                      selectedTemplate?.id === template.id ? 'text-navy/60' : 'text-slate-500'
                    }`}>
                      {template.description || template.category}
                    </p>
                  </div>
                </div>
                <ChevronRight size={18} className={selectedTemplate?.id === template.id ? 'text-navy' : 'text-slate-600'} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Preview Section */}
      <div className="min-h-[500px]">
        {selectedTemplate ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="h-full flex flex-col glass-panel overflow-hidden border-white/10"
          >
            <div className="p-5 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <Sparkles size={16} className="text-amber" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Documento Gerado</span>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handleDownloadPdf}
                  className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-[10px] text-white uppercase font-bold tracking-widest transition-all"
                >
                  <Download size={14} /> PDF
                </button>
                <button 
                  onClick={handleSaveToMatter}
                  className="flex items-center gap-2 px-4 py-2 bg-amber hover:bg-white rounded-lg text-[10px] text-navy uppercase font-black tracking-widest transition-all"
                >
                  <Save size={14} /> Guardar
                </button>
              </div>
            </div>

            <div className="flex-1 p-8 bg-black/20 overflow-y-auto custom-scrollbar">
              {isGenerating ? (
                <div className="h-full flex flex-col items-center justify-center gap-6 opacity-40">
                  <RefreshCw size={40} className="text-amber animate-spin" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-amber text-center">IA: Extraindo dados do processo...</p>
                </div>
              ) : (
                <div className="prose prose-invert prose-sm max-w-none text-slate-300 font-serif leading-relaxed line-clamp-none whitespace-pre-wrap">
                  {generatedContent}
                </div>
              )}
            </div>

            <div className="p-6 bg-navy/40 border-t border-white/5">
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-amber/30 to-blue-500/30 rounded-2xl blur opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <div className="relative flex gap-3">
                  <input 
                    type="text"
                    value={refineInstruction}
                    onChange={(e) => setRefineInstruction(e.target.value)}
                    placeholder="Instruções para refinamento (ex: Tornar o tom mais formal, adicionar cláusula de mora...)"
                    className="flex-1 bg-black/40 border border-white/10 rounded-xl px-5 py-4 text-xs text-white placeholder:text-white/20 focus:outline-none focus:border-amber/50 transition-all font-mono"
                  />
                  <button 
                    onClick={handleRefine}
                    disabled={isRefining || !refineInstruction}
                    className="aspect-square w-14 flex items-center justify-center bg-white/5 hover:bg-amber hover:text-navy rounded-xl text-amber border border-white/10 transition-all disabled:opacity-20 flex-shrink-0"
                  >
                    {isRefining ? <RefreshCw className="animate-spin" size={20} /> : <Wand2 size={24} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center glass-panel border-dashed border-white/10 p-12 text-center select-none">
            <div className="p-6 bg-white/5 rounded-full mb-6">
              <FileText size={48} className="text-white/10" />
            </div>
            <h4 className="text-sm font-black text-white/20 uppercase tracking-[0.2em] mb-2">Editor de Peças IA</h4>
            <p className="text-xs text-white/10 max-w-xs leading-relaxed italic">
              Selecione um template à esquerda para iniciar a geração automática de documentos baseada nos dados do processo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
