"use client";

import { useEffect, useMemo, useState } from "react";
import { FileDown } from "lucide-react";
import { toast } from "sonner";

interface Invoice {
  id: string;
  reference: string;
  amount: number | string;
  vatRate: number | string;
  total: number | string;
  status: string;
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
    const token = localStorage.getItem("access_token");
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
      const token = localStorage.getItem("access_token");
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
      const token = localStorage.getItem("access_token");
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

  const totalDrafted = useMemo(
    () => invoices.reduce((sum, invoice) => sum + Number(invoice.total || 0), 0),
    [invoices],
  );

  return (
    <div className="space-y-4">
      <div className="bg-white border-2 border-navy p-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-navy mb-3">Gerar fatura draft</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold uppercase text-navy mb-2">IVA (%)</label>
            <input
              type="number"
              value={vatRate}
              onChange={(event) => setVatRate(Number(event.target.value || 0))}
              min={0}
              max={100}
              className="w-full border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={createDraft}
              disabled={loading}
              className="w-full px-4 py-2 bg-navy text-white font-bold uppercase text-xs tracking-wider hover:bg-amber-600 disabled:opacity-50"
            >
              {loading ? "A gerar..." : "Gerar Draft"}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border-2 border-slate-300 p-4">
        <div className="flex justify-between items-center">
          <p className="text-xs font-bold uppercase tracking-widest text-navy">Total draftado</p>
          <p className="text-xl font-black text-navy">
            EUR {totalDrafted.toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <div className="bg-white border-2 border-navy p-4">
        <h3 className="text-sm font-bold uppercase tracking-widest text-navy mb-3">Drafts do processo</h3>
        {invoices.length === 0 ? (
          <p className="text-sm text-slate-500">Sem drafts gerados para este processo.</p>
        ) : (
          <div className="space-y-2">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border border-slate-200 bg-slate-50">
                <div>
                  <p className="text-sm font-bold text-navy">{invoice.reference}</p>
                  <p className="text-xs text-slate-600">
                    {new Date(invoice.createdAt).toLocaleDateString("pt-PT")} • EUR{" "}
                    {Number(invoice.total).toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
                  </p>
                </div>
                <button
                  onClick={() => downloadDraftPdf(invoice.id)}
                  className="px-3 py-2 text-xs font-bold uppercase tracking-wider bg-navy text-white hover:bg-amber-600 inline-flex items-center gap-1"
                >
                  <FileDown size={14} />
                  PDF
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
