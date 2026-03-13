"use client";

import { useState } from 'react';
import { FileText, Download, Globe } from 'lucide-react';
import { toast } from 'sonner';

interface Document {
  id: string;
  filename: string;
  mimeType: string;
  isSharedWithClient?: boolean;
  createdAt: string;
}

interface Props {
  matterId: string;
  documents: Document[];
}

export default function DocumentListPanel({ matterId, documents: initialDocuments }: Props) {
  const [documents, setDocuments] = useState(initialDocuments || []);
  const [loading, setLoading] = useState<string | null>(null);

  const toggleShare = async (docId: string, currentStatus: boolean) => {
    setLoading(docId);
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      
      const res = await fetch(`${API_URL}/documents/${docId}/share`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ isSharedWithClient: !currentStatus }),
      });

      if (!res.ok) throw new Error('Falha ao atualizar permissão');
      
      setDocuments(docs => 
        docs.map(d => d.id === docId ? { ...d, isSharedWithClient: !currentStatus } : d)
      );
      toast.success(
        !currentStatus 
          ? 'Documento partilhado com o cliente no portal.' 
          : 'Documento ocultado do portal do cliente.'
      );
    } catch (err) {
      toast.error('Erro ao alterar partilha do documento.');
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const handleDownload = async (docId: string) => {
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      
      const res = await fetch(`${API_URL}/documents/${docId}/download-url`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!res.ok) throw new Error('Falha ao obter link de download');
      
      const data = await res.json();
      
      window.open(data.signedUrl, '_blank');
      toast.success('Download iniciado!');
    } catch (error) {
      console.error(error);
      toast.error('Erro ao transferir documento.');
    }
  };

  if (documents.length === 0) {
    return <p className="text-xs text-slate-500 mb-4">Nenhum documento anexado ainda.</p>;
  }

  return (
    <div className="space-y-2 mb-4">
      {documents.map(doc => (
        <div key={doc.id} className="flex items-center justify-between p-2 border border-slate-200 bg-slate-50 hover:border-navy transition-colors">
          <div className="flex items-center gap-3 overflow-hidden">
            <FileText className="text-navy w-4 h-4 shrink-0" />
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-navy truncate" title={doc.filename}>{doc.filename}</span>
              <span className="text-[10px] text-slate-500">{new Date(doc.createdAt).toLocaleDateString('pt-PT')}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => toggleShare(doc.id, !!doc.isSharedWithClient)}
              disabled={loading === doc.id}
              className={`flex items-center gap-1 px-2 py-1 text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                doc.isSharedWithClient 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' 
                  : 'bg-white text-slate-500 border-slate-300 hover:bg-slate-100'
              }`}
              title={doc.isSharedWithClient ? "Visível no Portal" : "Não visível no Portal"}
            >
              <Globe className="w-3 h-3" />
              {doc.isSharedWithClient ? 'Partilhado' : 'Partilhar'}
            </button>
            <button
              onClick={() => handleDownload(doc.id)}
              title="Descarregar"
              className="p-1 text-slate-400 hover:text-navy transition-colors"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
