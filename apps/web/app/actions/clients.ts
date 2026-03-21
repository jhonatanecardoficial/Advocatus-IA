"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

export async function createClientAction(data: { nome: string, nif: string, tipo: 'SINGULAR' | 'COLETIVA', email?: string, telefone?: string }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) return { error: "Não está autenticado." };

        // Mapeamento para o Backend (name, type, nif, email, phone)
        const backendData = {
            name: data.nome,
            type: data.tipo === 'COLETIVA' ? 'COLETIVO' : 'SINGULAR',
            nif: data.nif,
            email: data.email,
            phone: data.telefone
        };

        const response = await fetch(`${API_URL}/clients`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(backendData),
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

export async function checkConflictAction(data: { nome: string, nif: string }) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("accessToken")?.value;

        if (!token) return { error: "Não está autenticado." };

        const backendData = {
            name: data.nome,
            nif: data.nif
        };

        const response = await fetch(`${API_URL}/clients/conflict-check`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(backendData),
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
