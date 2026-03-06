"use client";

import { useState } from 'react';
import { toast } from 'sonner';

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

interface Props {
  client: Client;
}

export default function ClientDetail({ client: initialClient }: Props) {
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
    setForm((f) => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  }

  async function save() {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${API_URL}/clients/${client.id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error('Falha ao atualizar');
      const data = await res.json();
      setClient(data);
      toast.success('Cliente atualizado');
      setIsEditing(false);
    } catch (err) {
      toast.error((err as Error).message || 'Erro');
    } finally {
      setLoading(false);
    }
  }

  async function checkConflict() {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const payload = {
        nome: form.nome,
        nif: form.nif,
        email: form.email || undefined,
        telefone: form.telefone || undefined,
      };
      const res = await fetch(`${API_URL}/clients/conflict-check`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: token ? `Bearer ${token}` : undefined,
        },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Falha no conflict check');
      const data = await res.json();
      if (data.hasConflicts) {
        toast.error('Foram encontrados possíveis conflitos');
      } else {
        toast.success('Sem conflitos');
      }
    } catch (err) {
      toast.error((err as Error).message || 'Erro');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-display font-black text-navy uppercase tracking-tighter">
          Ficha de cliente
        </h1>
        <div className="flex gap-2">
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
                className="px-4 py-2 text-sm font-bold uppercase tracking-widest bg-navy text-white hover:bg-amber-600 transition-colors"
              >
                {loading ? 'Gravando...' : 'Salvar'}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 text-sm font-bold uppercase tracking-widest bg-navy text-white hover:bg-amber-600 transition-colors"
              >
                Editar
              </button>
              <button
                onClick={checkConflict}
                disabled={loading}
                className="px-4 py-2 text-sm font-bold uppercase tracking-widest bg-amber-500 text-navy hover:bg-amber-600 transition-colors"
              >
                {loading ? 'Verificando...' : 'Conflict check'}
              </button>
            </>
          )}
        </div>
      </div>

      <div className="bg-white border-2 border-navy p-6">
        {isEditing ? (
          <form className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Nome</label>
                <input
                  name="nome"
                  value={form.nome}
                  onChange={handleChange}
                  className="w-full border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-navy">NIF</label>
                <input
                  name="nif"
                  value={form.nif}
                  onChange={handleChange}
                  className="w-full border border-slate-300 px-3 py-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Email</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full border border-slate-300 px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase text-navy">Telefone</label>
                <input
                  name="telefone"
                  value={form.telefone}
                  onChange={handleChange}
                  className="w-full border border-slate-300 px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-navy">Endereço</label>
              <textarea
                name="address"
                value={form.address}
                onChange={handleChange}
                className="w-full border border-slate-300 px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase text-navy">Notas</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                className="w-full border border-slate-300 px-3 py-2"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                name="gdprConsent"
                checked={form.gdprConsent}
                onChange={handleChange}
              />
              <label className="text-xs">Consentimento GDPR registado</label>
            </div>
          </form>
        ) : (
          <div className="space-y-2">
            <div className="flex flex-wrap gap-4">
              <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 border ${
                client.tipo === 'SINGULAR'
                  ? 'border-navy text-navy bg-slate-50'
                  : 'border-amber-600 text-amber-800 bg-amber-50'
              }`}>{client.tipo}</span>
            </div>
            <h2 className="text-2xl font-display font-bold text-navy">{client.nome}</h2>
            <p className="font-mono text-sm text-slate-500">NIF: {client.nif}</p>
            {client.email && (
              <p className="font-mono text-sm text-slate-500">Email: {client.email}</p>
            )}
            {client.telefone && (
              <p className="font-mono text-sm text-slate-500">Telefone: {client.telefone}</p>
            )}
            {client.address && (
              <p className="font-mono text-sm text-slate-500">Endereço: {client.address}</p>
            )}
            {client.notes && (
              <p className="font-mono text-sm text-slate-500">Notas: {client.notes}</p>
            )}
            <p className="font-mono text-xs text-slate-400">
              GDPR consent: {client.gdprConsentAt ? new Date(client.gdprConsentAt).toLocaleDateString() : 'não' }
            </p>
          </div>
        )}
      </div>

      {client.matters && client.matters.length > 0 && (
        <div className="bg-white border-2 border-navy p-6">
          <h3 className="text-lg font-bold text-navy mb-4">Processos recentes</h3>
          <ul className="space-y-2">
            {client.matters.map((m) => (
              <li key={m.id}>
                <Link
                  href={`/matters/${m.id}`}
                  className="text-amber-500 hover:underline"
                >
                  {m.title} ({m.status})
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
