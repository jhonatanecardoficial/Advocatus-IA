"use server"

import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

export async function aiSearchAction(query: string) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            return { error: "Não está autenticado." };
        }

        const response = await fetch(`${API_URL}/ai/search`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ query }),
            cache: "no-store",
        });

        if (response.status === 401) {
            cookieStore.delete("accessToken");
            return { error: "Sessão expirada. Faça login novamente." };
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { error: errorData?.message || "Erro na pesquisa IA." };
        }

        return await response.json();
    } catch (error: any) {
        return { error: "Não foi possível contactar o servidor AI." };
    }
}

