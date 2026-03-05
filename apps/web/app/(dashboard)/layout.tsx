import { ReactNode } from "react";
import { TopNav } from "@/components/dashboard/top-nav";

export default function DashboardLayout({ children }: { children: ReactNode }) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-body">
            <TopNav />
            <main className="flex-1 w-full max-w-[1600px] mx-auto p-6 md:p-12">
                {children}
            </main>
        </div>
    );
}
