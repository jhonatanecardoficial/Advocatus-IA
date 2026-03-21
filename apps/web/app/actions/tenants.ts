"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export async function updateTenantAction(data: any) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return { error: "Não autenticado" };

  try {
    const res = await fetch(`${API_URL}/tenants/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await res.json();

    if (!res.ok) {
      return { error: result.message || "Erro ao atualizar dados do escritório" };
    }

    revalidatePath("/settings");
    return { data: result.data };
  } catch (err) {
    return { error: "Erro de rede ao conectar à API" };
  }
}
