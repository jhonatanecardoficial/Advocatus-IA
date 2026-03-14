import { Briefcase, Search, Filter, ArrowRight, Clock } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import AddMatterModal from "@/components/AddMatterModal";

interface Matter {
    id: string;
    title: string;
    type: string;
    status: string;
    deadline_at?: string | null;
    client_id: string;
    created_at: string;
    _count?: {
        documents?: number;
    }
}

async function fetchMatters() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) return [];

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

    try {
        const res = await fetch(`${API_URL}/matters`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });

        if (!res.ok) return [];
        const data = await res.json();
        return data.data || [];
    } catch (e) {
        return [];
    }
}

const typeLabels: Record<string, string> = {
    CIVEL: "Cível",
    PENAL: "Penal",
    LABORAL: "Laboral",
    ADMINISTRATIVO: "Administrativo",
    FISCAL: "Fiscal",
    FAMILIA: "Família",
    COMERCIAL: "Comercial",
    OUTRO: "Outro",
};

const statusLabels: Record<string, string> = {
    ATIVO: "Ativo",
    ENCERRADO: "Encerrado",
    SUSPENSO: "Suspenso",
    ARQUIVADO: "Arquivado",
};

export default async function MattersPage() {
    const matters: Matter[] = await fetchMatters();

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber/10 rounded-lg border border-amber/20">
                            <Briefcase className="w-5 h-5 text-amber" />
                        </div>
                        <span className="text-[10px] text-amber font-black uppercase tracking-[0.3em]">Operações</span>
                    </div>
                    <h1 className="text-4xl font-display font-black text-white uppercase tracking-tighter leading-none">
                        Processos Jurídicos
                    </h1>
                    <p className="text-white/40 mt-3 font-mono text-[10px] uppercase tracking-widest">
                        Workspace ativo • {matters.length} processos catalogados
                    </p>
                </div>
                <div className="flex gap-4">
                    <AddMatterModal />
                </div>
            </div>

            {/* Search & Filters */}
            <div className="glass-panel p-2 flex flex-col md:flex-row gap-2 items-center justify-between border border-white/5 backdrop-blur-xl bg-navy/20">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="Pesquisar por título ou cliente..."
                        className="w-full pl-12 pr-4 py-4 bg-navy/40 border border-white/10 rounded-none focus:outline-none focus:border-amber/50 focus:bg-white/10 font-mono text-xs text-white placeholder:text-white/20 transition-all uppercase tracking-wider"
                    />
                </div>
                <div className="flex gap-1 w-full md:w-auto">
                    {['Ativos', 'Suspensos', 'Todos'].map((label) => (
                        <button 
                            key={label}
                            className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex-1 md:flex-none ${
                                label === 'Todos' 
                                    ? 'bg-amber text-navy shadow-glow hover:scale-[1.02]' 
                                    : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            {label === 'Ativos' && <Filter className="h-3.5 w-3.5 inline mr-2" />}
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Matters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {matters.map((matter) => {
                    return (
                        <Link href={`/matters/${matter.id}`} key={matter.id} className="group">
                            <div className="h-full glass-card border border-white/10 p-8 flex flex-col justify-between hover:border-amber/40 hover:shadow-premium transition-all duration-300 ease-out cursor-pointer relative overflow-hidden group/card bg-navy/10">
                                {/* Subtle Glow Effect */}
                                <div className="absolute -right-20 -top-20 w-40 h-40 bg-amber/5 rounded-full blur-[80px] group-hover/card:bg-amber/10 transition-colors"></div>

                                <div>
                                    <div className="flex justify-between items-start mb-6 gap-2">
                                        <div className="flex gap-2">
                                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 bg-white/5 border border-white/10 text-white/60">
                                                {statusLabels[matter.status] || matter.status}
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 border border-amber/20 text-amber bg-amber/5">
                                                {typeLabels[matter.type] || matter.type}
                                            </span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover/card:text-amber group-hover/card:bg-amber/10 transition-all">
                                            <ArrowRight size={14} className="group-hover/card:translate-x-0.5 transition-transform" />
                                        </div>
                                    </div>
                                    <h3 className="text-xl font-display font-bold text-white line-clamp-2 leading-tight group-hover/card:text-amber transition-colors">
                                        {matter.title}
                                    </h3>
                                </div>

                                <div className="space-y-4 pt-8 border-t border-white/5 mt-auto">
                                    {matter.deadline_at && (
                                        <div className="flex items-center gap-3 text-white/40">
                                            <Clock className="h-3.5 w-3.5 text-amber/60" />
                                            <span className="font-mono text-[10px] uppercase tracking-tighter">
                                                Prazo Fatal: {new Date(matter.deadline_at).toLocaleDateString("pt-PT")}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-white/30">
                                            <span className="font-mono text-[9px] uppercase tracking-widest">
                                                #{matter.id.slice(-4).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 rounded-sm border border-white/5">
                                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                            <span className="text-[9px] font-black text-white/40 uppercase tracking-tighter">Sincronizado</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}

                {matters.length === 0 && (
                    <div className="col-span-1 md:col-span-2 xl:col-span-3 py-32 flex flex-col items-center justify-center glass-panel border border-white/10 bg-white/5 text-white/40">
                        <Briefcase className="h-16 w-16 mb-6 opacity-10" />
                        <h3 className="text-xl font-display font-bold text-white">Nenhum processo encontrado</h3>
                        <p className="font-body text-xs mt-2 mb-8 text-center max-w-sm opacity-60">
                            A sua base de dados jurídica está vazia. Comece a organizar os seus processos utilizando as nossas ferramentas de IA.
                        </p>
                        <AddMatterModal />
                    </div>
                )}
            </div>
        </div>
    );
}
