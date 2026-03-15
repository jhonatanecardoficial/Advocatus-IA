"use client";

import { useState } from "react";
import { Download, Building2, Save, FileCheck, Info } from "lucide-react";
import { toast } from "sonner";

interface SaftExportPanelProps {
  token: string;
  tenantDetails?: any;
}

export default function SaftExportPanel({ token, tenantDetails }: SaftExportPanelProps) {
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [details, setDetails] = useState({
    nif: tenantDetails?.nif || "",
    address: tenantDetails?.address || "",
    postalCode: tenantDetails?.postalCode || "",
    city: tenantDetails?.city || "",
    phone: tenantDetails?.phone || "",
    email: tenantDetails?.email || "",
    commercialRegistration: tenantDetails?.commercialRegistration || "",
  });

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

  const handleUpdateDetails = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/tenants/me`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(details),
      });

      if (!res.ok) throw new Error("Falha ao atualizar detalhes fiscais");
      
      toast.success("Dados fiscais atualizados com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro ao atualizar dados.");
    } finally {
      setLoading(false);
    }
  };

  const handleExportSaft = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/invoices/export/saft?startDate=${startDate}&endDate=${endDate}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!res.ok) throw new Error("Erro ao gerar SAF-T");
      
      const data = await res.json();
      
      // Download XML
      const blob = new Blob([data.xml], { type: "application/xml" });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = data.filename;
      a.click();
      window.URL.revokeObjectURL(url);
      
      toast.success("SAF-T exportado com sucesso!");
    } catch (error) {
      console.error(error);
      toast.error("Erro na exportação SAF-T.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 animate-in fade-in zoom-in duration-500">
      {/* Configuração Fiscal */}
      <div className="glass-panel border border-white/10 p-6 bg-navy/30 backdrop-blur-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.07] transition-opacity">
            <Building2 size={120} />
        </div>
        
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
            <Building2 className="w-5 h-5 text-amber-400" />
          </div>
          <h3 className="text-sm font-black text-white uppercase tracking-widest">Configuração Fiscal</h3>
        </div>

        <div className="grid grid-cols-2 gap-4 relative z-10">
          <div className="space-y-1">
            <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">NIF da Empresa</label>
            <input 
              value={details.nif}
              onChange={(e) => setDetails({...details, nif: e.target.value})}
              placeholder="999999990"
              className="w-full bg-white/5 border border-white/10 p-3 text-xs text-white font-mono focus:border-amber/50 outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Registo Comercial</label>
            <input 
              value={details.commercialRegistration}
              onChange={(e) => setDetails({...details, commercialRegistration: e.target.value})}
              placeholder="Conservatória de Lisboa"
              className="w-full bg-white/5 border border-white/10 p-3 text-xs text-white font-mono focus:border-amber/50 outline-none transition-all"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Morada Fiscal</label>
            <input 
              value={details.address}
              onChange={(e) => setDetails({...details, address: e.target.value})}
              placeholder="Rua da Liberdade, nº 123"
              className="w-full bg-white/5 border border-white/10 p-3 text-xs text-white font-mono focus:border-amber/50 outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Código Postal</label>
            <input 
              value={details.postalCode}
              onChange={(e) => setDetails({...details, postalCode: e.target.value})}
              placeholder="1000-001"
              className="w-full bg-white/5 border border-white/10 p-3 text-xs text-white font-mono focus:border-amber/50 outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Cidade</label>
            <input 
              value={details.city}
              onChange={(e) => setDetails({...details, city: e.target.value})}
              placeholder="Lisboa"
              className="w-full bg-white/5 border border-white/10 p-3 text-xs text-white font-mono focus:border-amber/50 outline-none transition-all"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Telefone</label>
            <input 
              value={details.phone}
              onChange={(e) => setDetails({...details, phone: e.target.value})}
              placeholder="+351 210 000 000"
              className="w-full bg-white/5 border border-white/10 p-3 text-xs text-white font-mono focus:border-amber/50 outline-none transition-all"
            />
          </div>
          <div className="col-span-2 space-y-1">
            <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Email de Faturação</label>
            <input 
              value={details.email}
              onChange={(e) => setDetails({...details, email: e.target.value})}
              placeholder="financeiro@empresa.pt"
              className="w-full bg-white/5 border border-white/10 p-3 text-xs text-white font-mono focus:border-amber/50 outline-none transition-all"
            />
          </div>
        </div>

        <button 
          onClick={handleUpdateDetails}
          disabled={loading}
          className="w-full mt-6 py-4 bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-2 group/btn"
        >
          <Save className="w-3 h-3 text-amber-400 group-hover/btn:scale-110 transition-transform" />
          Guardar Configuração
        </button>
      </div>

      {/* Exportação SAF-T */}
      <div className="glass-panel border border-white/10 p-6 bg-navy/30 backdrop-blur-xl flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
              <FileCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Portal SAF-T PT</h3>
          </div>

          <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] leading-loose mb-6 font-mono">
            Gere o ficheiro oficial para reporte à Autoridade Tributária. <br/>
            Assegura que todas as faturas do período estão <span className="text-emerald-400/80">certificadas</span>.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Data Início</label>
              <input 
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-navy/50 border border-white/10 p-3 text-xs text-white font-mono focus:border-emerald-500/50 outline-none transition-all invert-calendar-icon"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] text-white/40 uppercase font-black tracking-widest ml-1">Data Fim</label>
              <input 
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-navy/50 border border-white/10 p-3 text-xs text-white font-mono focus:border-emerald-500/50 outline-none transition-all invert-calendar-icon"
              />
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-3">
          <div className="flex items-start gap-3 p-3 bg-white/5 border border-white/5 rounded">
            <Info className="w-4 h-4 text-emerald-400/50 mt-0.5" />
            <p className="text-[9px] text-white/40 leading-relaxed uppercase tracking-tighter">
              O ficheiro gerado segue a Portaria 144/2019 e inclui todas as faturas certificadas no período selecionado.
            </p>
          </div>
          
          <button 
            onClick={handleExportSaft}
            disabled={loading}
            className="w-full py-4 bg-emerald-500 text-navy text-[10px] font-black uppercase tracking-[0.2em] hover:scale-[1.01] transition-all shadow-[0_0_30px_rgba(16,185,129,0.2)] flex items-center justify-center gap-3"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-navy border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                Exportar SAF-T PT (XML)
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
