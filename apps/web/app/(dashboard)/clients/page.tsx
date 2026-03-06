import { Users, Plus, Search, MapPin, Phone, Mail, ArrowRight } from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";

interface Client {
    id: string;
    nome: string;
    email: string | null;
    telefone: string | null;
    nif: string;
    tipo: 'SINGULAR' | 'COLETIVA';
    _count?: {
        matters: number;
    }
}

async function fetchClients() {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;

    if (!token) return [];

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

    try {
        const res = await fetch(`${API_URL}/clients`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });

        if (!res.ok) return [];
        return await res.json();
    } catch (e) {
        return [];
    }
}

export default async function ClientsPage() {
    const clients: Client[] = await fetchClients();

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-navy pb-6">
                <div>
                    <h1 className="text-5xl font-display font-black text-navy uppercase tracking-tighter">
                        Carteira de Clientes
                    </h1>
                    <p className="text-slate-500 mt-2 font-mono text-sm uppercase tracking-widest">
                        Total registado: {clients.length} entidades
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="bg-navy text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-amber-600 transition-colors border-2 border-navy flex items-center gap-2">
                        <Plus className="h-4 w-4" /> Novo Cliente
                    </button>
                </div>
            </div>

            {/* Quick Actions / Search */}
            <div className="bg-white border-2 border-navy p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, NIF ou email..."
                        className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:outline-none focus:border-navy focus:ring-1 focus:ring-navy font-mono text-sm placeholder:text-slate-400 transition-colors"
                    />
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                    <button className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-navy bg-slate-100 hover:bg-slate-200 transition-colors flex-1 md:flex-none">
                        Singulares
                    </button>
                    <button className="px-4 py-3 text-xs font-bold uppercase tracking-widest text-navy bg-slate-100 hover:bg-slate-200 transition-colors flex-1 md:flex-none">
                        Coletivos
                    </button>
                    <button className="px-4 py-3 text-xs font-bold uppercase tracking-widest bg-amber-500 text-navy hover:bg-amber-600 transition-colors flex-1 md:flex-none border border-amber-600">
                        Todos
                    </button>
                </div>
            </div>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {clients.map((client) => (
                    <Link href={`/clients/${client.id}`} key={client.id} className="group">
                        <div className="h-full bg-white border-2 border-navy p-6 flex flex-col justify-between hover:border-amber-500 hover:shadow-[4px_4px_0px_#0f1d3a] transition-all duration-200 ease-out cursor-pointer relative overflow-hidden">

                            {/* Accent line */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-navy group-hover:bg-amber-500 transition-colors"></div>

                            <div>
                                <div className="flex justify-between items-start mb-4">
                                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-1 border ${client.tipo === 'SINGULAR' ? 'border-navy text-navy bg-slate-50' : 'border-amber-600 text-amber-800 bg-amber-50'}`}>
                                        {client.tipo}
                                    </span>
                                    <ArrowRight className="h-5 w-5 text-slate-300 group-hover:text-navy transition-colors transform group-hover:-translate-y-1 group-hover:translate-x-1 duration-200" />
                                </div>
                                <h3 className="text-xl font-display font-bold text-navy line-clamp-2 leading-tight">
                                    {client.nome}
                                </h3>
                                <p className="font-mono text-xs text-slate-500 mt-2 mb-6">
                                    NIF: {client.nif}
                                </p>
                            </div>

                            <div className="space-y-3 pt-6 border-t border-dashed border-slate-200 mt-auto">
                                {client.telefone && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Phone className="h-4 w-4 text-slate-400" />
                                        <span className="font-mono">{client.telefone}</span>
                                    </div>
                                )}
                                {client.email && (
                                    <div className="flex items-center gap-3 text-sm text-slate-600">
                                        <Mail className="h-4 w-4 text-slate-400" />
                                        <span className="truncate">{client.email}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </Link>
                ))}

                {clients.length === 0 && (
                    <div className="col-span-1 md:col-span-2 xl:col-span-3 py-24 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 bg-slate-50 text-slate-500">
                        <Users className="h-12 w-12 mb-4 opacity-20" />
                        <h3 className="text-lg font-display font-bold text-navy">Nenhum cliente encontrado</h3>
                        <p className="font-body text-sm mt-1 mb-6 text-center max-w-md">
                            O seu diretório de entidades está vazio. Comece por adicionar o seu primeiro cliente.
                        </p>
                        <button className="bg-navy text-white px-6 py-3 text-xs font-bold uppercase tracking-widest hover:bg-amber-600 transition-colors border-2 border-navy flex items-center gap-2">
                            <Plus className="h-4 w-4" /> Novo Cliente
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
