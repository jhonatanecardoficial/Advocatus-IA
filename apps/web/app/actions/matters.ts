"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export async function createMatterAction(formData: any) {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;

    if (!token) {
        return { success: false, error: "Não autenticado" };
    }

    try {
        const response = await fetch(`${API_URL}/matters`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(formData),
        });

        const data = await response.json();

        if (!response.ok) {
            return { 
                success: false, 
                error: data.message || "Erro ao criar processo" 
            };
        }

        revalidatePath("/matters");
        return { success: true, data: data.data };
    } catch (error) {
        return { success: false, error: "Erro de conexão com o servidor" };
    }
}
