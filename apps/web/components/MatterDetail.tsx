"use client";

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Clock, FileText, Calendar, Wallet, User, AlertTriangle, ArrowLeft, History, DollarSign, Receipt, Info, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TimeTracker from './TimeTracker';
import ExpenseTracker from './ExpenseTracker';
import InvoiceDraftPanel from './InvoiceDraftPanel';
import UploadDocumentModal from './UploadDocumentModal';
import AddTaskModal from './AddTaskModal';
import PortalLinkButton from './PortalLinkButton';
import DocumentListPanel from './DocumentListPanel';
import AiDraftButton from './ai/AiDraftButton';

interface Matter {
  id: string;
  title: string;
  type: string;
  status: string;
  court_reference?: string | null;
  citius_reference?: string | null;
  opposing_party?: string | null;
  opposing_counsel?: string | null;
  deadline_at?: string | null;
  opened_at?: string | null;
  closed_at?: string | null;
  client_id?: string;
  clientId?: string;
  responsible_id?: string | null;
  createdAt: string;
  documents?: {
    id: string;
    filename: string;
    mimeType: string;
    isSharedWithClient?: boolean;
    createdAt: string;
  }[];
}

interface Props {
  matter: Matter;
}

const generateMockTimeline = (matter: Matter) => [
  {
    id: '1',
    type: 'created',
    title: 'Processo criado',
    description: `Processo ${matter.title} foi criado no sistema`,
    timestamp: new Date(matter.createdAt),
    icon: <FileText size={14} />,
  },
  {
    id: '2',
    type: 'status',
    title: `Status alterado para ${matter.status}`,
    description: 'Mudança de estado do processo',
    timestamp: new Date(new Date(matter.createdAt).getTime() + 86400000),
    icon: <Info size={14} />,
  },
  {
    id: '3',
    type: 'document',
    title: 'Documento anexado',
    description: 'Petição inicial.pdf foi adicionado',
    timestamp: new Date(new Date(matter.createdAt).getTime() + 172800000),
    icon: <FileText size={14} />,
  },
  ...(matter.deadline_at
    ? [
      {
        id: '4',
        type: 'deadline',
        title: 'Prazo definido',
        description: `Prazo processual até ${new Date(matter.deadline_at).toLocaleDateString('pt-PT')}`,
        timestamp: new Date(new Date(matter.createdAt).getTime() + 259200000),
        icon: <Calendar size={14} />,
      },
    ]
    : []),
];

export default function MatterDetail({ matter: initialMatter }: Props) {
  const [matter, setMatter] = useState(initialMatter);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'fees' | 'expenses' | 'billing'>('timeline');
  const [form, setForm] = useState({
    title: initialMatter.title,
    type: initialMatter.type,
    status: initialMatter.status,
    court_reference: initialMatter.court_reference || '',
    citius_reference: initialMatter.citius_reference || '',
    opposing_party: initialMatter.opposing_party || '',
    opposing_counsel: initialMatter.opposing_counsel || '',
    deadline_at: initialMatter.deadline_at || '',
  });
  const [loading, setLoading] = useState(false);
  const [summaries, setSummaries] = useState({ total_hours: 0, total_expenses: 0 });
  const timeline = useMemo(() => generateMockTimeline(matter), [matter]);

  useEffect(() => {
    async function loadSummaries() {
      try {
        const token = localStorage.getItem('access_token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
        const headers = { Authorization: token ? `Bearer ${token}` : '' } as Record<string, string>;

        const [hoursRes, expRes] = await Promise.all([
          fetch(`${API_URL}/time-entries/matter/${matter.id}/summary`, { headers }),
          fetch(`${API_URL}/expenses/matter/${matter.id}/summary`, { headers }),
        ]);

        if (hoursRes.ok && expRes.ok) {
          const hData = await hoursRes.json();
          const eData = await expRes.json();
          setSummaries({
            total_hours: hData.total_hours || 0,
            total_expenses: eData.total_amount || 0,
          });
        }
      } catch (err) {
        console.error('Erro ao carregar resumos:', err);
      }
    }
    if (matter.id) loadSummaries();
  }, [matter.id]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function save() {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${API_URL}/matters/${matter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        } as Record<string, string>,
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Falha ao atualizar');
      const data = await res.json();
      setMatter(data);
      toast.success('Processo atualizado');
      setIsEditing(false);
    } catch (err) {
      toast.error((err as Error).message || 'Erro ao salvar');
    } finally {
      setLoading(false);
    }
  }

  const typeLabels: Record<string, string> = {
    CIVEL: 'Cível',
    PENAL: 'Penal',
    LABORAL: 'Laboral',
    ADMINISTRATIVO: 'Administrativo',
    FISCAL: 'Fiscal',
    FAMILIA: 'Família',
    COMERCIAL: 'Comercial',
    OUTRO: 'Outro',
  };

  const statusLabels: Record<string, string> = {
    ATIVO: 'Ativo',
    ENCERRADO: 'Encerrado',
    SUSPENSO: 'Suspenso',
    ARQUIVADO: 'Arquivado',
  };

  const tabs = [
    { id: 'timeline', label: 'Linha do Tempo', icon: History },
    { id: 'fees', label: 'Honorários', icon: DollarSign },
    { id: 'expenses', label: 'Despesas', icon: Receipt },
    { id: 'billing', label: 'Faturação', icon: Wallet },
  ] as const;

  return (
    <div className="space-y-8 max-w-[1600px] mx-auto pb-12">
      {/* breadcrumb navigation */}
      <motion.div 
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-center gap-2 text-slate-400"
      >
        <Link href="/dashboard" className="hover:text-amber transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em]">
            Painel Central
        </Link>
        <span className="text-white/20">/</span>
        <Link href="/matters" className="hover:text-amber transition-colors flex items-center gap-1 text-[10px] font-black uppercase tracking-[0.2em]">
            Processos
        </Link>
        <span className="text-white/20">/</span>
        <span className="text-amber text-[10px] font-black uppercase tracking-[0.2em] opacity-80">Detalhes</span>
      </motion.div>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-8">
        <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1"
        >
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-lg ${
                matter.status === 'ATIVO' ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 
                matter.status === 'SUSPENSO' ? 'bg-amber/10 text-amber border border-amber/20' : 
                'bg-red-500/10 text-red-400 border border-red-500/20'
            }`}>
              {statusLabels[matter.status] || matter.status}
            </span>
            <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-white/5 text-white/60 border border-white/10">
              {typeLabels[matter.type] || matter.type}
            </span>
            {matter.court_reference && (
                <span className="text-xs font-mono text-amber/60 bg-amber/5 px-3 py-1 rounded border border-amber/10">
                    {matter.court_reference}
                </span>
            )}
          </div>
          <h1 className="text-6xl font-display font-black text-white uppercase tracking-tighter leading-[0.9] max-w-3xl mb-4">
            {matter.title}
          </h1>
          <p className="text-slate-400 font-medium tracking-wide">
            Gerencie documentos, tempos, despesas e faturamento associados a este caso processual.
          </p>
        </motion.div>

        <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex gap-3 flex-shrink-0"
        >
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-3 rounded-xl border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/5 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={loading}
                className="px-8 py-3 rounded-xl bg-amber text-navy font-bold text-xs uppercase tracking-widest shadow-xl shadow-amber/20 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
              >
                {loading ? 'Gravando...' : 'Salvar'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-8 py-3 rounded-xl bg-white/5 border border-white/10 text-white font-bold text-xs uppercase tracking-widest hover:bg-white/10 active:scale-95 transition-all flex items-center gap-2"
            >
              Editar Detalhes
            </button>
          )}
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column - 8/12 */}
        <div className="lg:col-span-8 space-y-8">
          {/* Info Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-8"
          >
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-amber/10 flex items-center justify-center text-amber">
                    <Info size={20} />
                </div>
                <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Especificações Técnicas</h2>
            </div>

            {isEditing ? (
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Tipo de Processo</label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber/50 outline-none transition-all"
                    >
                      {Object.entries(typeLabels).map(([key, label]) => (
                        <option key={key} value={key} className="bg-navy">
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Estado Atual</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber/50 outline-none transition-all"
                    >
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <option key={key} value={key} className="bg-navy">
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Título do Processo</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber/50 outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Ref. Tribunal</label>
                    <input
                      name="court_reference"
                      value={form.court_reference}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Ref. CITIUS</label>
                    <input
                      name="citius_reference"
                      value={form.citius_reference}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Parte Contrária</label>
                    <input
                      name="opposing_party"
                      value={form.opposing_party}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber/50 outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Advogado Contrário</label>
                    <input
                      name="opposing_counsel"
                      value={form.opposing_counsel}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber/50 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Prazo Processual</label>
                  <input
                    type="datetime-local"
                    name="deadline_at"
                    value={form.deadline_at}
                    onChange={handleChange}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber/50 outline-none transition-all"
                  />
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                <div className="space-y-6">
                  <div className="group border-b border-white/5 pb-4">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Tribunal e Sistema</span>
                    <div className="flex flex-col gap-2">
                        {matter.court_reference ? (
                            <span className="text-sm font-mono text-amber flex items-center gap-2">
                                <span className="w-1.5 h-1.5 bg-amber rounded-full animate-pulse" />
                                {matter.court_reference}
                            </span>
                        ) : (
                            <span className="text-xs italic text-slate-600">Sem ref. de tribunal</span>
                        )}
                        {matter.citius_reference && (
                            <span className="text-sm font-mono text-slate-300 pl-3.5 border-l border-white/10">
                                {matter.citius_reference}
                            </span>
                        )}
                    </div>
                  </div>
                  
                  <div className="group">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Contencioso</span>
                    <div className="space-y-3">
                        {matter.opposing_party && (
                            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg border border-white/5">
                                <div className="text-xs font-black text-white/40 uppercase">Vs</div>
                                <span className="text-sm font-bold text-white">{matter.opposing_party}</span>
                            </div>
                        )}
                        {matter.opposing_counsel && (
                            <div className="flex items-center gap-2 pl-3">
                                <User size={12} className="text-amber" />
                                <span className="text-xs font-medium text-slate-400">{matter.opposing_counsel}</span>
                            </div>
                        )}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                   <div className="group border-b border-white/5 pb-4">
                        <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Prazos & Limites</span>
                        {matter.deadline_at ? (
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-500/10 rounded-lg text-red-500">
                                    <Clock size={18} />
                                </div>
                                <div>
                                    <p className="text-sm font-black text-white">{new Date(matter.deadline_at).toLocaleDateString('pt-PT')}</p>
                                    <p className="text-[10px] font-bold text-red-400/60 uppercase">Expira em breve</p>
                                </div>
                            </div>
                        ) : (
                            <span className="text-xs italic text-slate-600">Sem prazos definidos</span>
                        )}
                  </div>

                  <div className="group">
                    <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest block mb-2">Associação de Cliente</span>
                    {(() => {
                        const cId = matter.clientId || (matter as any).client_id;
                        if (cId && cId !== "undefined") {
                            return (
                                <Link 
                                    href={`/clients/${cId}`} 
                                    className="p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-all group/link flex items-center justify-between"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-navy border border-white/10 flex items-center justify-center text-[10px] font-black text-amber">
                                            CL
                                        </div>
                                        <span className="text-sm font-bold text-white group-hover/link:text-amber transition-colors">Aceder Perfil Cliente</span>
                                    </div>
                                    <div className="w-6 h-6 rounded-full bg-white/5 flex items-center justify-center group-hover/link:bg-amber group-hover/link:text-navy transition-all">
                                        <ChevronRight size={12} />
                                    </div>
                                </Link>
                            );
                        }
                        return (
                            <div className="flex items-center gap-2 text-red-400/60 italic p-3 border border-red-500/10 rounded-lg bg-red-500/5">
                                <AlertTriangle size={14} />
                                <span className="text-xs">Identificação de cliente em falta</span>
                            </div>
                        );
                    })()}
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Detailed Tabs Control Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel overflow-hidden"
          >
            <div className="flex flex-wrap border-b border-white/5 bg-white/2 overflow-x-auto no-scrollbar">
               {tabs.map((tab) => {
                 const Icon = tab.icon;
                 const isActive = activeTab === tab.id;
                 return (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 py-5 px-8 text-[11px] font-black uppercase tracking-widest transition-all relative whitespace-nowrap ${
                            isActive ? 'text-amber' : 'text-slate-500 hover:text-white hover:bg-white/5'
                        }`}
                    >
                        <Icon size={14} className={isActive ? 'text-amber' : 'opacity-40'} />
                        {tab.label}
                        {isActive && (
                            <motion.div 
                                layoutId="active-tab-detail"
                                className="absolute bottom-0 left-0 right-0 h-[3px] bg-amber"
                            />
                        )}
                    </button>
                 );
               })}
            </div>

            <div className="p-8">
              <AnimatePresence mode="wait">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'timeline' && (
                        <div className="space-y-4">
                        {timeline.map((event, idx) => (
                            <div key={event.id} className="flex gap-6 group">
                            <div className="flex flex-col items-center">
                                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all ${
                                    idx === 0 ? 'bg-amber text-navy shadow-lg shadow-amber/20' : 'bg-white/5 text-white/40 group-hover:bg-white/10 group-hover:text-amber'
                                }`}>
                                    {event.icon}
                                </div>
                                {idx < timeline.length - 1 && (
                                    <div className="w-[2px] bg-white/5 flex-grow my-2 min-h-[40px]" />
                                )}
                            </div>
                            <div className="pb-8 flex-1">
                                <div className="flex justify-between items-start">
                                    <p className={`text-sm font-bold ${idx === 0 ? 'text-white' : 'text-slate-300'} group-hover:text-amber transition-colors`}>
                                        {event.title}
                                    </p>
                                    <span className="text-[10px] font-mono text-slate-500 bg-white/2 px-2 py-0.5 rounded">
                                        {event.timestamp.toLocaleDateString('pt-PT')}
                                    </span>
                                </div>
                                <p className="text-xs text-slate-500 mt-2 font-medium leading-relaxed max-w-xl">
                                    {event.description}
                                </p>
                            </div>
                            </div>
                        ))}
                        </div>
                    )}

                    {activeTab === 'fees' && <TimeTracker matterId={matter.id} />}
                    {activeTab === 'expenses' && <ExpenseTracker matterId={matter.id} />}
                    {activeTab === 'billing' && <InvoiceDraftPanel matterId={matter.id} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Right Column - 4/12 (Sidebar Area) */}
        <div className="lg:col-span-4 space-y-8">
          {/* Quick Metrics Cards */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="grid grid-cols-2 gap-4"
          >
            <div className="glass-panel p-6 border-white/10 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 text-white/5 group-hover:text-amber/10 transition-colors">
                  <Clock size={80} />
              </div>
              <Clock className="w-5 h-5 text-amber mb-4" />
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Horas Registadas</p>
              <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-black text-white">{summaries.total_hours.toFixed(1)}</p>
                  <p className="text-xs font-bold text-slate-600">H</p>
              </div>
            </div>
            <div className="glass-panel p-6 border-white/10 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 text-white/5 group-hover:text-green-500/10 transition-colors">
                  <Wallet size={80} />
              </div>
              <Wallet className="w-5 h-5 text-green-400 mb-4" />
              <p className="text-[10px] font-black uppercase text-slate-500 tracking-widest mb-1">Custos Totais</p>
              <div className="flex items-baseline gap-1">
                  <p className="text-3xl font-black text-white">€{summaries.total_expenses.toLocaleString('pt-PT', { minimumFractionDigits: 0 })}</p>
              </div>
            </div>
          </motion.div>

          {/* AI Toolbox Card */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-panel p-6 border-amber/20 overflow-hidden relative"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <div className="animate-spin-slow">
                    <History size={120} className="text-amber" />
                </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 bg-amber rounded-xl text-navy shadow-lg shadow-amber/20">
                    <FileText size={18} />
                </div>
                <div>
                   <h3 className="text-[11px] font-black uppercase text-white tracking-widest leading-none mb-1">Repositório</h3>
                   <p className="text-[10px] text-amber/60 font-medium">GESTÃO DE DOCUMENTOS</p>
                </div>
            </div>
            
            <div className="space-y-4">
                <AiDraftButton matterId={matter.id} />
                <div className="h-[1px] bg-white/5 my-2" />
                <DocumentListPanel matterId={matter.id} documents={matter.documents || []} />
            </div>
            
            <div className="mt-8 grid grid-cols-1 gap-3">
                <UploadDocumentModal matterId={matter.id} />
                <AddTaskModal matterId={matter.id} />
            </div>
          </motion.div>

          {/* Access Portal */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="glass-panel p-6 border-blue-500/20 bg-blue-500/5 group"
          >
             <div className="flex items-center gap-3 mb-4">
                <User size={18} className="text-blue-400" />
                <h3 className="text-[11px] font-black uppercase text-blue-400 tracking-widest">Acesso do Cliente</h3>
             </div>
             <p className="text-[11px] text-slate-400 leading-relaxed mb-6 font-medium">
                Gere links de acesso seguro para que o cliente possa acompanhar o estado deste processo em tempo real.
             </p>
             <PortalLinkButton matterId={matter.id} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}
