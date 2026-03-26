"use server"

import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

export async function globalSearchAction(query: string) {
    if (!query || query.length < 2) return { data: [] };

    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;
        const headers: Record<string, string> = {};
        if (token) headers["Authorization"] = `Bearer ${token}`;

        const [clientsRes, mattersRes] = await Promise.all([
            fetch(`${API_URL}/clients?search=${encodeURIComponent(query)}&perPage=5`, { 
                headers,
                cache: 'no-store'
            }),
            fetch(`${API_URL}/matters?search=${encodeURIComponent(query)}&perPage=5`, { 
                headers,
                cache: 'no-store'
            }),
        ]);

        const combined: any[] = [];

        if (clientsRes.ok) {
            const data = await clientsRes.json();
            const clients = (data.data ?? []).map((c: any) => ({
                id: c.id,
                name: c.name,
                type: 'client',
                subtitle: c.nif ?? c.email ?? 'Cliente',
            }));
            combined.push(...clients);
        }

        if (mattersRes.ok) {
            const data = await mattersRes.json();
            const matters = (data.data ?? []).map((m: any) => ({
                id: m.id,
                title: m.title,
                type: 'matter',
                subtitle: m.courtReference ?? m.type ?? 'Processo',
            }));
            combined.push(...matters);
        }

        return { data: combined };
    } catch (error) {
        console.error("Erro na pesquisa global:", error);
        return { data: [], error: "Falha na comunicação com o servidor." };
    }
}
