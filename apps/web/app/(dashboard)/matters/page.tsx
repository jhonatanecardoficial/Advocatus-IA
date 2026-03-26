import { Briefcase } from "lucide-react";
import { cookies } from "next/headers";
import AddMatterModal from "@/components/AddMatterModal";
import MatterList from "@/components/dashboard/MatterList";

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
    const token = cookieStore.get("accessToken")?.value;

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

            <MatterList initialMatters={matters} />
        </div>
    );
}
