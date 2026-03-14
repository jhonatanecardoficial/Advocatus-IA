import { ReactNode } from "react";
import { TopNav } from "@/components/dashboard/top-nav";
import { Sidebar } from "@/components/dashboard/sidebar";
import { LogoutProvider } from "@/context/logout-context";
import { LogoutModal } from "@/components/dashboard/LogoutModal";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <LogoutProvider>
            <div className="h-screen bg-mesh flex flex-col font-body selection:bg-amber/30 selection:text-white overflow-hidden">
                <TopNav />
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
