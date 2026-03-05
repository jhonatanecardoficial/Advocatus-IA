"use server"

import { cookies } from "next/headers"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1"

export async function loginAction(data: any) {
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
            cache: "no-store",
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { error: errorData?.message || "Erro de autenticação." };
        }

        const result = await response.json();

        if (result.access_token) {
            (await cookies()).set("access_token", result.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 7 // 7 days
            });
            return { success: true };
        }

        return { error: "Token não retornado pelo servidor." };
    } catch (error: any) {
        return { error: "Não foi possível contactar o servidor Backend." };
    }
}

export async function registerAction(data: any) {
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                email: data.email,
                password: data.password,
                name: `${data.firstName || ""} ${data.lastName || ""}`.trim(),
                tenantName: data.officeName || "Escritório",
            }),
            cache: "no-store"
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            return { error: errorData?.message || "Erro ao criar conta." };
        }

        const result = await response.json();

        if (result.access_token) {
            (await cookies()).set("access_token", result.access_token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 7
            });
            return { success: true };
        }

        return { error: "Token não retornado pelo servidor." };
    } catch (error: any) {
        return { error: "Não foi possível contactar o servidor Backend." };
    }
}

export async function logoutAction() {
    const cookieStore = await cookies();
    cookieStore.delete("access_token");
    return { success: true };
}
