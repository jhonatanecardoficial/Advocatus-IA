import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { PortalChat } from "./components/portal-chat";
import { PortalDocuments } from "./components/portal-documents";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api/v1";

export const dynamic = "force-dynamic";

async function getPortalData(token: string) {
  try {
    const res = await fetch(`${API_URL}/portal/access/${token}`, {
      cache: "no-store",
    });
    if (!res.ok) {
      if (res.status === 403 || res.status === 404) return null;
      throw new Error("Erro ao carregar os dados do portal");
    }
    const json = await res.json();
    return json.data || json; // Handle both wrapped and unwrapped response forms
  } catch (err) {
    console.error(err);
    return null;
  }
}

export default async function PortalPage(props: { params: Promise<{ token: string }> }) {
  const { token } = await props.params;
  const data = await getPortalData(token);

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-full flex items-center justify-center mb-6">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2 font-playfair">Acesso Inválido ou Expirado</h2>
        <p className="text-gray-500 max-w-md">
          O link que tentou aceder não é válido, foi revogado pelo advogado, ou já expirou. 
          Por favor, solicite um novo link de acesso.
        </p>
      </div>
    );
  }

  const { matter, tenant, expiresAt } = data;

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-2.5 py-0.5 rounded border border-indigo-100 uppercase tracking-wider">
                {matter.type}
              </span>
              <span className={`text-xs font-medium px-2.5 py-0.5 rounded border uppercase tracking-wider ${
                matter.status === "ATIVO" ? "bg-emerald-50 text-emerald-700 border-emerald-100" :
                matter.status === "ENCERRADO" ? "bg-gray-50 text-gray-700 border-gray-200" :
                matter.status === "SUSPENSO" ? "bg-amber-50 text-amber-700 border-amber-100" :
                "bg-slate-50 text-slate-700 border-slate-200"
              }`}>
                {matter.status}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-playfair">{matter.title}</h1>
            <p className="text-sm text-gray-500 mt-1">
              Referência do Tribunal: {matter.courtReference || "Não definida"}
            </p>
          </div>
          <div className="text-left md:text-right bg-slate-50 p-4 rounded-lg border border-slate-100 shrink-0">
            <p className="text-xs text-gray-500 uppercase font-semibold tracking-wider mb-1">Escritório</p>
            <p className="font-medium text-slate-800">{tenant?.name || "Advocatus IA"}</p>
            <p className="text-xs text-gray-400 mt-2">
              Acesso expira a {format(new Date(expiresAt), "dd 'de' MMMM, yyyy", { locale: ptBR })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Documents */}
        <div className="lg:col-span-2 space-y-6">
          <PortalDocuments documents={matter.documents || []} />
        </div>

        {/* Right Column - Chat */}
        <div className="lg:col-span-1 border border-gray-50 rounded-xl bg-white shadow-sm overflow-hidden flex flex-col h-[600px]">
          <PortalChat messages={matter.messages || []} token={token} />
        </div>
      </div>
    </div>
  );
}
