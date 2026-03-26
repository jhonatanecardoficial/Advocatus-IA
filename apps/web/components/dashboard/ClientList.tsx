"use client";

import { Search, Phone, Mail, ArrowRight, Users } from "lucide-react";
import { useState, useMemo } from "react";
import Link from "next/link";
import AddClientModal from "@/components/AddClientModal";

interface Client {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    nif: string;
    type: 'SINGULAR' | 'COLETIVO';
    _count?: {
        matters: number;
    }
}

interface ClientListProps {
    initialClients: Client[];
}

export default function ClientList({ initialClients }: ClientListProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState<'Todos' | 'Físicas' | 'Jurídicas'>('Todos');

    const filteredClients = useMemo(() => {
        return initialClients.filter(client => {
            const matchesSearch = 
                client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.nif.includes(searchTerm) ||
                (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase()));
            
            const matchesType = 
                filterType === 'Todos' ||
                (filterType === 'Físicas' && client.type === 'SINGULAR') ||
                (filterType === 'Jurídicas' && client.type === 'COLETIVO');

            return matchesSearch && matchesType;
        });
    }, [initialClients, searchTerm, filterType]);

    return (
        <div className="space-y-8">
            {/* Quick Actions / Search */}
            <div className="glass-panel p-2 flex flex-col md:flex-row gap-2 items-center justify-between border border-white/5 backdrop-blur-xl bg-navy/20">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
                    <input
                        type="text"
                        placeholder="Pesquisar por nome, NIF ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-none focus:outline-none focus:border-amber/50 focus:bg-white/10 font-mono text-xs text-white placeholder:text-white/20 transition-all uppercase tracking-wider"
                    />
                </div>
                <div className="flex gap-1 w-full md:w-auto">
                    {['Físicas', 'Jurídicas', 'Todos'].map((label) => (
                        <button 
                            key={label}
                            onClick={() => setFilterType(label as any)}
                            className={`px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all flex-1 md:flex-none ${
                                filterType === label 
                                    ? 'bg-amber text-navy shadow-glow hover:scale-[1.02]' 
                                    : 'text-white/40 hover:text-white hover:bg-white/5 border border-transparent'
                            }`}
                        >
                            {label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredClients.map((client) => (
                    <Link href={`/clients/${client.id}`} key={client.id} className="group">
                        <div className="h-full glass-card border border-white/10 p-8 flex flex-col justify-between hover:border-amber/40 hover:shadow-premium transition-all duration-300 ease-out cursor-pointer relative overflow-hidden bg-navy/10 group/card">
                            <div className="absolute -right-20 -top-20 w-40 h-40 bg-amber/5 rounded-full blur-[80px] group-hover/card:bg-amber/10 transition-colors"></div>

                            <div>
                                <div className="flex justify-between items-start mb-6">
                                    <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-1 border ${client.type === 'SINGULAR' ? 'border-white/20 text-white/80 bg-white/5' : 'border-amber/40 text-amber bg-amber/10'}`}>
                                        {client.type === 'SINGULAR' ? 'FÍSICA' : 'JURÍDICA'}
                                    </span>
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white/20 group-hover/card:text-amber group-hover/card:bg-amber/10 transition-all">
                                        <ArrowRight className="h-4 w-4 transform group-hover/card:translate-x-0.5 transition-transform" />
                                    </div>
                                </div>
                                <h3 className="text-xl font-display font-bold text-white line-clamp-2 leading-tight group-hover/card:text-amber transition-colors">
                                    {client.name}
                                </h3>
                                <p className="font-mono text-[10px] text-white/60 uppercase tracking-[0.2em] mt-3 mb-8 bg-white/5 px-2 py-1 inline-block border border-white/10">
                                    Documento: <span className="text-white font-bold">{client.nif}</span>
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

                {filteredClients.length === 0 && (
                    <div className="col-span-1 md:col-span-2 xl:col-span-3 py-32 flex flex-col items-center justify-center glass-panel border border-white/10 bg-white/5 text-white/40">
                        <Users className="h-16 w-16 mb-6 opacity-10" />
                        <h3 className="text-xl font-display font-bold text-white">Nenhum cliente encontrado</h3>
                        <p className="font-body text-xs mt-2 mb-8 text-center max-w-sm opacity-60">
                            {searchTerm ? "Tente ajustar sua busca ou filtros." : "Sua lista de clientes está vazia. Comece adicionando os dados do seu primeiro cliente."}
                        </p>
                        {!searchTerm && <AddClientModal />}
                    </div>
                )}
            </div>
        </div>
    );
}
