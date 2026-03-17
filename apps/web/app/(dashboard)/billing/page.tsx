import { cookies } from "next/headers";
import Link from "next/link";
import { Wallet, ArrowRight, FileText, Calendar, TrendingUp } from "lucide-react";
import SaftExportPanel from "@/components/SaftExportPanel";
 
interface InvoiceRow {
  id: string;
  reference: string;
  total: number | string;
  status: string;
  isCertified?: boolean;
  createdAt: string;
  matter?: { id: string; title: string };
  client?: { id: string; name: string };
}
 
async function fetchInvoices(): Promise<InvoiceRow[]> {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) {
    return [];
  }
 
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
  const res = await fetch(`${API_URL}/invoices`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
 
  if (!res.ok) {
    return [];
  }
 
  return res.json();
}

async function fetchTenant(token: string) {
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
  const res = await fetch(`${API_URL}/tenants/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!res.ok) return null;
  const data = await res.json();
  return data.data;
}
 
export default async function BillingPage() {
  const token = (await cookies()).get("access_token")?.value;
  if (!token) return null;

  const [invoices, tenant] = await Promise.all([
    fetchInvoices(),
    fetchTenant(token)
  ]);
 
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
          <div>
              <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                      <Wallet className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.3em]">Financeiro</span>
              </div>
              <h1 className="text-4xl font-display font-black text-white uppercase tracking-tighter leading-none">
                  Gestão de Faturação
              </h1>
              <p className="text-white/40 mt-3 font-mono text-[10px] uppercase tracking-widest">
                  Workspace ativo • {invoices.length} faturações em processamento
              </p>
          </div>
          <div className="flex gap-4">
              <button className="px-6 py-4 text-[10px] font-black uppercase tracking-widest bg-emerald-500 text-navy shadow-[0_0_20px_rgba(16,185,129,0.2)] hover:scale-[1.02] transition-all">
                  Nova Fatura
              </button>
          </div>
      </div>

      {/* SAF-T and Fiscal Config Section */}
      <SaftExportPanel token={token} tenantDetails={tenant} />
  
      {/* Table Area */}
      <div className="glass-panel border border-white/10 overflow-hidden bg-navy/20 backdrop-blur-xl">
        <div className="grid grid-cols-12 bg-white/5 border-b border-white/5 text-[9px] uppercase tracking-[0.2em] text-white/40 font-black p-4">
          <div className="col-span-3">IDENTIFICAÇÃO</div>
          <div className="col-span-3">PROCESSO / CLIENTE</div>
          <div className="col-span-3">DATA DE EMISSÃO</div>
          <div className="col-span-2 text-right">MONTANTE TOTAL</div>
          <div className="col-span-1 text-right">AÇÕES</div>
        </div>
 
        {invoices.length === 0 ? (
          <div className="p-20 text-center">
            <TrendingUp className="w-12 h-12 text-white/5 mx-auto mb-4" />
            <p className="text-xs font-bold text-white/30 uppercase tracking-widest">Sem faturas draft no momento.</p>
          </div>
        ) : (
          invoices.map((invoice) => (
            <div key={invoice.id} className="grid grid-cols-12 border-b border-white/5 text-sm p-4 hover:bg-white/[0.02] transition-colors group">
              <div className="col-span-3 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-white/20 group-hover:text-amber transition-colors font-mono text-[10px] font-bold">
                  INV
                </div>
                <div>
                  <p className="font-bold text-white text-xs uppercase tracking-wider">{invoice.reference}</p>
                  <span className="text-[9px] text-white/20 font-mono tracking-tighter font-medium">#{invoice.id.slice(-6).toUpperCase()}</span>
                </div>
              </div>
              <div className="col-span-3 flex flex-col justify-center">
                <div className="flex items-center gap-1.5 text-white/60 mb-1">
                   <FileText size={10} className="text-amber/60" />
                   <p className="text-[11px] font-bold truncate">{invoice.matter?.title || "Sem Processo"}</p>
                </div>
                <div className="flex items-center gap-1.5 text-white/30">
                   <div className="w-1 h-1 rounded-full bg-white/20"></div>
                   <p className="text-[10px] font-medium truncate">{invoice.client?.name || "-"}</p>
                </div>
              </div>
              <div className="col-span-3 flex items-center text-white/40 font-mono text-xs">
                <Calendar size={12} className="mr-2 text-white/20" />
                {new Date(invoice.createdAt).toLocaleDateString("pt-PT")}
                {invoice.isCertified && (
                    <div className="ml-4 flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black text-[8px] uppercase tracking-tighter shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                        <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse"></div>
                        Certificada
                    </div>
                )}
              </div>
              <div className="col-span-2 flex items-center justify-end font-mono text-sm font-black text-amber-400">
                <span className="text-[10px] text-amber-400/50 mr-2">€</span>
                {Number(invoice.total).toLocaleString("pt-PT", { minimumFractionDigits: 2, style: 'currency', currency: 'EUR' }).replace('€', '')}
              </div>
              <div className="col-span-1 flex items-center justify-end">
                {invoice.matter?.id ? (
                  <Link href={`/matters/${invoice.matter.id}`} className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center text-white/30 hover:border-amber hover:text-amber hover:bg-amber/10 transition-all">
                    <ArrowRight size={14} />
                  </Link>
                ) : (
                  <span className="text-xs text-white/10">-</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
