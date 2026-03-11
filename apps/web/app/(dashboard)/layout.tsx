import { ReactNode } from "react";
import { TopNav } from "@/components/dashboard/top-nav";
import { Sidebar } from "@/components/dashboard/sidebar";
import { LogoutProvider } from "@/context/logout-context";
import { LogoutModal } from "@/components/dashboard/LogoutModal";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <LogoutProvider>
            <div className="min-h-screen bg-slate-50 flex flex-col font-body">
                <TopNav />
                <div className="flex flex-1 overflow-hidden">
                    {/* Persistent Sidebar Navigation */}
                    <Sidebar />
                    {/* Main Content Area */}
                    <main className="flex-1 overflow-y-auto w-full">
                        <div className="max-w-[1600px] mx-auto p-6 md:p-12">
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
