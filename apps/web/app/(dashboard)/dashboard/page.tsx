import { cookies } from "next/headers";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import MetricCard from "@/components/dashboard/MetricCard";
import RecentCasesTable from "@/components/dashboard/RecentCasesTable";
import DashboardSidebarCards from "@/components/dashboard/SidebarCards";
import { ArrowUpRight, Scale, Users, Clock, AlertTriangle, Calendar } from "lucide-react";
import Link from "next/link";

async function fetchDashboardData() {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) return { user: null, matters: [], metrics: null };

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

    try {
        const [meRes, mattersRes, metricsRes] = await Promise.all([
            fetch(`${API_URL}/auth/me`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            }),
            fetch(`${API_URL}/matters`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            }),
            fetch(`${API_URL}/reports/dashboard-metrics`, {
                headers: { Authorization: `Bearer ${token}` },
                cache: "no-store",
            })
        ]);

        const user = meRes.ok ? (await meRes.json()).data : null;
        const matters = mattersRes.ok ? (await mattersRes.json()).data || [] : [];
        const metrics = metricsRes.ok ? (await metricsRes.json()).data : null;

        return { user, matters, metrics };
    } catch (e) {
        return { user: null, matters: [], metrics: null };
    }
}

export default async function DashboardPage() {
    const { user, matters, metrics } = await fetchDashboardData();

    return (
        <div className="space-y-10 pb-10">
            {/* Header Overview */}
            <DashboardHeader 
              userName={user?.name || "Advogado"} 
              tenantId={user?.tenantId || "Escritório Local"} 
            />

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Metric 1: Processos Ativos */}
                <MetricCard 
                  delay={0.1}
                  className="glass-panel p-6 border border-white/40 shadow-premium group relative overflow-hidden"
                >
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Scale size={100} className="text-navy" />
                    </div>
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-2 bg-navy/5 rounded-xl border border-navy/10 group-hover:bg-navy group-hover:text-white transition-colors">
                            <Scale size={18} />
                        </div>
                        <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest">Processos Ativos</span>
                    </div>
                    <div className="flex items-baseline gap-2 relative z-10">
                        <span className="text-5xl font-display font-black text-white tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
                            {metrics?.activeMatters ?? 0}
                        </span>
                        <div className="flex items-center text-[11px] font-black text-green-600 uppercase tracking-tighter bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                            <ArrowUpRight className="h-3 w-3 mr-0.5" />
                            +2%
                        </div>
                    </div>
                </MetricCard>

                {/* Metric 2: Agenda */}
                <MetricCard 
                  delay={0.2}
                  className="glass-panel p-6 border border-white/40 shadow-premium group relative overflow-hidden"
                >
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Calendar size={100} className="text-amber" />
                    </div>
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-2 bg-amber/10 rounded-xl border border-amber/20 group-hover:bg-amber group-hover:text-navy transition-colors">
                            <Clock size={18} className="text-amber group-hover:text-navy" />
                        </div>
                        <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest">Agenda (7 dias)</span>
                    </div>
                    <div className="flex items-baseline gap-2 relative z-10">
                        <span className="text-5xl font-display font-black text-amber drop-shadow-[0_0_15px_rgba(251,191,36,0.4)] tracking-tighter">
                            {metrics?.upcomingTasks ?? 0}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                            Tarefas
                        </span>
                    </div>
                </MetricCard>

                {/* Metric 3: Prazos de Risco */}
                <MetricCard 
                  delay={0.3}
                  className="glass-panel p-6 border border-white/40 shadow-premium group bg-red-50/20 relative overflow-hidden"
                >
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <AlertTriangle size={100} className="text-red-500" />
                    </div>
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-2 bg-red-100 rounded-xl border border-red-200">
                            <AlertTriangle size={18} className="text-red-600" />
                        </div>
                        <span className="text-[11px] font-bold text-red-600 uppercase tracking-widest">Prazos de Risco</span>
                    </div>
                    <div className="flex items-baseline gap-2 relative z-10">
                        <span className="text-5xl font-display font-black text-red-600 tracking-tighter">
                            {metrics?.fatalDeadlines ?? 0}
                        </span>
                        <div className="px-2 py-0.5 bg-red-100 text-red-700 text-[10px] font-bold rounded-full border border-red-200 uppercase tracking-tighter">
                            Crítico
                        </div>
                    </div>
                </MetricCard>

                {/* Metric 4: Novos Clientes */}
                <MetricCard 
                  delay={0.4}
                  className="glass-panel p-6 border border-white/40 shadow-premium group relative overflow-hidden"
                >
                    <div className="absolute -right-4 -top-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users size={100} className="text-navy" />
                    </div>
                    <div className="flex items-center gap-3 mb-6 relative z-10">
                        <div className="p-2 bg-navy/5 rounded-xl border border-navy/10 group-hover:bg-navy group-hover:text-white transition-colors">
                            <Users size={18} />
                        </div>
                        <span className="text-[11px] font-bold text-white/70 uppercase tracking-widest">Novos Clientes</span>
                    </div>
                    <div className="flex items-baseline gap-2 relative z-10">
                        <span className="text-5xl font-display font-black text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] tracking-tighter">
                            {metrics?.newClients ?? 0}
                        </span>
                        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest leading-none">
                            Este mês
                        </span>
                    </div>
                </MetricCard>
            </div>

            {/* Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight flex items-center gap-3">
                            <span className="w-1.5 h-8 bg-amber rounded-full"></span>
                            Casos Recentes
                        </h2>
                        <Link 
                            href="/matters" 
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-amber hover:text-white transition-all flex items-center gap-2"
                            suppressHydrationWarning
                        >
                            Ver Arquivo Completo
                        </Link>
                    </div>

                    <RecentCasesTable matters={matters} />
                </div>

                {/* Sidebar Cards */}
                <DashboardSidebarCards />
            </div>
        </div>
    );
}
