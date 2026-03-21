"use client";

import { useEffect, useMemo, useState } from "react";
import { FileDown, Plus, ReceiptText, Percent, ShieldCheck, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Invoice {
  id: string;
  reference: string;
  amount: number | string;
  vatRate: number | string;
  total: number | string;
  status: string;
  isCertified: boolean;
  hashControl?: string;
  atcud?: string;
  createdAt: string;
}

interface InvoiceDraftPanelProps {
  matterId: string;
}

export default function InvoiceDraftPanel({ matterId }: InvoiceDraftPanelProps) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [vatRate, setVatRate] = useState(23);

  async function loadInvoices() {
    const token = localStorage.getItem("accessToken");
    const res = await fetch(`${API_URL}/invoices?matter_id=${matterId}`, {
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    if (res.ok) {
      const data = await res.json();
      setInvoices(data);
    }
  }

  useEffect(() => {
    if (matterId) {
      loadInvoices().catch(() => undefined);
    }
  }, [matterId]);

  async function createDraft() {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/invoices/draft`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: token ? `Bearer ${token}` : "",
        },
        body: JSON.stringify({
          matter_id: matterId,
          vat_rate: vatRate,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.message || "Não foi possível gerar o draft.");
      }

      toast.success(`Draft ${body.reference} gerado com sucesso.`);
      await loadInvoices();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function downloadDraftPdf(invoiceId: string) {
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/invoices/${invoiceId}/pdf`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });
      if (!res.ok) {
        throw new Error("Não foi possível gerar o PDF draft.");
      }

      const data = await res.json();
      const bytes = Uint8Array.from(atob(data.content_base64), (c) => c.charCodeAt(0));
      const blob = new Blob([bytes], { type: data.mime_type || "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename || "fatura-draft.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      toast.success("Draft exportado.");
    } catch (error) {
      toast.error((error as Error).message);
    }
  }

  async function finalizeInvoice(invoiceId: string) {
    if (!confirm("AVISO LEGAL AT: Ao finalizar, esta fatura será assinada digitalmente e tornar-se-á IMUTÁVEL. Não poderá ser alterada ou apagada. Deseja continuar?")) {
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await fetch(`${API_URL}/invoices/${invoiceId}/finalize`, {
        method: "POST",
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(body?.message || "Erro ao certificar fatura.");
      }

      toast.success(`Fatura ${body.reference} certificada com sucesso!`);
      await loadInvoices();
    } catch (error) {
      toast.error((error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const totalDrafted = useMemo(
    () => invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0),
    [invoices],
  );

  return (
    <div className="space-y-6">
      {/* Summary Area */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-panel p-8 relative overflow-hidden bg-amber/5 group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
          <ReceiptText size={120} className="text-amber" />
        </div>
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 relative z-10">
          <div className="text-center md:text-left">
            <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] mb-1">Total Provisional Faturado</h3>
            <div className="flex items-baseline gap-2">
              <span className="text-5xl font-display font-black text-white leading-none">
                €{totalDrafted.toLocaleString('pt-PT', { minimumFractionDigits: 0 })}
              </span>
              <span className="text-sm font-bold text-amber/60 uppercase">Drafts</span>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end">
            <span className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest">
              {invoices.length} PROPOSTAS
            </span>
          </div>
        </div>
      </motion.div>

      {/* Generator Form */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-panel p-6 space-y-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase text-slate-500 tracking-widest pl-1">Taxa de IVA Aplicável</label>
            <div className="relative">
              <input
                type="number"
                value={vatRate}
                onChange={(event) => setVatRate(Number(event.target.value || 0))}
                min={0}
                max={100}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-amber/50 outline-none transition-all pl-10"
              />
              <Percent size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            </div>
          </div>
          <div className="flex items-end">
            <button
              onClick={createDraft}
              disabled={loading}
              className="w-full px-6 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-amber hover:text-navy hover:border-amber transition-all disabled:opacity-30 disabled:hover:bg-white/5 flex items-center justify-center gap-2"
            >
              {loading ? "A processar..." : (
                <>
                  <Plus size={14} /> Gerar Nova Proforma
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Drafts List */}
      <AnimatePresence>
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h3 className="text-[10px] font-black uppercase text-slate-500 tracking-[0.2em] px-2">Histórico de Proformas</h3>
          
          {invoices.length === 0 ? (
            <div className="glass-panel p-10 text-center border-dashed border-white/10 bg-transparent">
              <ReceiptText size={40} className="mx-auto text-slate-700 mb-3 opacity-20" />
              <p className="text-xs text-slate-600 font-medium uppercase tracking-widest">Sem faturas draft geradas</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((invoice, idx) => (
                <motion.div 
                  key={invoice.id} 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group flex items-center justify-between p-4 glass-panel border border-white/5 bg-white/2 hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className={`p-3 rounded-2xl ${invoice.isCertified ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber/10 text-amber'}`}>
                      {invoice.isCertified ? <ShieldCheck size={20} /> : <Clock size={20} />}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-sm font-black text-white tracking-tight">{invoice.reference}</span>
                        {invoice.isCertified ? (
                          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-[9px] font-black text-emerald-500 uppercase tracking-tighter border border-emerald-500/20">
                            <CheckCircle2 size={10} /> Certificada
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full bg-amber/10 text-[9px] font-black text-amber uppercase tracking-tighter border border-amber/20">
                            Proforma / Draft
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 opacity-60">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                          {new Date(invoice.createdAt).toLocaleDateString("pt-PT")}
                        </p>
                        <span className="w-1 h-1 rounded-full bg-slate-700" />
                        <p className="text-sm font-black text-white">
                          €{Number(invoice.total).toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
                        </p>
                        {invoice.atcud && (
                           <>
                             <span className="w-1 h-1 rounded-full bg-slate-700" />
                             <p className="text-[9px] font-mono text-slate-400">ATCUD: {invoice.atcud}</p>
                           </>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    {!invoice.isCertified && (
                      <button
                        onClick={() => finalizeInvoice(invoice.id)}
                        disabled={loading}
                        className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500 border border-emerald-500/20 rounded-xl text-emerald-500 hover:text-navy transition-all text-[9px] font-black uppercase tracking-widest disabled:opacity-30 flex items-center gap-2"
                        title="Emitir Fatura Definitiva"
                      >
                        {loading ? "..." : (
                          <>
                            <ShieldCheck size={12} /> Certificar
                          </>
                        )}
                      </button>
                    )}
                    <button
                      onClick={() => downloadDraftPdf(invoice.id)}
                      className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all group-hover:border-amber/30 flex items-center justify-center"
                      title={invoice.isCertified ? "Download Fatura" : "Download Draft"}
                    >
                      <FileDown size={18} />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
