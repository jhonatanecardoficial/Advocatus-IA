"use client";

import { motion } from "framer-motion";
import { TrendingUp } from "lucide-react";
import Link from "next/link";
import AddMatterModal from "@/components/AddMatterModal";

interface DashboardHeaderProps {
  userName: string;
  tenantId: string;
}

export default function DashboardHeader({ userName, tenantId }: DashboardHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-amber/10 border border-amber/20 text-amber text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
            Portal Premium
          </span>
          <span className="text-slate-400 text-[10px] font-mono tracking-widest uppercase opacity-70">
            v1.2.0 • {tenantId || "Escritório Local"}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display font-black text-white tracking-tight leading-none">
          Bem-vindo, <span className="text-gradient">{userName ? userName.split(" ")[0] : "Advogado"}</span>
        </h1>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        className="flex gap-3"
      >
        <AddMatterModal />
        {/* Link para a página de Relatórios */}
        <Link href="/reports" aria-label="Abrir Relatórios">
          <button className="px-6 py-4 bg-white/50 border border-slate-200 text-navy text-[11px] font-bold uppercase tracking-widest hover:bg-white hover:shadow-lg transition-all rounded-2xl flex items-center gap-2 active:scale-95">
            <TrendingUp className="w-4 h-4 text-navy" />
            Relatórios
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
