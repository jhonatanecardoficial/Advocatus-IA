"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { FileText, Download, FileJson, FileType, FileImage, File } from "lucide-react";

interface Document {
  id: string;
  filename: string;
  sizeBytes: number;
  createdAt: string;
  mimeType: string;
}

export function PortalDocuments({ documents }: { documents: Document[] }) {
  
  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes("pdf")) return <FileText className="w-5 h-5 text-red-500" />;
    if (mimeType.includes("image")) return <FileImage className="w-5 h-5 text-blue-500" />;
    if (mimeType.includes("word") || mimeType.includes("document")) return <FileType className="w-5 h-5 text-blue-700" />;
    if (mimeType.includes("excel") || mimeType.includes("spreadsheet")) return <FileJson className="w-5 h-5 text-emerald-600" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const formatBytes = (bytes: number, decimals = 2) => {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  if (documents.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center flex flex-col items-center justify-center h-64">
        <div className="w-16 h-16 bg-gray-50 text-gray-400 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum documento partilhado</h3>
        <p className="text-sm text-gray-500 max-w-sm">
          Ainda não foram disponibilizados documentos para este processo. Contacte o seu advogado se acha que isto é um erro.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Documentos Partilhados</h2>
          <p className="text-sm text-gray-500 mt-1">
            Ficheiros disponibilizados pelo seu advogado.
          </p>
        </div>
        <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 font-semibold text-sm">
          {documents.length}
        </span>
      </div>
      
      <div className="divide-y divide-gray-100">
        {documents.map((doc) => (
          <div key={doc.id} className="p-4 sm:p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 group">
            <div className="flex items-start gap-4">
              <div className="p-2.5 bg-white border border-gray-200 shadow-sm rounded-lg shrink-0">
                {getFileIcon(doc.mimeType)}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                  {doc.filename}
                </h3>
                <div className="flex items-center gap-3 mt-1.5 text-xs text-gray-500">
                  <span className="font-medium">{formatBytes(doc.sizeBytes)}</span>
                  <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                  <span>Partilhado a {format(new Date(doc.createdAt), "dd/MM/yyyy", { locale: ptBR })}</span>
                </div>
              </div>
            </div>
            
            <button 
              className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 hover:text-indigo-600 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              onClick={() => alert("Na versão final, isto iniciará o download do ficheiro.")}
            >
              <Download className="w-4 h-4" />
              <span>Descarregar</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
