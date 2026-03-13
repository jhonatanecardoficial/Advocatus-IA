import Link from "next/link";
import { ArrowUpRight, Scale, Users, Clock, AlertTriangle } from "lucide-react";
import { cookies } from "next/headers";
import AddMatterModal from "@/components/AddMatterModal";

async function fetchDashboardData() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* Header Overview */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-navy pb-6">
                <div>
                    <h1 className="text-5xl font-display font-black text-navy uppercase tracking-tighter">
                        Olá, {user?.name ? user.name.split(" ")[0] : "Advogado"}
                    </h1>
                    <p className="text-slate-500 mt-2 font-mono text-sm uppercase tracking-widest">
                        Workspace: {user?.tenantId || "---"} • Última atualização: Hoje, 09:41
                    </p>
                </div>
                <div className="flex gap-4">
                    <AddMatterModal />
                    <button className="bg-transparent text-navy px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-slate-200 transition-colors border-2 border-navy">
                        Gerar Relatório
                    </button>
                </div>
            </div>

            {/* Brutalist Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-0 border-y-2 border-navy bg-white">
                {/* Metric 1 */}
                <div className="p-6 border-b-2 md:border-b-0 md:border-r-2 border-navy flex flex-col justify-between group hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-8">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Processos Ativos</span>
                        <Scale className="h-5 w-5 text-navy opacity-50" />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-display font-black text-navy tracking-tighter">{metrics?.activeMatters ?? 0}</span>
                            <span className="text-sm font-bold text-green-600 flex items-center">
                                <ArrowUpRight className="h-3 w-3 mr-1" /> Em curso
                            </span>
                        </div>
                    </div>
                </div>

                {/* Metric 2 */}
                <div className="p-6 border-b-2 md:border-b-0 md:border-r-2 lg:border-r-2 border-navy flex flex-col justify-between group hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-8">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Agenda (7 dias)</span>
                        <Clock className="h-5 w-5 text-amber-600 opacity-80" />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-display font-black text-navy tracking-tighter">
                                {String(metrics?.upcomingTasks ?? 0).padStart(2, '0')}
                            </span>
                            <span className="text-sm font-bold text-navy flex items-center">
                                Tarefas Pendentes
                            </span>
                        </div>
                    </div>
                </div>

                {/* Metric 3 */}
                <div className="p-6 border-b-2 lg:border-b-0 lg:border-r-2 border-navy flex flex-col justify-between group hover:bg-red-50 transition-colors">
                    <div className="flex items-start justify-between mb-8">
                        <span className="text-xs font-bold text-red-600 uppercase tracking-widest">Prazos de Risco</span>
                        <AlertTriangle className="h-5 w-5 text-red-600 opacity-80" />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-display font-black text-red-600 tracking-tighter">
                                {String(metrics?.fatalDeadlines ?? 0).padStart(2, '0')}
                            </span>
                            <span className="text-sm font-bold text-red-600 flex items-center">
                                Expira &lt; 48h
                            </span>
                        </div>
                    </div>
                </div>

                {/* Metric 4 */}
                <div className="p-6 flex flex-col justify-between group hover:bg-slate-50 transition-colors">
                    <div className="flex items-start justify-between mb-8">
                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Novos Clientes</span>
                        <Users className="h-5 w-5 text-navy opacity-50" />
                    </div>
                    <div>
                        <div className="flex items-baseline gap-2">
                            <span className="text-6xl font-display font-black text-navy tracking-tighter">
                                {String(metrics?.newClients ?? 0).padStart(2, '0')}
                            </span>
                            <span className="text-sm font-bold text-slate-500 flex items-center">
                                Mês Atual
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Ledger Table Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between border-b-2 border-navy pb-4">
                        <h2 className="text-2xl font-display font-bold text-navy">Casos Recentes</h2>
                        <button className="text-xs font-bold uppercase tracking-widest text-amber-600 hover:text-navy transition-colors">Ver Todos</button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse bg-white border-2 border-navy">
                            <thead className="bg-navy text-white">
                                <tr>
                                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest border-r border-navy-700">Ref / Cliente</th>
                                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest border-r border-navy-700">Jurisdição</th>
                                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest border-r border-navy-700">Status</th>
                                    <th className="py-4 px-4 text-xs font-bold uppercase tracking-widest text-right">Ação</th>
                                </tr>
                            </thead>
                            <tbody className="font-mono text-sm">
                                {matters.length > 0 ? (
                                    matters.slice(0, 5).map((matter: any) => (
                                        <tr key={matter.id} className="border-b-2 border-navy hover:bg-slate-100 transition-colors group">
                                            <td className="py-4 px-4 border-r border-navy-200">
                                                <div className="font-bold text-navy group-hover:text-amber-600 transition-colors">
                                                    {matter.courtReference || matter.id.substring(0, 8)}
                                                </div>
                                                <div className="text-xs text-slate-500 font-sans mt-1">{matter.client?.name || "Sem Cliente"}</div>
                                            </td>
                                            <td className="py-4 px-4 text-slate-600 border-r border-navy-200">{matter.type}</td>
                                            <td className="py-4 px-4 border-r border-navy-200">
                                                <span className={`inline-block px-2 py-1 text-xs font-bold uppercase tracking-wider border ${matter.status === 'ATIVO' ? 'bg-green-100 text-green-800 border-green-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
                                                    {matter.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-4 text-right">
                                                <Link href={`/matters/${matter.id}`} className="text-navy hover:text-amber-600 underline underline-offset-4 font-bold inline-block">
                                                    Abrir
                                                </Link>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr className="border-b-2 border-navy invisible"></tr>
                                )}
                                {matters.length === 0 && (
                                    <tr className="border-b-2 border-navy hover:bg-slate-100 transition-colors group">
                                        <td colSpan={4} className="py-4 px-4 text-center text-slate-400">Nenhum processo recente encontrado.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar Mini-section */}
                <div className="space-y-6">
                    <div className="border-2 border-navy p-6 bg-navy text-white relative overflow-hidden group">
                        <div className="absolute -top-6 -right-6 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Scale className="h-48 w-48 text-amber-500" />
                        </div>
                        <div className="relative z-10">
                            <h3 className="text-xl font-display font-bold mb-2 text-amber-500">Assistente IA</h3>
                            <p className="text-sm text-slate-300 font-body mb-6">
                                A IA analisou 342 páginas de jurisprudência nas últimas 24h. Encontrada 1 correspondência vital para o caso PROC-2023-0894.
                            </p>
                            <button className="w-full bg-amber-500 text-navy py-3 text-xs font-bold uppercase tracking-widest hover:bg-white transition-colors border border-amber-500">
                                Ver Insights
                            </button>
                        </div>
                    </div>

                    <div className="border-2 border-navy p-6 bg-white">
                        <h3 className="text-sm font-bold uppercase tracking-widest text-slate-500 mb-4 border-b-2 border-navy pb-2">Agenda Hoje</h3>
                        <div className="space-y-4">
                            <div className="flex gap-4 items-start border-b border-dashed border-slate-300 pb-4">
                                <div className="font-mono text-xs font-bold text-navy whitespace-nowrap pt-1">10:30</div>
                                <div>
                                    <div className="font-bold text-sm text-navy uppercase tracking-wide">Reunião c/ Cliente</div>
                                    <div className="text-xs text-slate-500 mt-1">Sala 2 • João Manuel</div>
                                </div>
                            </div>
                            <div className="flex gap-4 items-start pt-2">
                                <div className="font-mono text-xs font-bold text-amber-600 whitespace-nowrap pt-1">14:00</div>
                                <div>
                                    <div className="font-bold text-sm text-navy uppercase tracking-wide">Audiência de Partes</div>
                                    <div className="text-xs text-slate-500 mt-1">Tribunal de Cascais</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
