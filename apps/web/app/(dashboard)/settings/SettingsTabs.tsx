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
      {/* Sidebar Navigation */}
      <div className="w-full md:w-64 space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-colors border-2 ${
              activeTab === tab.id
                ? "bg-navy text-white border-navy"
                : "bg-white text-slate-500 border-transparent hover:border-navy/30"
            }`}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content Area */}
      <div className="flex-1 max-w-2xl bg-white border-2 border-navy p-8 shadow-[8px_8px_0px_#D4A853]">
        {activeTab === "escritorio" && (
          <form onSubmit={handleUpdateTenant} className="space-y-6">
            <h2 className="text-2xl font-display font-black text-navy uppercase tracking-tight border-b-2 border-navy pb-4 mb-8">
              Definições do Escritório
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase text-navy mb-1 ml-1 tracking-widest">Nome da Firma</label>
                <input
                  type="text"
                  value={tenantForm.name}
                  onChange={(e) => setTenantForm({ ...tenantForm, name: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-slate-200 focus:border-navy outline-none transition-colors font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-navy mb-1 ml-1 tracking-widest">Logo URL (Preview)</label>
                <input
                  type="text"
                  value={tenantForm.logoUrl}
                  onChange={(e) => setTenantForm({ ...tenantForm, logoUrl: e.target.value })}
                  placeholder="https://exemplo.com/logo.png"
                  className="w-full px-4 py-3 border-2 border-slate-200 focus:border-navy outline-none transition-colors font-mono text-sm"
                />
              </div>

              <div className="bg-slate-50 p-4 border-2 border-dashed border-slate-200 font-mono text-[10px] text-slate-500">
                Tenant ID: {tenant?.id}
                <br />
                Plan: {tenant?.plan} • Status: {tenant?.billingStatus}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-navy text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-amber-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Save size={16} />
              {loading ? "A Gravar..." : "Guardar Alterações"}
            </button>
          </form>
        )}

        {activeTab === "perfil" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-black text-navy uppercase tracking-tight border-b-2 border-navy pb-4 mb-8">
              A Minha Identidade
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-slate-50 border-2 border-navy">
                <div className="w-16 h-16 bg-navy flex items-center justify-center text-white text-xl font-bold">
                  {user?.name?.[0] || "A"}
                </div>
                <div>
                  <div className="font-bold text-navy uppercase tracking-tight">{user?.name}</div>
                  <div className="text-xs font-mono text-slate-500">{user?.email}</div>
                </div>
              </div>

              <div className="p-4 border-2 border-amber-500/20 bg-amber-50 rounded-sm">
                <div className="flex items-center gap-2 text-amber-600 mb-2">
                  <Shield size={16} />
                  <span className="text-xs font-bold uppercase tracking-widest">Nível de Acesso</span>
                </div>
                <div className="text-navy font-bold uppercase text-lg">{user?.role}</div>
                <p className="text-xs text-slate-500 mt-1">Tens permissões totais para gerir este escritório.</p>
              </div>
            </div>
            
            <p className="text-xs text-slate-400 font-mono">
              Para alterar os teus dados de autenticação (email/password), contacta o Administrador do Sistema.
            </p>
          </div>
        )}

        {activeTab === "equipa" && (
          <div className="space-y-6">
            <h2 className="text-2xl font-display font-black text-navy uppercase tracking-tight border-b-2 border-navy pb-4 mb-8">
              Gestão de Equipa
            </h2>

            <div className="border-2 border-navy">
               <div className="overflow-x-auto">
                 <table className="w-full text-left border-collapse">
                   <thead className="bg-slate-50 border-b-2 border-navy">
                     <tr>
                       <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-navy">Membro</th>
                       <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-navy text-right">Cargo</th>
                     </tr>
                   </thead>
                   <tbody className="font-mono text-xs">
                     <tr className="border-b border-slate-100 italic">
                       <td className="py-4 px-4 text-slate-400">Funcionalidade em desenvolvimento...</td>
                       <td className="py-4 px-4 text-right">---</td>
                     </tr>
                   </tbody>
                 </table>
               </div>
            </div>

            <button disabled className="w-full bg-slate-100 text-slate-400 py-4 text-xs font-bold uppercase tracking-widest cursor-not-allowed border-2 border-slate-200">
               Convidar Novo Membro (V2)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
