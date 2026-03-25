"use client";

import { useState } from 'react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Users, Mail, Phone, Settings, ArrowRight, Briefcase, Plus, ShieldAlert, ShieldCheck, AlertCircle, Search, Trash2 } from 'lucide-react';
import { updateClientAction, deleteClientAction, checkConflictAction } from '@/app/actions/clients';
import { useRouter } from 'next/navigation';
import AddMatterModal from './AddMatterModal';

interface Matter {
  id: string;
  title: string;
  type: string;
  status: string;
  deadlineAt: string | null;
  createdAt: string;
}

interface Client {
  id: string;
  nome: string;
  email: string | null;
  telefone: string | null;
  nif: string;
  tipo: 'SINGULAR' | 'COLETIVA';
  address?: string | null;
  notes?: string | null;
  gdprConsentAt?: string | null;
  matters?: Matter[];
}

interface ClientDetailProps { // Renamed from Props to ClientDetailProps
  client: Client;
}

export default function ClientDetail({ client: initialClient }: ClientDetailProps) {
  const router = useRouter();
  const [client, setClient] = useState(initialClient);
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState({
    nome: initialClient.nome,
    email: initialClient.email || '',
    telefone: initialClient.telefone || '',
    nif: initialClient.nif,
    tipo: initialClient.tipo,
    address: initialClient.address || '',
    notes: initialClient.notes || '',
    gdprConsent: !!initialClient.gdprConsentAt,
  });
  const [loading, setLoading] = useState(false);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value, type, checked } = e.target as any;
    setForm((f: any) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  const save = async () => {
    // Validação de nome completo
    const nameParts = form.nome.trim().split(/\s+/).filter(Boolean);
    if (nameParts.length < 2) {
        toast.error('Por favor, introduza o nome completo (pelo menos dois nomes).');
        return;
    }

    setLoading(true);
    try {
        const result = await updateClientAction(client.id, {
            nome: form.nome,
            nif: form.nif,
            tipo: form.tipo,
            email: form.email,
            telefone: form.telefone,
            address: form.address,
            notes: form.notes,
            gdprConsent: form.gdprConsent,
        });

        if (result.error) {
            toast.error(result.error);
        } else {
            toast.success('Cliente atualizado com sucesso!');
            setClient({ ...client, ...form, gdprConsentAt: form.gdprConsent ? new Date().toISOString() : null }); // Update client state with new form data
            setIsEditing(false);
        }
    } catch (error) {
        toast.error('Erro ao atualizar cliente.');
    } finally {
        setLoading(false);
    }
  };

  const handleDelete = async () => {
      if (!window.confirm('Tem a certeza que deseja eliminar este cliente? Esta ação é irreversível.')) {
          return;
      }

      setLoading(true);
      try {
          const result = await deleteClientAction(client.id);
          if (result.error) {
              toast.error(result.error);
          } else {
              toast.success('Cliente eliminado com sucesso.');
              router.push('/clients');
          }
      } catch (error) {
          toast.error('Erro ao eliminar cliente.');
      } finally {
          setLoading(false);
      }
  };

  const [conflictStatus, setConflictStatus] = useState<'idle' | 'checking' | 'none' | 'found'>('idle');

  async function checkConflict() {
    setConflictStatus('checking');
    try {
      const result = await checkConflictAction({
        nome: form.nome,
        nif: form.nif,
      });

      if (result.error) throw new Error(result.error);
      
      if (result.hasConflicts) {
        setConflictStatus('found');
        toast.error('Foram encontrados possíveis conflitos de interesses!');
      } else {
        setConflictStatus('none');
        toast.success('Verificação concluída: Sem conflitos detetados.');
      }
    } catch (err) {
      setConflictStatus('idle');
      toast.error((err as Error).message || 'Erro ao verificar conflitos');
    }
  }

  return (
    <div className="space-y-8 animate-reveal">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className={`p-2 rounded-lg border ${client.tipo === 'SINGULAR' ? 'bg-white/5 border-white/10' : 'bg-amber/10 border-amber/20'}`}>
              <Users className={`w-5 h-5 ${client.tipo === 'SINGULAR' ? 'text-white' : 'text-amber'}`} />
            </div>
            <span className="text-[10px] text-amber font-black uppercase tracking-[0.3em]">Perfil de Entidade</span>
          </div>
          <h1 className="text-4xl font-display font-black text-white uppercase tracking-tighter leading-none">
            {isEditing ? 'Editar Ficha' : client.nome}
          </h1>
          <p className="text-white/40 mt-3 font-mono text-[10px] uppercase tracking-widest flex items-center gap-4">
            <span>NIF: <span className="text-white font-bold">{client.nif}</span></span>
            <span className="w-1.5 h-1.5 rounded-full bg-white/10"></span>
            <span>Tipo: {client.tipo}</span>
          </p>
        </div>

        <div className="flex gap-3">
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/60 hover:text-white hover:bg-white/5 border border-white/10 transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={save}
                disabled={loading}
                className="px-8 py-4 text-[10px] font-black uppercase tracking-widest bg-amber text-navy shadow-glow hover:scale-[1.02] transition-all disabled:opacity-50"
              >
                {loading ? 'Sincronizando...' : 'Gravar Alterações'}
              </button>
            </>
          ) : (
            <div className="flex gap-3 text-white items-center">
              <AddMatterModal 
                clientId={client.id}
                clientName={client.nome}
                trigger={
                  <button className="px-6 py-4 text-[10px] font-black uppercase tracking-widest bg-amber text-navy shadow-[0_0_20px_rgba(251,191,36,0.2)] hover:scale-[1.02] transition-all flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    <span>Abrir Novo Processo</span>
                  </button>
                }
              />
              <button
                onClick={checkConflict}
                disabled={conflictStatus === 'checking'}
                className={`flex items-center gap-3 px-8 py-4 text-[10px] font-black uppercase tracking-widest border transition-all ${
                  conflictStatus === 'found' ? 'bg-red-500/10 border-red-500/30 text-red-400' :
                  conflictStatus === 'none' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' :
                  conflictStatus === 'checking' ? 'bg-amber/5 border-amber/20 text-amber animate-pulse' :
                  'bg-amber text-navy border-amber shadow-glow hover:scale-[1.02]'
                }`}
              >
                {conflictStatus === 'checking' ? <Search size={14} className="animate-spin" /> : 
                 conflictStatus === 'found' ? <ShieldAlert size={14} /> :
                 conflictStatus === 'none' ? <ShieldCheck size={14} /> :
                 <AlertCircle size={14} />}
                
                {conflictStatus === 'idle' && 'Verificar Conflitos'}
                {conflictStatus === 'checking' && 'A Analisar...'}
                {conflictStatus === 'found' && 'Conflito Encontrado'}
                {conflictStatus === 'none' && 'Sem Conflitos'}
              </button>
              <button
                onClick={() => setIsEditing(true)}
                className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:border-white/40 hover:text-white transition-all bg-white/5"
              >
                <Settings size={20} />
              </button>
              <button 
                onClick={handleDelete}
                className="w-14 h-14 rounded-full border border-white/10 flex items-center justify-center text-red-400 hover:border-red-500 hover:text-red-500 transition-all bg-white/5"
              >
                <Trash2 size={20} />
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="glass-panel p-8 border border-white/10 bg-navy/20 backdrop-blur-xl relative overflow-hidden group">
            <div className="absolute -right-20 -top-20 w-40 h-40 bg-amber/5 rounded-full blur-[80px] group-hover:bg-amber/10 transition-colors"></div>
            
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-amber mb-8 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-amber/30"></span>
              Informações Gerais
            </h3>

            {isEditing ? (
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Nome Completo</label>
                    <input
                      name="nome"
                      value={form.nome}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-body focus:outline-none focus:border-amber/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Número de Contribuinte (NIF)</label>
                    <input
                      name="nif"
                      value={form.nif}
                      onChange={handleChange}
                      className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-body focus:outline-none focus:border-amber/50 transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Endereço de E-mail</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-3 text-white font-body focus:outline-none focus:border-amber/50 transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Contacto Telefónico</label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
                      <input
                        name="telefone"
                        value={form.telefone}
                        onChange={handleChange}
                        className="w-full bg-white/5 border border-white/10 pl-12 pr-4 py-3 text-white font-body focus:outline-none focus:border-amber/50 transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/40">Morada Residencial / Sede</label>
                  <textarea
                    name="address"
                    value={form.address}
                    onChange={handleChange}
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-body focus:outline-none focus:border-amber/50 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 p-4 bg-amber/5 border border-amber/10 rounded-lg">
                  <input
                    type="checkbox"
                    name="gdprConsent"
                    checked={form.gdprConsent}
                    onChange={handleChange}
                    className="w-4 h-4 accent-amber"
                  />
                  <label className="text-[10px] font-bold uppercase tracking-widest text-amber/80 cursor-pointer">
                    Autorizo o tratamento de dados pessoais (GDPR Compliance)
                  </label>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                <div className="space-y-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Email Registado</p>
                    <p className="text-white font-body flex items-center gap-3">
                      <Mail className="w-4 h-4 text-amber/40" />
                      {client.email || 'Não disponível'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Contacto Telefónico</p>
                    <p className="text-white font-body flex items-center gap-3">
                      <Phone className="w-4 h-4 text-amber/40" />
                      {client.telefone || 'Não disponível'}
                    </p>
                  </div>
                </div>
                <div className="space-y-8">
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Endereço Completo</p>
                    <p className="text-white font-body leading-relaxed">
                      {client.address || 'Não disponível'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/20">Consentimento GDPR</p>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${client.gdprConsentAt ? 'bg-green-500 shadow-glow-green' : 'bg-red-500'}`}></div>
                      <p className="text-xs font-bold text-white/60">
                        {client.gdprConsentAt ? `Ativo - Registado em ${new Date(client.gdprConsentAt).toLocaleDateString()}` : 'Pendente'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="glass-panel p-8 border border-white/10 bg-navy/20 backdrop-blur-xl">
            <h3 className="text-xs font-black uppercase tracking-[0.3em] text-amber mb-6 flex items-center gap-3">
              <span className="w-8 h-[1px] bg-amber/30"></span>
              Notas Mentais & Observações
            </h3>
            {isEditing ? (
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Introduza notas relevantes sobre este cliente..."
                className="w-full bg-white/5 border border-white/10 px-4 py-3 text-white font-body focus:outline-none focus:border-amber/50 transition-all resize-none"
              />
            ) : (
              <p className="text-white/60 font-body leading-relaxed italic">
                {client.notes || 'Nenhuma observação registada para este cliente.'}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <div className="glass-panel p-8 border border-white/10 bg-navy/20 backdrop-blur-xl sticky top-8">
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 mb-6 flex items-center justify-between">
              Processos Vinculados
              <span className="px-2 py-0.5 bg-white/5 border border-white/10 text-amber">{client.matters?.length || 0}</span>
            </h3>

            <div className="space-y-4">
              {client.matters && client.matters.length > 0 ? (
                client.matters.map((m: Matter) => (
                  <Link
                    key={m.id}
                    href={`/matters/${m.id}`}
                    className="block group p-4 border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-amber/40 transition-all"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={`text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 border ${m.status === 'ATIVO' ? 'border-green-500/20 text-green-400 bg-green-500/5' : 'border-white/10 text-white/40'}`}>
                        {m.status}
                      </span>
                      <ArrowRight size={12} className="text-white/20 group-hover:text-amber group-hover:translate-x-1 transition-all" />
                    </div>
                    <p className="text-sm font-bold text-white group-hover:text-amber transition-colors line-clamp-1">{m.title}</p>
                    <p className="text-[9px] font-mono text-white/20 mt-1 uppercase tracking-tighter">Ref: {m.id.slice(-6).toUpperCase()}</p>
                  </Link>
                ))
              ) : (
                <div className="py-12 text-center">
                  <Briefcase size={32} className="mx-auto text-white/5 mb-3" />
                  <p className="text-[10px] font-black text-white/20 uppercase tracking-widest">Sem processos ativos</p>
                </div>
              )}
            </div>

            {/* Abrir Novo Processo Sidebar Trigger */}
            <AddMatterModal 
              clientId={client.id}
              clientName={client.nome}
              trigger={
                <button className="w-full mt-8 py-4 border border-dashed border-white/10 text-[10px] font-black uppercase tracking-widest text-white/30 hover:border-amber/40 hover:text-amber hover:bg-amber/5 transition-all">
                  + Abrir Novo Processo
                </button>
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}
