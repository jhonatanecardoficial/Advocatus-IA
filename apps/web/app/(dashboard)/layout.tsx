import { ReactNode } from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { TopNav } from "@/components/dashboard/top-nav";
import { Sidebar } from "@/components/dashboard/sidebar";
import { LogoutProvider } from "@/context/logout-context";
import { LogoutModal } from "@/components/dashboard/LogoutModal";

/**
 * Busca o nome do utilizador no servidor via cookie HttpOnly seguro.
 * Não exposto ao browser — elimina o bug do `??` nas iniciais.
 */
async function fetchUserName(): Promise<string> {
    const cookieStore = await cookies();
    const token = cookieStore.get("accessToken")?.value;
    if (!token) return "Advogado";

    const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
    try {
        const res = await fetch(`${API_URL}/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
            cache: "no-store",
        });
        return res.ok ? ((await res.json()).data?.name ?? "Advogado") : "Advogado";
    } catch {
        return "Advogado";
    }
}

export default async function DashboardLayout({ children }: { children: ReactNode }) {
    const userName = await fetchUserName();

    return (
        <LogoutProvider>
            <div className="h-screen bg-mesh flex flex-col font-body selection:bg-amber/30 selection:text-white overflow-hidden">
                {/* TopNav recebe userName do servidor — sem dependência de cookies no browser */}
                <TopNav userName={userName} />
                <div className="flex flex-1 overflow-hidden">
                    {/* Persistent Sidebar Navigation */}
                    <Sidebar />
                    {/* Main Content Area */}
                    <main className="flex-1 overflow-y-auto w-full scroll-smooth custom-scrollbar bg-navy/5">
                        <div className="max-w-[1600px] mx-auto p-6 md:p-10 animate-reveal">
                            {children}
                        </div>
                    </main>
                </div>
                {/* Global Logout Confirmation Modal */}
                <LogoutModal />
            </div>
        </LogoutProvider>
    );
}
