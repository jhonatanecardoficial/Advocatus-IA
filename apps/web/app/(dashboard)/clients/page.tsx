import { Users } from "lucide-react";
import { cookies } from "next/headers";
import AddClientModal from "@/components/AddClientModal";
import ClientList from "@/components/dashboard/ClientList";
import { ClientType } from "@advocatus/types";

interface Client {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    nif: string;
    type: ClientType;
    _count?: {
        matters: number;
    }
}

async function fetchClients(): Promise<Client[]> {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) return [];

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

    try {
        const res = await fetch(`${API_URL}/clients`, {
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

export default async function ClientsPage() {
    const clients = await fetchClients();

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

            <ClientList initialClients={clients} />
        </div>
    );
}
