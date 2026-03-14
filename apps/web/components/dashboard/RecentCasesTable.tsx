"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowUpRight, Scale } from "lucide-react";

interface Matter {
  id: string;
  courtReference?: string;
  client?: { name: string };
  type: string;
  status: string;
}

interface RecentCasesTableProps {
  matters: Matter[];
}

export default function RecentCasesTable({ matters }: RecentCasesTableProps) {
  if (matters.length === 0) {
    return (
      <div className="glass-panel overflow-hidden border border-white/40 shadow-premium p-20 text-center">
        <div className="flex flex-col items-center gap-2 opacity-30">
          <Scale size={48} className="text-navy" />
          <p className="text-xs font-bold uppercase tracking-widest text-navy">Nenhum processo recente</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-panel overflow-hidden border border-white/40 shadow-premium bg-white/5">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-navy/5 border-b border-navy/10">
            <tr>
              <th className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Ref / Cliente</th>
              <th className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Jurisdição</th>
              <th className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/70">Status</th>
              <th className="py-5 px-6 text-[10px] font-black uppercase tracking-[0.2em] text-white/70 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="text-sm">
            {matters.slice(0, 5).map((matter, idx) => (
              <motion.tr
                key={matter.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="border-b border-navy/5 hover:bg-white/40 transition-all group"
              >
                <td className="py-5 px-6">
                  <div className="font-bold text-white group-hover:text-amber transition-colors flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white/10 group-hover:bg-amber transition-colors"></div>
                    {matter.courtReference || matter.id.substring(0, 8)}
                  </div>
                  <div className="text-[11px] text-slate-400 font-medium ml-4 mt-1">
                    {matter.client?.name || "Sem Entidade Associada"}
                  </div>
                </td>
                <td className="py-5 px-6">
                  <span className="text-[11px] font-bold text-slate-500 bg-slate-100/50 px-2 py-1 rounded-lg border border-slate-200/50 uppercase tracking-tighter">
                    {matter.type}
                  </span>
                </td>
                <td className="py-5 px-6">
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                    matter.status === 'ATIVO' 
                      ? 'bg-green-50 text-green-700 border-green-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${matter.status === 'ATIVO' ? 'bg-green-500 animate-pulse' : 'bg-amber-500'}`}></span>
                    {matter.status}
                  </span>
                </td>
                <td className="py-5 px-6 text-right">
                  <Link 
                    href={`/matters/${matter.id}`} 
                    className="inline-flex items-center gap-2 px-4 py-2 bg-navy text-white hover:bg-amber hover:text-navy hover:shadow-lg transition-all rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-[0.98]"
                  >
                    Abrir
                    <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
