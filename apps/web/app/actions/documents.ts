"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

export async function uploadDocumentAction(formData: FormData) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("access_token")?.value;

        if (!token) return { error: "NÃ£o estÃ¡ autenticado." };

        const response = await fetch(`${API_URL}/documents/upload`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
                // Note: Don't set Content-Type for FormData, browser/fetch handles it
            },
            body: formData,
            cache: "no-store",
        });

        if (response.status === 401) {
            cookieStore.delete("access_token");
            return { error: "Sessao expirada. Faca login novamente." };
        }

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { error: errorData?.message || "Erro ao fazer upload do documento." };
        }

        revalidatePath('/matters/[id]', 'page');
        return await response.json();
    } catch (error: any) {
        return { error: "NÃ£o foi possÃ­vel contactar o servidor Backend." };
    }
}


