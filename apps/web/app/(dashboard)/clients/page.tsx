import { Users, Phone, Mail, ArrowRight } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import AddClientModal from "@/components/AddClientModal";
import SearchAndFilters from "@/components/shared/SearchAndFilters";

interface Client {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    nif: string;
    type: 'SINGULAR' | 'COLETIVA';
    _count?: {
        matters: number;
    }
}

async function fetchClients(search?: string, tipo?: string): Promise<Client[]> {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) return [];

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    
    // Construir URL com filtros
    const params = new URLSearchParams();
    if (search) params.append("search", search);
    if (tipo) params.append("tipo", tipo);

    try {
        const res = await fetch(`${API_URL}/clients?${params.toString()}`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });

        if (!res.ok) return [];
        const json = await res.json();
        return json.data || [];
    } catch (e) {
        return [];
    }
}

export default async function ClientsPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string; tipo?: string }>;
}) {
    const { search, tipo } = await searchParams;
    const clients = await fetchClients(search, tipo);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-amber/10 rounded-lg border border-amber/20">
                            <Users className="w-5 h-5 text-amber" />
                        </div>
                        <span className="text-[10px] text-amber font-black uppercase tracking-[0.3em]">Relacionamento</span>
                    </div>
                    <h1 className="text-4xl font-display font-black text-white uppercase tracking-tighter leading-none">
                        Carteira de Clientes
                    </h1>
                    <p className="text-white/40 mt-3 font-mono text-[10px] uppercase tracking-widest">
                        Workspace ativo • {clients.length} clientes geridos
                    </p>
                </div>
                <div className="flex gap-4">
                    <AddClientModal />
                </div>
            </div>

            {/* Quick Actions / Search */}
            <SearchAndFilters 
                placeholder="Pesquisar por nome, NIF ou email..."
                filterParamName="tipo"
                filterOptions={[
                    { label: "Físicas", value: "SINGULAR" },
                    { label: "Jurídicas", value: "COLETIVA" }
                ]}
            />

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {clients.map((client) => (
                    <Link href={`/clients/${client.id}`} key={client.id} className="group">
                        <div className="h-full glass-card border border-white/10 p-8 flex flex-col justify-between hover:border-amber/40 hover:shadow-premium transition-all duration-300 ease-out cursor-pointer relative overflow-hidden bg-navy/10 group/card">
                            {/* Subtle Glow Effect */}
                            <div className="absolute -right-20 -top-20 w-40 h-40 bg-amber/5 rounded-full blur-[80px] group-hover/card:bg-amber/10 transition-colors"></div>

                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 border ${client.type === 'SINGULAR' ? 'border-white/20 text-white/80 bg-white/5' : 'border-amber/40 text-amber bg-amber/10'}`}>
                                        {client.type === 'SINGULAR' ? 'PESSOA FÍSICA' : 'PESSOA JURÍDICA'}
                                    </span>
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover/card:text-amber group-hover/card:bg-amber/10 transition-all">
                                        <ArrowRight className="h-4 w-4 transform group-hover/card:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-display font-bold text-white line-clamp-2 leading-tight group-hover/card:text-amber transition-colors">
                                    {client.name}
                                </h3>
                                <p className="font-mono text-[10px] text-white/60 uppercase tracking-[0.2em] mt-3 mb-8 bg-white/5 px-2 py-1 inline-block border border-white/10">
                                    NIF: <span className="text-white font-bold">{client.nif}</span>
                                </p>
                            </div>
                            <div className="space-y-4 pt-8 border-t border-white/5 mt-auto">
                                {client.phone && (
                                    <div className="flex items-center gap-3 text-white/40">
                                        <Phone className="h-3.5 w-3.5 text-amber/60" />
                                        <span className="font-mono text-[11px]">{client.phone}</span>
                                    </div>
                                )}
                                {client.email && (
                                    <div className="flex items-center gap-3 text-white/40">
                                        <Mail className="h-3.5 w-3.5 text-amber/60" />
                                        <span className="truncate font-body text-xs lowercase">{client.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}

                {clients.length === 0 && (
                    <div className="col-span-1 md:col-span-2 xl:col-span-3 py-10 md:py-32 flex flex-col items-center justify-center glass-panel border border-white/10 bg-white/5 text-white/40">
                        <Users className="h-16 w-16 mb-6 opacity-10" />
                        <h3 className="text-xl font-display font-bold text-white">Nenhum cliente encontrado</h3>
                        <p className="font-body text-xs mt-2 mb-8 text-center max-w-sm opacity-60">
                            Não encontramos clientes com os filtros aplicados. Tente ajustar sua busca ou adicione um novo cliente.
                        </p>
                        <AddClientModal />
                    </div>
                )}
            </div>
        </div>
    );
}
