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
  const [docToSign, setDocToSign] = useState<{ id: string; filename: string } | null>(null);

  const toggleShare = async (docId: string, currentStatus: boolean) => {
    setLoading(docId);
    try {
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
    return (
      <div className="flex flex-col items-center justify-center p-8 glass-panel border-dashed border-white/10">
        <FileText className="w-8 h-8 text-slate-600 mb-2 opacity-20" />
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Sem documentos</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 mb-4">
      {documents.map((doc, index) => (
        <div 
          key={doc.id} 
          className="flex items-center justify-between p-3 glass-panel border border-white/5 bg-white/5 hover:bg-white/10 transition-all group animate-reveal"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <div className="flex items-center gap-4 overflow-hidden">
            <div className="p-2 bg-navy-600/50 rounded-lg group-hover:bg-amber/20 transition-colors">
              <FileText className="text-amber w-4 h-4 shrink-0" />
            </div>
            <div className="flex flex-col truncate">
              <span className="text-xs font-bold text-white truncate group-hover:text-amber transition-colors" title={doc.filename}>
                {doc.filename}
              </span>
              <span className="text-[10px] text-slate-500 uppercase tracking-widest font-medium">
                {new Date(doc.createdAt).toLocaleDateString('pt-PT')}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => toggleShare(doc.id, !!doc.isSharedWithClient)}
              disabled={loading === doc.id}
              className={`badge-premium flex items-center gap-1.5 transition-all ${
                doc.isSharedWithClient 
                  ? 'badge-success hover:opacity-80' 
                  : 'border border-white/10 text-slate-400 hover:text-white hover:bg-white/10'
              }`}
              title={doc.isSharedWithClient ? "Visível no Portal" : "Não visível no Portal"}
            >
              <Globe className="w-3 h-3" />
              <span className="hidden sm:inline">{doc.isSharedWithClient ? 'Partilhado' : 'Partilhar'}</span>
            </button>
            <div className="h-4 w-[1px] bg-white/5 mx-1" />
            <button
              onClick={() => setSelectedDoc({ id: doc.id, filename: doc.filename })}
              title="Histórico"
              className="p-1.5 text-slate-400 hover:text-amber transition-all hover:scale-110"
            >
              <History className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDocToSign({ id: doc.id, filename: doc.filename })}
              title="Assinatura"
              className={`p-1.5 transition-all hover:scale-110 ${doc.signatureStatus === 'SIGNED' ? 'text-emerald-400' : doc.signatureStatus === 'PENDING' ? 'text-amber animate-pulse' : 'text-slate-400 hover:text-white'}`}
            >
              <PenTool className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleDownload(doc.id)}
              title="Download"
              className="p-1.5 text-slate-400 hover:text-white transition-all hover:scale-110"
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

      {docToSign && (
        <SignDocumentModal
          documentId={docToSign.id}
          filename={docToSign.filename}
          onClose={() => setDocToSign(null)}
          onSuccess={() => {
            setDocToSign(null);
            toast.success("Solicitação de assinatura enviada!");
          }}
        />
      )}
    </div>
  );
}
