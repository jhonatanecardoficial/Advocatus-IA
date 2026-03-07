import { cookies } from "next/headers";
import Link from "next/link";

interface InvoiceRow {
  id: string;
  reference: string;
  total: number | string;
  status: string;
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

export default async function BillingPage() {
  const invoices = await fetchInvoices();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div>
        <p className="text-xs uppercase tracking-widest text-amber-600 font-bold">Fase 1 • Task 008</p>
        <h1 className="text-3xl md:text-4xl font-display font-black tracking-tight text-navy">Faturação</h1>
      </div>

      <div className="bg-white border-2 border-navy overflow-hidden">
        <div className="grid grid-cols-12 bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-600 font-bold">
          <div className="col-span-3 p-3">Referência</div>
          <div className="col-span-3 p-3">Processo</div>
          <div className="col-span-3 p-3">Cliente</div>
          <div className="col-span-2 p-3 text-right">Total</div>
          <div className="col-span-1 p-3 text-right">Ação</div>
        </div>

        {invoices.length === 0 ? (
          <div className="p-6 text-sm text-slate-500">Sem faturas draft no momento.</div>
        ) : (
          invoices.map((invoice) => (
            <div key={invoice.id} className="grid grid-cols-12 border-b border-slate-100 text-sm">
              <div className="col-span-3 p-3">
                <p className="font-bold text-navy">{invoice.reference}</p>
                <p className="text-xs text-slate-500">{new Date(invoice.createdAt).toLocaleDateString("pt-PT")}</p>
              </div>
              <div className="col-span-3 p-3 text-slate-700">{invoice.matter?.title || "-"}</div>
              <div className="col-span-3 p-3 text-slate-700">{invoice.client?.name || "-"}</div>
              <div className="col-span-2 p-3 text-right font-bold text-navy">
                EUR {Number(invoice.total).toLocaleString("pt-PT", { minimumFractionDigits: 2 })}
              </div>
              <div className="col-span-1 p-3 text-right">
                {invoice.matter?.id ? (
                  <Link href={`/matters/${invoice.matter.id}`} className="text-amber-600 hover:underline text-xs font-bold">
                    Abrir
                  </Link>
                ) : (
                  <span className="text-xs text-slate-400">-</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
