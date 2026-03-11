import { Briefcase, Search, Filter } from "lucide-react";
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

const statusColors: Record<string, { bg: string; border: string; text: string }> = {
    ATIVO: { bg: "bg-green-50", border: "border-green-300", text: "text-green-800" },
    ENCERRADO: { bg: "bg-slate-50", border: "border-slate-300", text: "text-slate-600" },
    SUSPENSO: { bg: "bg-amber-50", border: "border-amber-300", text: "text-amber-800" },
    ARQUIVADO: { bg: "bg-slate-100", border: "border-slate-400", text: "text-slate-700" },
};

export default async function MattersPage() {
    const matters: Matter[] = await fetchMatters();

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-navy pb-6">
                <div>
                    <h1 className="text-5xl font-display font-black text-navy uppercase tracking-tighter">
                        Processos Jurídicos
                    </h1>
                    <p className="text-slate-500 mt-2 font-mono text-sm uppercase tracking-widest">
                        Total registado: {matters.length} processos
                    </p>
                </div>
                <div className="flex gap-4">
                    <AddMatterModal />
                </div>
            </div>

            {/* Search & Filters */}
            <div className="bg-white border-2 border-navy p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar por título ou cliente..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy font-mono text-sm placeholder:text-slate-400 transition-colors"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-navy bg-slate-100 hover:bg-slate-200 transition-colors flex items-center gap-2 flex-1 md:flex-none">
                        <Filter className="h-4 w-4" /> Ativos
                    </button>
                    <button className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-navy bg-slate-100 hover:bg-slate-200 transition-colors flex-1 md:flex-none">
                        Suspensos
                    </button>
                    <button className="px-4 py-3 text-xs font-bold uppercase tracking-widest bg-amber-500 text-navy hover:bg-amber-600 transition-colors flex-1 md:flex-none border border-amber-600">
                        Todos
                    </button>
                </div>
            </div>

            {/* Matters Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {matters.map((matter) => {
                    const colors = statusColors[matter.status] || statusColors.ATIVO;
                    return (
                        <Link href={`/matters/${matter.id}`} key={matter.id} className="group">
                            <div className="h-full bg-white border-2 border-navy p-6 flex flex-col justify-between hover:border-amber-500 hover:shadow-[4px_4px_0px_#0f1d3a] transition-all duration-200 ease-out cursor-pointer relative overflow-hidden">
                                {/* Accent line */}
                                <div className="absolute top-0 left-0 w-full h-1 bg-navy group-hover:bg-amber-500 transition-colors"></div>

                                <div>
                                    <div className="flex justify-between items-start mb-4 gap-2">
                                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 border whitespace-nowrap ${colors.bg} ${colors.text} ${colors.border}`}>
                                            {statusLabels[matter.status] || matter.status}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 border border-navy text-navy bg-slate-50 whitespace-nowrap">
                                            {typeLabels[matter.type] || matter.type}
                                        </span>
                                    </div>
                                    <h3 className="text-lg font-display font-bold text-navy line-clamp-2 leading-tight">
                                        {matter.title}
                                    </h3>
                                </div>

                                <div className="space-y-3 pt-6 border-t border-dashed border-slate-200 mt-auto">
                                    {matter.deadline_at && (
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Briefcase className="h-4 w-4 text-slate-400" />
                                            <span className="font-mono text-xs">
                                                Prazo: {new Date(matter.deadline_at).toLocaleDateString("pt-PT")}
                                            </span>
                                        </div>
                                    )}
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <span className="font-mono text-xs">
                                            Criado: {new Date(matter.created_at).toLocaleDateString("pt-PT")}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    );
                })}

                {matters.length === 0 && (
                    <div className="col-span-1 md:col-span-2 xl:col-span-3 py-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500">
                        <Briefcase className="h-12 w-12 mb-4 opacity-20" />
                        <h3 className="text-lg font-display font-bold text-navy">Nenhum processo encontrado</h3>
                        <p className="font-body text-sm mt-1 mb-6 text-center max-w-md">
                            Comece por criar um novo processo para organizá-lo e rastreá-lo.
                        </p>
                        <AddMatterModal />
                    </div>
                )}
            </div>
        </div>
    );
}
