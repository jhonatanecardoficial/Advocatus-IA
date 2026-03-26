'use client';

import { seedTestClients } from '@/app/actions/seed-clients';
import { useState } from 'react';

export default function SeedPage() {
  const [status, setStatus] = useState<string>('Pronto para inserir clientes...');
  const [loading, setLoading] = useState(false);

  const handleSeed = async () => {
    setLoading(true);
    setStatus('A inserir clientes de teste...');
    try {
      const result = await seedTestClients();
      if (result.success) {
        setStatus('Sucesso! 7 clientes de teste inseridos.');
      } else {
        setStatus(`Erro: ${result.message}`);
      }
    } catch (err: any) {
      setStatus(`Erro inesperado: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-20 bg-navy min-h-screen text-white flex flex-col items-center gap-10">
      <h1 className="text-4xl font-black uppercase tracking-widest text-amber">Seed de Clientes de Teste</h1>
      <p className="text-white/60 text-lg uppercase font-mono tracking-wider">{status}</p>
      <button
        onClick={handleSeed}
        disabled={loading}
        className="px-10 py-5 bg-amber text-navy font-black uppercase tracking-widest rounded-none hover:scale-105 active:scale-95 transition-all shadow-glow disabled:opacity-50"
      >
        {loading ? 'A processar...' : 'Executar Seed'}
      </button>
      <a href="/dashboard" className="text-amber/40 hover:text-amber text-xs uppercase tracking-widest border-b border-amber/20 pb-1 mt-10">
        Voltar ao Dashboard
      </a>
    </div>
  );
}
