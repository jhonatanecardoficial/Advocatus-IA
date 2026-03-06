"use client";

import { useState, useMemo } from 'react';
import { toast } from 'sonner';
import { Clock, FileText, AlertCircle, CheckCircle2, Calendar } from 'lucide-react';
import TimeTracker from './TimeTracker';

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
  client_id: string;
  responsible_id?: string | null;
  createdAt: string;
}

interface Props {
  matter: Matter;
}

// Mock data para timeline de eventos
const generateMockTimeline = (matter: Matter) => [
  {
    id: '1',
    type: 'created',
    title: 'Processo criado',
    description: `Processo ${matter.title} foi criado no sistema`,
    timestamp: new Date(matter.createdAt),
    icon: 'document',
  },
  {
    id: '2',
    type: 'status',
    title: `Status alterado para ${matter.status}`,
    description: 'Mudança de estado do processo',
    timestamp: new Date(new Date(matter.createdAt).getTime() + 86400000),
    icon: 'status',
  },
  {
    id: '3',
    type: 'document',
    title: 'Documento anexado',
    description: 'Petição inicial.pdf foi adicionado',
    timestamp: new Date(new Date(matter.createdAt).getTime() + 172800000),
    icon: 'file',
  },
  ...(matter.deadline_at
    ? [
        {
          id: '4',
          type: 'deadline',
          title: 'Prazo definido',
          description: `Prazo processual até ${new Date(matter.deadline_at).toLocaleDateString('pt-PT')}`,
          timestamp: new Date(new Date(matter.createdAt).getTime() + 259200000),
          icon: 'calendar',
        },
      ]
    : []),
];

export default function MatterDetail({ matter: initialMatter }: Props) {
  const [matter, setMatter] = useState(initialMatter);
  const [isEditing, setIsEditing] = useState(false);
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
  const timeline = useMemo(() => generateMockTimeline(matter), [matter]);

  const statusColors: Record<string, { bg: string; text: string; border: string }> = {
    ATIVO: { bg: 'bg-green-50', text: 'text-green-800', border: 'border-green-300' },
    ENCERRADO: { bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-300' },
    SUSPENSO: { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-300' },
    ARQUIVADO: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-400' },
  };

  const colors = statusColors[matter.status] || statusColors.ATIVO;

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
          Authorization: token ? `Bearer ${token}` : undefined,
        },
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-xs font-bold uppercase tracking-widest px-3 py-1 border rounded ${colors.bg} ${colors.text} ${colors.border}`}>
              {statusLabels[matter.status] || matter.status}
            </span>
            <span className="text-xs font-bold uppercase tracking-widest px-3 py-1 border border-navy text-navy bg-slate-50">
              {typeLabels[matter.type] || matter.type}
            </span>
          </div>
          <h1 className="text-4xl font-display font-black text-navy uppercase tracking-tighter leading-tight max-w-2xl">
            {matter.title}
          </h1>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 text-sm font-bold uppercase tracking-widest text-navy bg-slate-100 hover:bg-slate-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={loading}
                className="px-4 py-2 text-sm font-bold uppercase tracking-widest bg-navy text-white hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                {loading ? 'Gravando...' : 'Salvar'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-bold uppercase tracking-widest bg-navy text-white hover:bg-amber-600 transition-colors"
            >
              Editar
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Detalhes */}
          <div className="bg-white border-2 border-navy p-6">
            <h2 className="text-lg font-bold text-navy mb-4 uppercase tracking-widest">Detalhes do processo</h2>

            {isEditing ? (
              <form className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-navy mb-2">Tipo</label>
                    <select
                      name="type"
                      value={form.type}
                      onChange={handleChange}
                      className="w-full border border-slate-300 px-3 py-2 text-sm"
                    >
                      {Object.entries(typeLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-navy mb-2">Estado</label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleChange}
                      className="w-full border border-slate-300 px-3 py-2 text-sm"
                    >
                      {Object.entries(statusLabels).map(([key, label]) => (
                        <option key={key} value={key}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-navy mb-2">Título</label>
                  <input
                    name="title"
                    value={form.title}
                    onChange={handleChange}
                    className="w-full border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-navy mb-2">Referência do tribunal</label>
                    <input
                      name="court_reference"
                      value={form.court_reference}
                      onChange={handleChange}
                      className="w-full border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-navy mb-2">Referência CITIUS</label>
                    <input
                      name="citius_reference"
                      value={form.citius_reference}
                      onChange={handleChange}
                      className="w-full border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-navy mb-2">Parte contrária</label>
                    <input
                      name="opposing_party"
                      value={form.opposing_party}
                      onChange={handleChange}
                      className="w-full border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-navy mb-2">Advogado da outra parte</label>
                    <input
                      name="opposing_counsel"
                      value={form.opposing_counsel}
                      onChange={handleChange}
                      className="w-full border border-slate-300 px-3 py-2 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-navy mb-2">Prazo do processo</label>
                  <input
                    type="datetime-local"
                    name="deadline_at"
                    value={form.deadline_at}
                    onChange={handleChange}
                    className="w-full border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Tipo:</span>
                  <span className="text-sm font-mono text-navy">{typeLabels[matter.type] || matter.type}</span>
                </div>
                {matter.court_reference && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Ref. Tribunal:</span>
                    <span className="text-sm font-mono text-navy">{matter.court_reference}</span>
                  </div>
                )}
                {matter.citius_reference && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Ref. CITIUS:</span>
                    <span className="text-sm font-mono text-navy">{matter.citius_reference}</span>
                  </div>
                )}
                {matter.opposing_party && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Parte contrária:</span>
                    <span className="text-sm text-navy">{matter.opposing_party}</span>
                  </div>
                )}
                {matter.opposing_counsel && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Advogado contrário:</span>
                    <span className="text-sm text-navy">{matter.opposing_counsel}</span>
                  </div>
                )}
                {matter.deadline_at && (
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Prazo:</span>
                    <span className="text-sm font-mono text-navy">{new Date(matter.deadline_at).toLocaleDateString('pt-PT')}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Timeline */}
          <div className="bg-white border-2 border-navy p-6">
            <h2 className="text-lg font-bold text-navy mb-6 uppercase tracking-widest">Linha do tempo</h2>
            <div className="space-y-4">
              {timeline.map((event, idx) => (
                <div key={event.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-8 h-8 bg-navy text-white rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold">
                      {idx + 1}
                    </div>
                    {idx < timeline.length - 1 && <div className="w-1 bg-slate-200 flex-grow my-2 h-12" />}
                  </div>
                  <div className="pb-4">
                    <p className="text-sm font-bold text-navy">{event.title}</p>
                    <p className="text-xs text-slate-500 mt-1">{event.description}</p>
                    <p className="text-xs text-slate-400 mt-1">{event.timestamp.toLocaleDateString('pt-PT')}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Prazo */}
          {matter.deadline_at && (
            <div className="bg-amber-50 border-2 border-amber-300 p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-4 h-4 text-amber-800" />
                <h3 className="text-sm font-bold uppercase text-amber-800">Próximo prazo</h3>
              </div>
              <p className="text-xs text-amber-700">{new Date(matter.deadline_at).toLocaleDateString('pt-PT')}</p>
            </div>
          )}

          {/* Documentos */}
          <div className="bg-white border-2 border-navy p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-4 h-4 text-navy" />
              <h3 className="text-sm font-bold uppercase text-navy">Documentos</h3>
            </div>
            <p className="text-xs text-slate-500">Nenhum documento anexado ainda</p>
            <button className="mt-3 w-full px-3 py-2 text-xs font-bold uppercase tracking-widest bg-navy text-white hover:bg-amber-600 transition-colors">
              Anexar documentos
            </button>
          </div>

          {/* Tempo registado */}
          <TimeTracker matterId={matter.id} />

          {/* Informações */}
          <div className="bg-slate-50 border-2 border-slate-300 p-4">
            <h3 className="text-sm font-bold uppercase text-navy mb-3">Informações</h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-600">Cliente:</span>
                <a href={`/clients/${matter.client_id}`} className="block text-amber-500 hover:underline">
                  Ver cliente
                </a>
              </div>
              <div>
                <span className="text-slate-600">Criado:</span>
                <p className="text-slate-500">{new Date(matter.createdAt).toLocaleDateString('pt-PT')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
