"use client";

import { motion } from "framer-motion";
import { Zap, Calendar } from "lucide-react";
import Link from 'next/link';

export default function DashboardSidebarCards() {
  return (
    <div className="space-y-8">
      {/* AI Assistant Card */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-panel p-8 bg-gradient-to-br from-navy to-navy-900 text-white relative overflow-hidden group border border-white/10 shadow-premium-lg"
      >
        <div className="absolute -top-10 -right-10 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Zap size={200} className="text-amber animate-pulse" />
        </div>
        <div className="relative z-10 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <motion.div 
              whileHover={{ rotate: 15 }}
              className="p-2 bg-amber rounded-lg shadow-lg"
            >
              <Zap size={20} className="text-navy" />
            </motion.div>
            <div>
              <h3 className="text-lg font-display font-black text-amber leading-none uppercase tracking-tight">Vanguarda IA</h3>
              <span className="text-[10px] font-mono text-white/40 uppercase tracking-widest">Insights em Tempo Real</span>
            </div>
          </div>
          <p className="text-sm text-slate-300 font-medium leading-relaxed mb-8">
            A IA analisou centenas de páginas de jurisprudência. Uma correspondência vital foi detetada para o <span className="text-amber font-bold">PROC-2024-X89</span>.
          </p>
          <button className="w-full bg-white text-navy py-4 text-[11px] font-black uppercase tracking-[0.2em] rounded-2xl hover:bg-amber hover:scale-[1.02] transition-all shadow-xl active:scale-[0.98]">
            Abrir Insights IA
          </button>
        </div>
      </motion.div>

      {/* Agenda Card - Glassmorphism Premium Dark */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-panel p-8 border border-white/10 shadow-premium-lg bg-navy/40 backdrop-blur-xl group overflow-hidden relative"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-amber/5 blur-[80px] -mr-10 -mt-10" />
        
        <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4 relative z-10">
          <h3 className="text-xs font-black uppercase tracking-[0.15em] text-white/80 flex items-center gap-2">
            <Calendar size={16} className="text-amber shadow-glow" />
            Agenda Hoje
          </h3>
          <span className="text-[10px] font-mono text-amber/60 font-bold uppercase tracking-widest">13 DE MAR</span>
        </div>

        <div className="space-y-5 relative z-10">
          {[
            { time: "10:30", title: "Reunião de Estratégia", location: "Sala 2 • Dra. Ana Silva", status: "green" },
            { time: "14:00", title: "Audiência Preliminar", location: "Tribunal de Justiça", status: "amber" }
          ].map((event, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ x: 5, backgroundColor: "rgba(255,255,255,0.05)" }}
              className={`group flex gap-5 items-start p-5 rounded-2xl border transition-all cursor-pointer ${
                idx === 0 
                  ? "bg-white/5 border-white/20 shadow-premium-lg hover:border-amber/40" 
                  : "bg-black/20 border-white/5 hover:border-amber/20 opacity-80 hover:opacity-100"
              }`}
            >
              <div className="flex flex-col items-center">
                <div className={`font-mono text-[11px] font-black px-3 py-1.5 rounded-lg shadow-sm ${
                  idx === 0 ? "text-navy bg-amber" : "text-amber bg-white/5 border border-white/10"
                }`}>
                  {event.time}
                </div>
                {idx === 0 && <div className="w-1 h-12 bg-white/10 my-1 group-hover:bg-amber/40 transition-colors rounded-full"></div>}
              </div>
              <div className="flex-1">
                <div className={`font-bold text-sm uppercase tracking-tight mb-1 group-hover:text-amber transition-colors ${
                  idx === 0 ? "text-white" : "text-white/70"
                }`}>
                  {event.title}
                </div>
                <div className="text-[10px] text-white/50 font-bold flex items-center gap-2 uppercase tracking-tight">
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    event.status === "green" ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)]" : "bg-amber shadow-[0_0_8px_rgba(251,191,36,0.5)]"
                  }`} />
                  {event.location}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        <Link href="/tasks">
          <button className="w-full mt-6 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-amber/60 hover:text-white hover:bg-white/5 rounded-xl transition-all border border-transparent hover:border-white/10">
            Ver Calendário Completo
          </button>
        </Link>
      </motion.div>
    </div>
  );
}
