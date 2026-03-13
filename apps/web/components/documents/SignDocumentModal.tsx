"use client";

import { useState } from 'react';
import { X, PenTool, CheckCircle2, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

interface Props {
  documentId: string;
  filename: string;
  onClose: () => void;
  onSuccess: () => void;
}

type SignatureType = 'SES' | 'AES' | 'QES';

export default function SignDocumentModal({ documentId, filename, onClose, onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<SignatureType>('AES');

  const handleRequest = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';
      
      const res = await fetch(`${API_URL}/documents/${documentId}/request-signature`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : '',
        },
        body: JSON.stringify({ signatureType: selectedType }),
      });

      if (!res.ok) throw new Error('Falha ao solicitar assinatura');
      
      toast.success(`Solicitação de assinatura ${selectedType} enviada com sucesso.`);
      onSuccess();
    } catch (err) {
      toast.error('Erro ao processar pedido de assinatura.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const types = [
    {
      id: 'SES' as SignatureType,
      title: 'Simples (SES)',
      desc: 'Para comunicações internas e documentos de baixo risco.',
      icon: PenTool,
    },
    {
      id: 'AES' as SignatureType,
      title: 'Avançada (AES)',
      desc: 'Garante a identidade e integridade. Ideal para contratos standard.',
      icon: CheckCircle2,
    },
    {
      id: 'QES' as SignatureType,
      title: 'Qualificada (QES)',
      desc: 'Valor probatório pleno (CMD / Cartão de Cidadão). Para escrituras e atos solenes.',
      icon: ShieldCheck,
      premium: true,
    }
  ];

  return (
    <div className="fixed inset-0 bg-navy/80 backdrop-blur-sm z-[70] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-md border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="bg-navy p-4 flex justify-between items-center">
          <h3 className="text-white text-xs font-bold uppercase tracking-widest">Solicitar Assinatura</h3>
          <button onClick={onClose} className="text-white/70 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <p className="text-[10px] text-slate-500 uppercase font-black mb-1">Documento selecionado</p>
            <p className="text-sm font-bold text-navy truncate">{filename}</p>
          </div>

          <div className="space-y-3 mb-8">
            <p className="text-[10px] text-slate-500 uppercase font-black">Tipo de Assinatura (eIDAS)</p>
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedType(t.id)}
                className={`w-full flex items-start gap-4 p-4 border transition-all text-left ${
                  selectedType === t.id 
                    ? 'border-navy bg-navy/5 shadow-inner' 
                    : 'border-slate-200 hover:border-navy/30 hover:bg-slate-50'
                }`}
              >
                <t.icon className={`w-5 h-5 shrink-0 ${selectedType === t.id ? 'text-navy' : 'text-slate-400'}`} />
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs font-bold uppercase tracking-wide ${selectedType === t.id ? 'text-navy' : 'text-slate-700'}`}>
                      {t.title}
                    </span>
                    {t.premium && (
                      <span className="text-[8px] bg-amber-100 text-amber-700 px-1 font-black rounded cursor-help" title="Requer Chave Móvel Digital">LEGAL+</span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-500 leading-relaxed">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>

          <div className="bg-slate-50 border-l-2 border-amber-500 p-3 mb-6 flex gap-3">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <p className="text-[10px] text-slate-600 leading-normal italic">
              O signatário receberá um link seguro via email para completar o processo de autenticação.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={onClose}
              className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:bg-slate-100 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleRequest}
              disabled={loading}
              className="flex-1 py-3 text-[10px] font-bold uppercase tracking-widest bg-navy text-white hover:bg-navy/90 transition-all disabled:opacity-50"
            >
              {loading ? 'A processar...' : 'Enviar Pedido'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
