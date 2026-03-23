import { cookies } from "next/headers";
import Link from "next/link";
import { 
  TrendingUp, 
  Scale, 
  Users, 
  Calendar, 
  AlertTriangle, 
  ChevronRight, 
  Activity, 
  PieChart, 
  BarChart3,
  ArrowRight
} from "lucide-react";

async function fetchReportMetrics() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return { metrics: null, financials: null };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

  try {
    const [metricsRes, profitRes] = await Promise.all([
      fetch(`${API_URL}/reports/dashboard-metrics`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch(`${API_URL}/reports/profitability`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
    ]);

    const metrics = metricsRes.ok ? (await metricsRes.json()).data : null;
    const profitData = profitRes.ok ? (await profitRes.json()).data : [];

    // Aggregate financials
    let financials = { revenue: 0, costs: 0, profit: 0, avgMargin: 0 };
    if (Array.isArray(profitData) && profitData.length > 0) {
      financials.revenue = profitData.reduce((acc, curr) => acc + curr.revenue, 0);
      financials.costs = profitData.reduce((acc, curr) => acc + curr.costs, 0);
      financials.profit = profitData.reduce((acc, curr) => acc + curr.profit, 0);
      financials.avgMargin = profitData.reduce((acc, curr) => acc + curr.margin, 0) / profitData.length;
    }

    return { metrics, financials };
  } catch (e) {
    return { metrics: null, financials: null };
  }
}

export default async function ReportsHubPage() {
  const { metrics, financials } = await fetchReportMetrics();

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-navy pb-6">
        <div>
          <h1 className="text-5xl font-display font-black text-navy uppercase tracking-tighter flex items-center gap-4">
            <Activity size={48} className="text-amber" />
            Hub de Relatórios
          </h1>
          <p className="text-slate-500 mt-2 font-mono text-sm uppercase tracking-widest">
            Visão Global do Escritório • Cockpit Financeiro e de Risco
          </p>
        </div>
      </div>

      {/* Cockpit Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        
        {/* Pilar 1: Saúde Financeira */}
        <div className="flex flex-col h-full bg-white border-2 border-navy shadow-[8px_8px_0px_#D4A853] p-8 group relative overflow-hidden">
          <div className="absolute -right-8 -top-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <TrendingUp size={160} className="text-navy" />
          </div>
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="p-3 bg-amber/20 rounded-xl border border-amber/40">
              <PieChart size={24} className="text-navy" />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-navy">Faturação & Custos</h2>
          </div>
          
          <div className="space-y-6 flex-grow relative z-10">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Receita Mensal Global</p>
              <p className="text-4xl font-display font-black text-navy tracking-tight">
                {financials?.revenue ? `${financials.revenue.toFixed(2)}€` : '0.00€'}
              </p>
            </div>
            <div className="flex justify-between items-center border-t border-slate-100 pt-4">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Lucro Restante</p>
                <p className={`text-xl font-black ${(financials?.profit ?? 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {financials?.profit ? `${financials.profit.toFixed(2)}€` : '0.00€'}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">Margem Média</p>
                <p className="text-xl font-black text-navy">
                  {financials?.avgMargin ? `${financials.avgMargin.toFixed(1)}%` : '0.0%'}
                </p>
              </div>
            </div>
          </div>

          <Link href="/reports/profitability" className="mt-8 pt-6 border-t border-slate-200">
            <button className="w-full py-4 px-6 bg-navy text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-xl flex items-center justify-between hover:bg-navy-800 transition-colors group-hover:shadow-lg">
              <span>Análise Entidade / Cliente</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>

        {/* Pilar 2: Produtividade */}
        <div className="flex flex-col h-full bg-slate-50 border-2 border-slate-200 p-8 group relative overflow-hidden">
          <div className="absolute -right-8 -top-8 opacity-5 group-hover:opacity-10 transition-opacity">
            <BarChart3 size={160} className="text-slate-600" />
          </div>
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-sm">
              <Users size={24} className="text-slate-700" />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-slate-800">Produtividade</h2>
          </div>
          
          <div className="space-y-6 flex-grow relative z-10">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
                <Scale size={16} className="text-slate-400 mb-2" />
                <p className="text-2xl font-black text-slate-800">{metrics?.activeMatters ?? 0}</p>
                <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mt-1">Processos Ativos</p>
              </div>
              <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm">
                <Users size={16} className="text-slate-400 mb-2" />
                <p className="text-2xl font-black text-slate-800">{metrics?.newClients ?? 0}</p>
                <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mt-1">Novos Clientes</p>
              </div>
            </div>
            <div className="bg-white p-4 border border-slate-200 rounded-xl shadow-sm flex justify-between items-center">
               <div>
                 <p className="text-[9px] uppercase font-bold text-slate-500 tracking-widest mb-1">Tarefas Pendentes (7 Dias)</p>
                 <p className="text-3xl font-black text-slate-800">{metrics?.upcomingTasks ?? 0}</p>
               </div>
               <Calendar size={32} className="text-amber opacity-30" />
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <button className="w-full py-4 px-6 bg-white border-2 border-slate-200 text-slate-600 text-[11px] font-bold uppercase tracking-[0.2em] rounded-xl flex items-center justify-between opacity-50 cursor-not-allowed" title="Em breve">
              <span>Métricas de Equipa (Brevemente)</span>
            </button>
          </div>
        </div>

        {/* Pilar 3: Risco Operacional */}
        <div className="flex flex-col h-full bg-red-50 border-2 border-red-200 p-8 group relative overflow-hidden">
          <div className="absolute -right-8 -top-8 opacity-10 group-hover:opacity-20 transition-opacity">
            <AlertTriangle size={160} className="text-red-500" />
          </div>
          <div className="flex items-center gap-3 mb-8 relative z-10">
            <div className="p-3 bg-red-100 rounded-xl border border-red-200 shadow-sm">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <h2 className="text-xl font-bold uppercase tracking-widest text-red-900">Risco Legal</h2>
          </div>
          
          <div className="space-y-6 flex-grow relative z-10">
            <div>
              <p className="text-[10px] uppercase font-bold text-red-400 tracking-widest mb-1">Prazos Fatais</p>
              <div className="flex items-baseline gap-2">
                <p className="text-6xl font-display font-black text-red-600 tracking-tighter">
                  {metrics?.fatalDeadlines ?? 0}
                </p>
                <span className="text-[10px] uppercase font-bold bg-red-100 text-red-800 px-2 py-1 rounded-full border border-red-200">
                  Aviso Crítico
                </span>
              </div>
              <p className="text-sm text-red-700 mt-4 leading-relaxed font-medium">
                Sinalização de processos que contêm prazos com caducidade inadiável nas próximas semanas.
              </p>
            </div>
          </div>

          <Link href="/matters" className="mt-8 pt-6 border-t border-red-200">
            <button className="w-full py-4 px-6 bg-red-600 text-white text-[11px] font-bold uppercase tracking-[0.2em] rounded-xl flex items-center justify-between hover:bg-red-700 transition-colors shadow-lg shadow-red-600/20">
              <span>Auditar Processos</span>
              <ChevronRight size={16} />
            </button>
          </Link>
        </div>

      </div>
    </div>
  );
}
