"use client";

import { useState } from "react";
import { Building, User, Users, Save, Shield } from "lucide-react";
import { updateTenantAction } from "@/app/actions/tenants";
import { toast } from "sonner";

export default function SettingsTabs({ tenant, user }: { tenant: any; user: any }) {
  const [activeTab, setActiveTab] = useState("escritorio");
  const [loading, setLoading] = useState(false);
  
  const [tenantForm, setTenantForm] = useState({
    name: tenant?.name || "",
    logoUrl: tenant?.logoUrl || "",
  });

  const handleUpdateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const result = await updateTenantAction(tenantForm);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success("Dados do escritório atualizados!");
      }
    } catch (err) {
      toast.error("Erro ao atualizar.");
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: "escritorio", label: "Escritório", icon: Building },
    { id: "perfil", label: "O Meu Perfil", icon: User },
    { id: "equipa", label: "Equipa & RBAC", icon: Users },
  ];

  return (
    <div className="flex flex-col md:flex-row gap-12">
      <div className="w-full md:w-64 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all border-l-2 ${
              activeTab === tab.id
                ? "bg-amber text-navy border-amber shadow-lg shadow-amber/20"
                : "text-slate-300 border-transparent hover:text-white hover:bg-white/5"
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 max-w-2xl glass-panel p-8 border border-white/5 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          {activeTab === "escritorio" ? <Building size={120} /> : activeTab === "perfil" ? <User size={120} /> : <Users size={120} />}
        </div>
        <div className="relative z-10">
        {activeTab === "escritorio" && (
          <form onSubmit={handleUpdateTenant} className="space-y-6">
            <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight border-b border-white/10 pb-4 mb-8">
              Definições do Escritório
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1 ml-1 tracking-widest">Nome da Firma</label>
                <input
                  type="text"
                  value={tenantForm.name}
                  onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
                  className="w-full bg-white/5 px-4 py-3 border border-white/10 focus:border-amber outline-none transition-colors font-mono text-sm text-white"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-300 mb-1 ml-1 tracking-widest">Logo URL (Preview)</label>
                <input
                  type="text"
                  value={tenantForm.logoUrl}
                  onChange={(e) => setTenantForm({ ...tenantForm, logoUrl: e.target.value })}
                  placeholder="https://exemplo.com/logo.png"
                  className="w-full bg-white/5 px-4 py-3 border border-white/10 focus:border-amber outline-none transition-colors font-mono text-sm text-white"
                />
              </div>

              <div className="bg-navy-900 p-4 border border-white/10 font-mono text-[10px] text-slate-100">
                Tenant ID: {tenant?.id}
                <br />
                Plan: <span className="text-amber">{tenant?.plan}</span> • Status: <span className="text-green-500">{tenant?.billingStatus}</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-amber text-navy py-4 text-xs font-bold uppercase tracking-widest hover:bg-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-amber/10"
            >
              <Save size={16} />
              {loading ? "A Gravar..." : "Guardar Alterações"}
            </button>
          </form>
        )}

        {activeTab === "perfil" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight border-b border-white/10 pb-4 mb-8">
              A Minha Identidade
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10">
                <div className="w-16 h-16 bg-amber flex items-center justify-center text-navy text-xl font-bold rounded-lg shadow-glow">
                  {user?.name?.[0] || "A"}
                </div>
                <div>
                  <div className="font-bold text-white uppercase tracking-tight">{user?.name}</div>
                  <div className="text-xs font-mono text-slate-300">{user?.email}</div>
                </div>
              </div>

              <div className="p-4 border border-amber-500/20 bg-amber-500/5 rounded-lg">
                <div className="flex items-center gap-2 text-amber-500 mb-2">
                  <Shield size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Nível de Acesso</span>
                </div>
                <div className="text-white font-bold uppercase text-lg">{user?.role}</div>
                <p className="text-xs text-slate-300 mt-1">Tens permissões totais para gerir este escritório.</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-300 font-mono">
              Para alterar os teus dados de autenticação (email/password), contacta o Administrador do Sistema.
            </p>
          </div>
        )}

        {activeTab === "equipa" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-black text-white uppercase tracking-tight border-b border-white/10 pb-4 mb-8">
              Gestão de Equipa
            </h2>

            <div className="border border-white/10 rounded-lg overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead className="bg-white/5 border-b border-white/10">
                     <tr>
                       <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-300">Membro</th>
                       <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-300 text-right">Cargo</th>
                     </tr>
                   </thead>
                   <tbody className="font-mono text-xs">
                     <tr className="border-b border-white/10 italic">
                       <td className="py-4 px-4 text-slate-300">Funcionalidade em desenvolvimento...</td>
                       <td className="py-4 px-4 text-right">---</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
            </div>

            <button disabled className="w-full bg-white/5 text-slate-300 py-4 text-xs font-bold uppercase tracking-widest cursor-not-allowed border border-white/10 rounded-lg">
               Convidar Novo Membro (V2)
            </button>
          </div>
        )}
        </div>
      </div>
    </div>
  );
}
