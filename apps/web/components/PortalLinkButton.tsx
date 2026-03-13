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
      
      // Copiar para o clipboard com redundância
      const copyToClipboard = async (text: string) => {
        try {
          if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            return true;
          }
        } catch (err) {
          console.error("Clipboard API failed, falling back", err);
        }
        
        // Fallback robusto
        try {
          const textArea = document.createElement("textarea");
          textArea.value = text;
          // Prevenção de scroll indesejado
          textArea.style.position = "fixed";
          textArea.style.left = "-9999px";
          textArea.style.top = "0";
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();
          const successful = document.execCommand("copy");
          document.body.removeChild(textArea);
          return successful;
        } catch (err) {
          console.error("Fallback copy failed", err);
          return false;
        }
      };

      const success = await copyToClipboard(fullUrl);
      
      if (success) {
        setCopied(true);
        toast.success("Link do portal copiado!");
        // Reset state after 5 seconds instead of 3
        setTimeout(() => setCopied(false), 5000);
      } else {
        toast.error("Não foi possível copiar o link automaticamente. Tente outra vez.");
      }
      
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
