'use client';

import React, { useState } from 'react';
import { 
  Search, 
  BookOpen, 
  Gavel, 
  FileText, 
  ExternalLink, 
  Plus, 
  Info,
  ChevronRight,
  Sparkles,
  Database
} from 'lucide-react';
import { aiSearchAction } from '@/app/actions/ai';
import { 
  Card, 
  ButtonPrimary, 
  Badge, 
  SkeletonLoader, 
  EmptyState 
} from '../ui/premium';

interface LegalResult {
  id: string;
  title: string;
  source: string;
  type?: string;
  content: string;
  reference?: string;
  url?: string;
  similarity?: number;
}

export function LegalIntelligenceDashboard() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<LegalResult[]>([]);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('global');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;

    setLoading(true);
    setAiAnswer(null);
    try {
      const data = await aiSearchAction(query);
      
      if (data.error) {
        console.error('Erro retornado pela API:', data.error);
        // Fallback silently or show a toast if available
        return;
      }
      
      setResults(data.results || []);
      setAiAnswer(data.answer || null);
    } catch (error) {
      console.error('Falha na busca inteligente:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredResults = results.filter(r => {
    if (activeTab === 'global') return true;
    if (activeTab === 'legislation') return r.source === 'DRE' || r.source === 'DIARIO_REPUBLICA' || r.type === 'LEI';
    if (activeTab === 'caselaw') return r.source === 'STJ' || r.source === 'DGSI' || r.source === 'TRL' || r.type === 'JURISPRUDENCIA';
    if (activeTab === 'tax') return r.title.toLowerCase().includes('fisco') || r.title.toLowerCase().includes('e-fatura');
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-white">Inteligência Jurídica</h1>
          <p className="text-slate-100 font-medium">Pesquisa em tempo real no Diário da República, DGSI, STJ e bases jurídicas.</p>
        </div>
      </div>

      <Card className="p-1">
        <form onSubmit={handleSearch} className="flex items-center gap-2 p-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="Pesquise por legislação, jurisprudência ou conceitos jurídicos..." 
              className="w-full bg-slate-50 border-none rounded-lg pl-10 pr-4 py-3 focus:ring-2 focus:ring-navy-100 transition-all outline-none text-slate-900"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <ButtonPrimary type="submit" disabled={loading} className="px-8 whitespace-nowrap">
            {loading ? 'Pesquisando...' : 'Pesquisar'}
          </ButtonPrimary>
        </form>
      </Card>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-8 overflow-x-auto scrollbar-hide">
        {[
          { id: 'global', label: 'Visão Global', icon: <Database className="w-4 h-4" /> },
          { id: 'legislation', label: 'Legislação', icon: <BookOpen className="w-4 h-4" /> },
          { id: 'caselaw', label: 'Jurisprudência', icon: <Gavel className="w-4 h-4" /> },
          { id: 'tax', label: 'Fisco (e-fatura)', icon: <FileText className="w-4 h-4" /> },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-4 text-sm font-medium transition-colors relative ${
              activeTab === tab.id ? 'text-amber' : 'text-slate-400 hover:text-white'
            }`}
          >
            {tab.icon}
            {tab.label}
            {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-navy rounded-full" />}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <SkeletonLoader count={4} height="h-32" />
          </div>
          <div className="space-y-4">
            <SkeletonLoader count={1} height="h-64" />
          </div>
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Results List */}
          <div className="lg:col-span-2 space-y-4">
            {filteredResults.length > 0 ? (
              filteredResults.map((result) => (
                <Card key={result.id} className="p-6 group cursor-default">
                  <div className="flex justify-between items-start gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <Badge color={result.source === 'DRE' ? 'green' : result.source === 'STJ' || result.source === 'DGSI' ? 'navy' : 'slate'}>
                          {result.source}
                        </Badge>
                        {result.similarity && (
                          <span className="text-xs font-semibold text-slate-400">
                             {Math.round(result.similarity * 100)}% Match
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-bold text-navy group-hover:text-amber-700 transition-colors">
                        {result.title}
                      </h3>
                    </div>
                    {result.url && (
                      <a href={result.url} target="_blank" rel="noopener noreferrer" className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 transition-colors">
                        <ExternalLink className="w-5 h-5" />
                      </a>
                    )}
                  </div>
                  <p className="mt-3 text-slate-100 line-clamp-3">
                    {result.content}
                  </p>
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs font-mono text-slate-400">{result.reference}</span>
                    <button className="flex items-center gap-1 text-sm font-semibold text-navy hover:text-amber-800 transition-colors">
                      <Plus className="w-4 h-4" />
                      Guardar no Processo
                    </button>
                  </div>
                </Card>
              ))
            ) : (
              <EmptyState 
                title="Sem resultados nesta categoria"
                description="Tente mudar de categoria ou ajustar os termos da sua pesquisa."
                icon={<Info className="w-12 h-12" />}
              />
            )}
          </div>

          {/* AI Insights Card */}
          <div className="space-y-6">
            {aiAnswer && (
              <Card className="p-6 bg-navy text-white border-none shadow-xl shadow-navy/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                  <Sparkles className="w-32 h-32" />
                </div>
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-white/10 rounded-lg">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                    </div>
                    <span className="font-bold text-sm tracking-widest uppercase text-white/60">Análise da IA</span>
                  </div>
                  <h4 className="text-xl font-display font-bold">Parecer Consultivo</h4>
                  <div className="prose prose-invert prose-sm">
                    <p className="text-white/80 leading-relaxed italic">
                      "{aiAnswer}"
                    </p>
                  </div>
                  <div className="pt-4 border-t border-white/10">
                    <p className="text-[10px] text-white/40 uppercase tracking-widest leading-normal">
                      Informação gerada por IA baseada nos resultados de pesquisa. Valide sempre com os diplomas oficiais.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Quick Tips */}
            <Card className="p-6 border-slate-100 bg-slate-50/50">
              <h4 className="font-bold text-navy mb-4 flex items-center gap-2">
                <Info className="w-4 h-4 text-amber-600" />
                Dicas de Pesquisa
              </h4>
              <ul className="space-y-3 text-sm text-slate-100">
                <li className="flex gap-2">
                  <ChevronRight className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>Use <strong>termos específicos</strong> como "Dano moral" ou "Código Civil".</span>
                </li>
                <li className="flex gap-2">
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>A pesquisa abrange acórdãos do <strong>STJ, Tribunais da Relação</strong> e <strong>Tribunais Comarcais</strong>.</span>
                </li>
                <li className="flex gap-2">
                  <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Dados de <strong>e-fatura</strong> requerem NIF e permissão do cliente.</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      ) : (
        <EmptyState 
          title={<span className="text-white">Pronto para a Pesquisa Inteligente</span>}
          description={<span className="text-slate-100">Inicie sua pesquisa para acessar milhões de leis e decisões judiciais portuguesas com suporte de IA.</span>}
          icon={<Gavel className="w-16 h-16 text-slate-400" />}
        />
      )}
    </div>
  );
}
