"use client";

import { useState } from 'react';
import { FileText, Download, Globe, History, PenTool } from 'lucide-react';
import { toast } from 'sonner';
import DocumentHistoryDialog from './DocumentHistoryDialog';
import UploadDocumentModal from './UploadDocumentModal';
import SignDocumentModal from './documents/SignDocumentModal';

interface Document {
  id: string;
  filename: string;
  mimeType: string;
  isSharedWithClient?: boolean;
  signatureStatus?: 'PENDING' | 'SIGNED' | 'REJECTED';
  signatureType?: 'NONE' | 'SES' | 'AES' | 'QES';
  createdAt: string;
}

interface Props {
  matterId: string;
  documents: Document[];
}

export default function DocumentListPanel({ matterId, documents: initialDocuments }: Props) {
  const [documents, setDocuments] = useState(initialDocuments || []);
  const [loading, setLoading] = useState<string | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<{ id: string; filename: string } | null>(null);
  const [showUploadVersion, setShowUploadVersion] = useState<{ id: string; filename: string } | null>(null);
  const [showSignModal, setShowSignModal] = useState<{ id: string; filename: string } | null>(null);

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
              onClick={() => setSelectedDoc({ id: doc.id, filename: doc.filename })}
              title="Histórico de Versões"
              className="p-1 text-slate-400 hover:text-amber-500 transition-colors"
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSignModal({ id: doc.id, filename: doc.filename })}
              title="Solicitar Assinatura"
              className={`p-1 transition-colors ${doc.signatureStatus === 'SIGNED' ? 'text-emerald-500' : doc.signatureStatus === 'PENDING' ? 'text-amber-500 animate-pulse' : 'text-slate-400 hover:text-navy'}`}
            >
              <PenTool className="w-4 h-4" />
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

      {selectedDoc && (
        <DocumentHistoryDialog
          documentId={selectedDoc.id}
          filename={selectedDoc.filename}
          onClose={() => setSelectedDoc(null)}
          onUploadNewVersion={(id) => {
            setShowUploadVersion({ id, filename: selectedDoc.filename });
            setSelectedDoc(null);
          }}
        />
      )}

      {showUploadVersion && (
        <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4">
          <div className="bg-white p-2">
            <UploadDocumentModal 
              matterId={matterId} 
              parentVersionId={showUploadVersion.id}
              buttonText={`Substituir ${showUploadVersion.filename}`}
              onSuccess={() => {
                setShowUploadVersion(null);
                // In a real app we'd refresh the list, but for now toast is enough
                toast.success("Documento atualizado com sucesso.");
              }}
            />
            <button 
              onClick={() => setShowUploadVersion(null)}
              className="mt-2 w-full text-[10px] font-bold uppercase py-1 bg-slate-100 text-slate-500 hover:bg-slate-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {showSignModal && (
        <SignDocumentModal
          documentId={showSignModal.id}
          filename={showSignModal.filename}
          onClose={() => setShowSignModal(null)}
          onSuccess={() => {
            setShowSignModal(null);
            toast.success("Solicitação de assinatura enviada!");
          }}
        />
      )}
    </div>
  );
}
