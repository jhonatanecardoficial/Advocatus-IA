"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

export async function aiSearchAction(query: string) {
    try {
        console.log(`[AI Search Action] Starting search for query: "${query}"`);
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) {
            console.log(`[AI Search Action] No auth token found`);
            return { error: "Não está autenticado." };
        }

        const url = `${API_URL}/ai/search`;
        console.log(`[AI Search Action] Fetching ${url}`);

        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ query }),
            cache: "no-store",
        });

        console.log(`[AI Search Action] Response status: ${response.status}`);

        if (response.status === 401) {
            console.log(`[AI Search Action] 401 Unauthorized, cleaning cookie`);
            cookieStore.delete("accessToken");
            return { error: "Sessão expirada. Faça login novamente." };
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`[AI Search Action] API error:`, errorData);
            return { error: errorData?.message || "Erro na pesquisa IA." };
        }

        const data = await response.json();
        console.log(`[AI Search Action] Success, returning ${data.results?.length || 0} results`);
        return data;
    } catch (error: any) {
        console.error(`[AI Search Action] Exception caught:`, error.message);
        return { error: "Não foi possível contactar o servidor AI." };
    }
}

export async function aiDraftAction(matterId: string, type: string) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) return { error: "Não está autenticado." };

        const response = await fetch(`${API_URL}/ai/draft`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ matterId, type }),
            cache: "no-store",
        });

        if (response.status === 401) {
            cookieStore.delete("accessToken");
            return { error: "Sessão expirada. Faça login novamente." };
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { error: errorData?.message || "Erro ao gerar rascunho." };
        }

        return await response.json();
    } catch (error: any) {
        return { error: "Não foi possível contactar o servidor AI." };
    }
}

export async function aiRefineAction(matterId: string, currentContent: string, instruction: string) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) return { error: "Não está autenticado." };

        const response = await fetch(`${API_URL}/ai/refine`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ matterId, currentContent, instruction }),
            cache: "no-store",
        });

        if (response.status === 401) {
            cookieStore.delete("accessToken");
            return { error: "Sessão expirada. Faça login novamente." };
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { error: errorData?.message || "Erro ao refinar rascunho." };
        }

        return await response.json();
    } catch (error: any) {
        return { error: "Não foi possível contactar o servidor AI." };
    }
}

export async function aiSaveDraftAction(matterId: string, filename: string, htmlContent: string) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) return { error: "Não está autenticado." };

        const response = await fetch(`${API_URL}/ai/save-draft`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ matterId, filename, htmlContent }),
            cache: "no-store",
        });

        if (response.status === 401) {
            cookieStore.delete("accessToken");
            return { error: "Sessão expirada. Faça login novamente." };
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { error: errorData?.message || "Erro ao salvar rascunho." };
        }

        revalidatePath('/matters/[id]', 'page');
        return await response.json();
    } catch (error: any) {
        return { error: "Não foi possível contactar o servidor AI." };
    }
}

