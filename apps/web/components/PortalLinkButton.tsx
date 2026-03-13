"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Link2, Loader2, Check } from "lucide-react";

interface Props {
  matterId: string;
}

export default function PortalLinkButton({ matterId }: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";
      
      const res = await fetch(`${API_URL}/portal/matters/${matterId}/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": token ? `Bearer ${token}` : "",
        },
      });

      if (!res.ok) {
        throw new Error("Não foi possível gerar o link do portal");
      }

      const rawData = await res.json();
      const data = rawData.data || rawData; // Support both wrapped and unwrapped response

      // Construir o URL completo
      const fullUrl = `${window.location.origin}${data.url}`;
      
      // Copiar para o clipboard
      await navigator.clipboard.writeText(fullUrl);
      
      setCopied(true);
      toast.success("Link do portal copiado para a área de transferência!");
      
      // Reset copied state
      setTimeout(() => setCopied(false), 3000);
      
    } catch (error) {
      console.error(error);
      toast.error("Erro ao gerar link do portal. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={generateLink}
      disabled={loading}
      className="w-full flex justify-center items-center gap-2 px-4 py-2 mt-4 text-sm font-bold uppercase tracking-widest border-2 border-slate-300 text-slate-700 bg-white hover:bg-slate-50 hover:border-navy hover:text-navy transition-colors disabled:opacity-50"
    >
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          A gerar...
        </>
      ) : copied ? (
        <>
          <Check className="w-4 h-4 text-emerald-600" />
          <span className="text-emerald-700">Link Copiado!</span>
        </>
      ) : (
        <>
          <Link2 className="w-4 h-4" />
          Acesso Cliente
        </>
      )}
    </button>
  );
}
