import { cookies } from "next/headers";
import { Settings } from "lucide-react";
import SettingsTabs from "./SettingsTabs";

async function fetchSettingsData() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

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
    <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b-2 border-navy pb-6">
        <div>
          <h1 className="text-5xl font-display font-black text-navy uppercase tracking-tighter flex items-center gap-4">
            <Settings size={48} className="text-amber-500" />
            Configurações
          </h1>
          <p className="text-slate-500 mt-2 font-mono text-sm uppercase tracking-widest">
            Gestão do Workspace • {tenant?.name || "Advocatus IA"}
          </p>
        </div>
      </div>

      <SettingsTabs tenant={tenant} user={user} />
    </div>
  );
}
