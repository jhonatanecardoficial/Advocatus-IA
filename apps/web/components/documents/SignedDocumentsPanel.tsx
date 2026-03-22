"use client";

import { useState, useEffect } from 'react';
import { ShieldCheck, Download, ExternalLink, Calendar, User, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

function getCookie(name: string): string | undefined {
    if (typeof document === 'undefined') return undefined;
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop()?.split(';').shift();
    return undefined;
}

interface SignedDocument {
  id: string;
  documentId: string;
  signerName: string | null;
  signerNif: string | null;
  signedAt: string;
  validUntil: string | null;
  provider: string | null;
  fileUrl: string | null;
  signatureValid: boolean;
  document: {
    filename: string;
    mimeType: string;
  };
}

interface Props {
  matterId: string;
}

export default function SignedDocumentsPanel({ matterId }: Props) {
  const [signedDocs, setSignedDocs] = useState<SignedDocument[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSignedDocuments = async () => {
    const token = getCookie('accessToken');
    try {
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      
      const res = await fetch(`${API_URL}/qes/signed?matterId=${matterId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
        },
      });

      if (!res.ok) throw new Error('Falha ao carregar documentos assinados');
      
      const data = await res.json();
      setSignedDocs(data);
    } catch (err) {
      console.error(err);
      toast.error('Erro ao carregar lista de assinaturas.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSignedDocuments();
  }, [matterId]);

  const handleDownload = async () => {
    // In a real scenario, we'd fetch a signed URL from Supabase for this specific file
    toast.info('A preparar download do documento assinado...');
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="w-8 h-8 border-4 border-amber/20 border-t-amber rounded-full animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">A carregar assinaturas...</p>
      </div>
    );
  }

  if (signedDocs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 glass-panel border-dashed border-white/10">
        <ShieldCheck className="w-12 h-12 text-slate-700 mb-4 opacity-20" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Nenhum documento assinado digitalmente</p>
        <p className="text-[10px] text-slate-600 mt-2 font-medium">Use o botão de assinatura no repositório para começar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <AnimatePresence>
        {signedDocs.map((doc, index) => (
          <motion.div
            key={doc.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-panel p-5 border border-white/5 bg-white/2 hover:bg-white/5 transition-all group"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4 flex-1">
                <div className={`p-3 rounded-2xl flex-shrink-0 ${doc.signatureValid ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber/10 text-amber'}`}>
                  <FileCheck size={24} />
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-black text-white group-hover:text-amber transition-colors">
                    {doc.document.filename}
                  </h4>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <User size={12} className="text-amber/60" />
                      {doc.signerName || 'Signatário desconhecido'}
                      {doc.signerNif && <span className="text-slate-600 ml-1">({doc.signerNif})</span>}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      <Calendar size={12} className="text-amber/60" />
                      {new Date(doc.signedAt).toLocaleDateString('pt-PT')} {new Date(doc.signedAt).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {doc.signatureValid && (
                    <div className="flex items-center gap-1.5 mt-2">
                      <ShieldCheck size={12} className="text-emerald-400" />
                      <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">Assinatura Certificada AMA</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => handleDownload()}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-[10px] font-black uppercase tracking-widest hover:bg-amber hover:text-navy hover:border-amber transition-all group/btn"
                >
                  <Download size={14} className="group-hover/btn:scale-110 transition-transform" />
                  Transferir
                </button>
                <button
                  className="p-2.5 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white transition-all"
                  title="Verificar Validade"
                >
                  <ExternalLink size={16} />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
