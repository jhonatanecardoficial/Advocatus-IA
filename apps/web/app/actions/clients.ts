"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { ClientType } from "@advocatus/types"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

export async function createClientAction(data: { nome: string, nif: string, tipo: ClientType, email?: string, telefone?: string }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) return { error: "Não está autenticado." };

        const response = await fetch(`${API_URL}/clients`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data),
            cache: "no-store",
        });

        if (response.status === 401) {
            cookieStore.delete("accessToken");
            return { error: "Sessão expirada. Faça login novamente." };
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { error: errorData?.message || "Erro ao criar cliente." };
        }

        revalidatePath('/clients');
        return await response.json();
    } catch (error: any) {
        return { error: "Não foi possível contactar o servidor Backend." };
    }
}

export async function updateClientAction(id: string, data: { 
    nome: string, 
    nif: string, 
    tipo: ClientType, 
    email?: string, 
    telefone?: string,
    address?: string,
    notes?: string,
    gdprConsent?: boolean 
}) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) return { error: "Não está autenticado." };

        const response = await fetch(`${API_URL}/clients/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data),
            cache: "no-store",
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { error: errorData?.message || "Erro ao atualizar cliente." };
        }

        revalidatePath(`/clients/${id}`);
        revalidatePath('/clients');
        return await response.json();
    } catch (error: any) {
        return { error: "Não foi possível contactar o servidor Backend." };
    }
}

export async function deleteClientAction(id: string) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) return { error: "Não está autenticado." };

        const response = await fetch(`${API_URL}/clients/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            },
            cache: "no-store",
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { error: errorData?.message || "Erro ao eliminar cliente." };
        }

        revalidatePath('/clients');
        return { success: true };
    } catch (error: any) {
        return { error: "Não foi possível contactar o servidor Backend." };
    }
}

export async function checkConflictAction(data: { nome: string, nif: string }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) return { error: "Não está autenticado." };

        const response = await fetch(`${API_URL}/clients/conflict-check`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data),
            cache: "no-store",
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { error: errorData?.message || "Erro ao verificar conflito." };
        }

        return await response.json();
    } catch (error: any) {
        return { error: "Não foi possível contactar o servidor Backend." };
    }
}

export async function searchClientsAction(query: string) {
    const cookieStore = await cookies();
    const token = cookieStore.get('accessToken')?.value;

    if (!token) return { error: 'Não autenticado' };

    try {
        const url = `${API_URL}/clients?search=${encodeURIComponent(query)}&perPage=10`;
        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            cache: 'no-store',
        });

        if (!res.ok) throw new Error('Falha ao pesquisar clientes');
        return await res.json();
    } catch (e) {
        return { error: (e as Error).message };
    }
}
