import { cookies } from "next/headers";
import { TrendingUp } from "lucide-react";

async function fetchProfitabilityData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) return { reports: [] };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

  try {
    const res = await fetch(`${API_URL}/reports/profitability`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });

    if (!res.ok) return { reports: [] };
    const result = await res.json();
    return { reports: result.data || [] };
  } catch (e) {
    return { reports: [] };
  }
}

export default async function ProfitabilityPage() {
  const { reports } = await fetchProfitabilityData();

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header */}
      <div className="border-b-2 border-navy pb-6">
        <h1 className="text-5xl font-display font-black text-navy uppercase tracking-tighter flex items-center gap-4">
          <TrendingUp size={48} className="text-green-600" />
          Rentabilidade
        </h1>
        <p className="text-slate-500 mt-2 font-mono text-sm uppercase tracking-widest">
          Análise Financeira por Processo • Real-time
        </p>
      </div>

      {/* Report Table */}
      <div className="bg-white border-2 border-navy shadow-[8px_8px_0px_#D4A853]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-navy text-white">
              <tr>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest border-r border-navy-700">Processo / Cliente</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest border-r border-navy-700 text-right">Faturado (€)</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest border-r border-navy-700 text-right">Custos (€)</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest border-r border-navy-700 text-right">Lucro (€)</th>
                <th className="py-4 px-6 text-xs font-bold uppercase tracking-widest text-right">Margem (%)</th>
              </tr>
            </thead>
            <tbody className="font-mono text-sm">
              {reports.map((report: any) => (
                <tr key={report.id} className="border-b-2 border-navy hover:bg-slate-50 transition-colors">
                  <td className="py-4 px-6 border-r border-navy-200">
                    <div className="font-bold text-navy uppercase">{report.title}</div>
                    <div className="text-[10px] text-slate-500 font-sans">{report.client}</div>
                  </td>
                  <td className="py-4 px-6 border-r border-navy-200 text-right font-bold text-navy">
                    {report.revenue.toFixed(2)}€
                  </td>
                  <td className="py-4 px-6 border-r border-navy-200 text-right text-red-600">
                    {report.costs.toFixed(2)}€
                  </td>
                  <td className={`py-4 px-6 border-r border-navy-200 text-right font-bold ${report.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {report.profit.toFixed(2)}€
                  </td>
                  <td className="py-4 px-6 text-right">
                    <span className={`px-2 py-1 border-2 font-bold ${report.margin > 20 ? 'bg-green-100 border-green-600 text-green-700' : 'bg-amber-100 border-amber-600 text-amber-700'}`}>
                      {report.margin.toFixed(1)}%
                    </span>
                  </td>
                </tr>
              ))}
              {reports.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400 italic">
                    Nenhum dado financeiro disponível para os processos atuais.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="p-6 border-2 border-navy bg-white">
           <div className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-4">Total Revenue</div>
           <div className="text-3xl font-black text-navy font-display uppercase tracking-tight">
             {reports.reduce((acc: number, curr: any) => acc + curr.revenue, 0).toFixed(2)}€
           </div>
        </div>
        <div className="p-6 border-2 border-navy bg-white">
           <div className="text-[10px] font-bold uppercase text-slate-500 tracking-widest mb-4">Total Profit</div>
           <div className="text-3xl font-black text-green-600 font-display uppercase tracking-tight">
             {reports.reduce((acc: number, curr: any) => acc + curr.profit, 0).toFixed(2)}€
           </div>
        </div>
        <div className="p-6 border-2 border-navy bg-navy text-white">
           <div className="text-[10px] font-bold uppercase text-amber-500 tracking-widest mb-4">Avg Margin</div>
           <div className="text-3xl font-black text-white font-display uppercase tracking-tight">
             {(reports.reduce((acc: number, curr: any) => acc + curr.margin, 0) / (reports.length || 1)).toFixed(1)}%
           </div>
        </div>
      </div>
    </div>
  );
}
