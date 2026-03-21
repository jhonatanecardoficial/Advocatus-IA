import { cookies } from "next/headers";
import { Settings } from "lucide-react";
import SettingsTabs from "./SettingsTabs";

async function fetchSettingsData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  if (!token) return { tenant: null, user: null };

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

  try {
    const [meRes, tenantRes] = await Promise.all([
      fetch(`${API_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
      fetch(`${API_URL}/tenants/me`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      }),
    ]);

    const user = meRes.ok ? (await meRes.json()).data : null;
    const tenant = tenantRes.ok ? (await tenantRes.json()).data : null;

    return { user, tenant };
  } catch (e) {
    return { user: null, tenant: null };
  }
}

export default async function SettingsPage() {
  const { user, tenant } = await fetchSettingsData();

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out pb-20">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                            <Settings className="w-5 h-5 text-slate-400" />
                        </div>
                        <span className="text-[10px] text-slate-400 font-black uppercase tracking-[0.3em]">Sistema</span>
                    </div>
                    <h1 className="text-4xl font-display font-black text-white uppercase tracking-tighter leading-none">
                        Configurações Gerais
                    </h1>
                    <p className="text-white/40 mt-3 font-mono text-[10px] uppercase tracking-widest flex items-center gap-2">
                        Escritório: <span className="text-amber font-bold">{tenant?.name || "Advocatus IA"}</span> • Versão Premium 1.2.0
                    </p>
                </div>
            </div>

            <div className="glass-panel border border-white/5 bg-navy/20 backdrop-blur-xl p-1 shadow-2xl">
                <SettingsTabs tenant={tenant} user={user} />
            </div>
        </div>
    );
}
