
"use server";

import { cookies } from "next/headers";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export async function getDashboardMetricsAction() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) {
    return { success: false, error: "Não autenticado" };
  }

  try {
    const response = await fetch(`${API_URL}/reports/dashboard-metrics`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      next: { revalidate: 60 } // Cache opcional
    });

    if (!response.ok) {
      return { success: false, error: "Falha ao obter métricas" };
    }

    const data = await response.json();
    return { success: true, data: data.data };
  } catch (error) {
    return { success: false, error: "Erro de ligação" };
  }
}
