"use client";

import { useState, useEffect } from 'react';
import { X, History, Download, Loader2, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface Version {
  id: string;
  filename: string;
  version: number;
  createdAt: string;
  sizeBytes: number;
}

interface DocumentHistoryDialogProps {
  documentId: string;
  filename: string;
  onClose: () => void;
  onUploadNewVersion: (documentId: string) => void;
}

export default function DocumentHistoryDialog({ documentId, filename, onClose, onUploadNewVersion }: DocumentHistoryDialogProps) {
  const [history, setHistory] = useState<Version[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHistory() {
      try {
        const token = localStorage.getItem('access_token');
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
        const res = await fetch(`${API_URL}/documents/${documentId}/history`, {
          headers: { 'Authorization': token ? `Bearer ${token}` : '' }
        });

        if (!res.ok) throw new Error('Falha ao carregar histórico');
        const data = await res.json();
        setHistory(data);
      } catch (err) {
        toast.error('Erro ao carregar histórico de versões');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchHistory();
  }, [documentId]);

  const handleDownload = async (id: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      const res = await fetch(`${API_URL}/documents/${id}/download-url`, {
        headers: { 'Authorization': token ? `Bearer ${token}` : '' }
      });

      if (!res.ok) throw new Error('Erro ao baixar');
      const data = await res.json();
      window.open(data.signedUrl, '_blank');
    } catch (err) {
      toast.error('Falha ao descarregar esta versão');
    }
  };

  return (
    <div className="fixed inset-0 bg-navy/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
      <div className="bg-white border-4 border-navy w-full max-w-2xl shadow-[8px_8px_0px_#D4A853] flex flex-col max-h-[80vh]">
        <div className="bg-navy p-4 flex justify-between items-center">
          <h2 className="text-white font-display font-black uppercase tracking-widest text-sm flex items-center gap-2">
            <History size={16} className="text-amber-400" />
            Histórico: {filename}
          </h2>
          <button onClick={onClose} className="text-white hover:text-amber-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto flex-grow">
          {loading ? (
            <div className="flex flex-col items-center py-12 space-y-4">
              <Loader2 className="w-8 h-8 text-navy animate-spin" />
              <p className="text-xs font-bold uppercase text-navy opacity-50">Carregando histórico...</p>
            </div>
          ) : history.length === 0 ? (
            <p className="text-center py-12 text-sm text-slate-500">Apenas a versão atual está disponível.</p>
          ) : (
            <div className="space-y-4">
              {history.map((v, idx) => (
                <div key={v.id} className={`flex items-center justify-between p-3 border ${idx === 0 ? 'border-navy bg-slate-50' : 'border-slate-200 bg-white'} relative`}>
                  <div className="flex items-center gap-4">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${idx === 0 ? 'bg-navy text-white' : 'bg-slate-100 text-slate-500'}`}>
                        v{v.version}
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-navy">
                        {v.filename}
                        {idx === 0 && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-2 py-0.5 rounded uppercase">Atual</span>}
                      </p>
                      <p className="text-[10px] text-slate-500 uppercase">
                        {new Date(v.createdAt).toLocaleString('pt-PT')} • {(v.sizeBytes / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => handleDownload(v.id)}
                    className="p-2 text-slate-400 hover:text-navy hover:bg-slate-100 transition-all rounded"
                    title="Download desta versão"
                  >
                    <Download size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="p-4 border-t-2 border-slate-100 bg-slate-50 flex justify-end gap-3">
          <button
            onClick={() => onUploadNewVersion(documentId)}
            className="flex items-center gap-2 px-4 py-2 bg-navy text-white text-xs font-bold uppercase tracking-wider hover:bg-amber-600 transition-colors shadow-[4px_4px_0px_#D4A853] hover:shadow-none translate-y-[-2px] hover:translate-y-0"
          >
            <Plus size={14} /> Nova Versão
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 border-2 border-navy text-xs font-bold uppercase tracking-widest hover:bg-slate-100 transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
