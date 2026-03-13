"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Link2, Loader2, Check } from "lucide-react";
import { generatePortalLinkAction } from "@/app/actions/portal";

interface Props {
  matterId: string;
}

export default function PortalLinkButton({ matterId }: Props) {
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const generateLink = async () => {
    setLoading(true);
    try {
      const result = await generatePortalLinkAction(matterId);
      
      if (result.error) {
        toast.error(result.error);
        return;
      }

      const rawData = result.data;
      const data = rawData.data || rawData; // Support both wrapped and unwrapped response

      // Construir o URL completo
      const portalPath = data.url || (rawData.url); // Handle different response formats
      const fullUrl = `${window.location.origin}${portalPath}`;
      
      // Copiar para o clipboard com fallback
      if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(fullUrl);
      } else {
        // Fallback para browsers antigos ou contextos não seguros
        const textArea = document.createElement("textarea");
        textArea.value = fullUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand("copy");
        document.body.removeChild(textArea);
      }
      
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
