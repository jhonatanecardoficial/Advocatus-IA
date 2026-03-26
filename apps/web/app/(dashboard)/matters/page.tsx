import { Briefcase, ArrowRight, Clock } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import AddMatterModal from "@/components/AddMatterModal";
import SearchAndFilters from "@/components/shared/SearchAndFilters";

interface Matter {
    id: string;
    title: string;
    type: string;
    status: string;
    deadlineAt?: string | null;
    clientId: string;
    createdAt: string;
    client?: {
        name: string;
    };
    _count?: {
        documents?: number;
    }
}

async function fetchMatters(search?: string, status?: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) return { data: [], total: 0 };

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (status) params.append("status", status);

    try {
        const res = await fetch(`${API_URL}/matters?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });

        if (!res.ok) return { data: [], total: 0 };
        const data = await res.json();
        return {
            data: data.data || [],
            total: data.meta?.total || 0
        };
    } catch (e) {
        return { data: [], total: 0 };
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

export default async function MattersPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; status?: string }>;
}) {
    const { search, status } = await searchParams;
    const { data: matters, total } = await fetchMatters(search, status);

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
                        Workspace ativo • {total} processos catalogados
                    </p>
                </div>
                <div className="flex gap-4">
                    <AddMatterModal />
                </div>
            </div>

            {/* Search & Filters */}
            <SearchAndFilters 
                placeholder="Pesquisar por título, tribunal ou oposição..."
                filterParamName="status"
                filterOptions={[
                    { label: "Ativos", value: "ATIVO" },
                    { label: "Suspensos", value: "SUSPENSO" },
                    { label: "Encerrados", value: "ENCERRADO" }
                ]}
            />

            {/* Matters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {matters.map((matter: Matter) => {
                    return (
                        <Link href={`/matters/${matter.id}`} key={matter.id} className="group">
                            <div className="h-full glass-card border border-white/10 p-8 flex flex-col justify-between hover:border-amber/40 hover:shadow-premium transition-all duration-300 ease-out cursor-pointer relative overflow-hidden group/card bg-navy/10">
                                {/* Subtle Glow Effect */}
                                <div className="absolute -right-20 -top-20 w-40 h-40 bg-amber/5 rounded-full blur-[80px] group-hover/card:bg-amber/10 transition-colors"></div>

                                <div>
                                    <div className="flex justify-between items-start mb-6 gap-2">
                                        <div className="flex gap-2">
                                            <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 border transition-colors ${
                                                matter.status === 'ATIVO' 
                                                    ? 'border-green-500/30 text-green-400 bg-green-500/5' 
                                                    : matter.status === 'SUSPENSO'
                                                        ? 'border-amber/40 text-amber bg-amber/10'
                                                        : 'border-white/20 text-white/40 bg-white/5'
                                            }`}>
                                                {statusLabels[matter.status] || matter.status}
                                            </span>
                                            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-1 border border-white/10 text-white/60 bg-white/5">
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
                                    {matter.client && (
                                        <p className="text-[10px] text-white/30 uppercase tracking-widest mt-2 flex items-center gap-2">
                                            <span className="w-1 h-1 bg-amber rounded-full"></span>
                                            Cliente: <span className="text-white/60 font-medium">{matter.client.name}</span>
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-4 pt-8 border-t border-white/5 mt-8">
                                    {matter.deadlineAt && (
                                        <div className="flex items-center gap-3 text-white/40">
                                            <Clock className="h-3.5 w-3.5 text-amber/60" />
                                            <span className="font-mono text-[10px] uppercase tracking-tighter">
                                                Prazo: {new Date(matter.deadlineAt).toLocaleDateString("pt-PT")}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3 text-white/30">
                                            <span className="font-mono text-[9px] uppercase tracking-widest">
                                                #{matter.id.slice(-6).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 bg-white/5 px-2 py-1 border border-white/5">
                                            <div className="w-1 h-1 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></div>
                                            <span className="text-[8px] font-black text-white/40 uppercase tracking-tighter">Sincronizado</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}

                {matters.length === 0 && (
                    <div className="col-span-1 md:col-span-2 xl:col-span-3 py-10 md:py-32 flex flex-col items-center justify-center glass-panel border border-white/10 bg-white/5 text-white/40 font-mono">
                        <Briefcase className="h-16 w-16 mb-6 opacity-10" />
                        <h3 className="text-xl font-display font-black text-white uppercase tracking-tighter">Nenhum processo encontrado</h3>
                        <p className="text-[10px] mt-2 mb-8 text-center max-w-sm opacity-60 uppercase tracking-widest">
                            A base de dados jurídica não retornou resultados para estes filtros. Tente ajustar os parâmetros.
                        </p>
                        <AddMatterModal />
                    </div>
                )}
            </div>
        </div>
    );
}
