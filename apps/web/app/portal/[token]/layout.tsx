import { ReactNode } from "react";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-inter">
      <header className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-slate-900 border border-slate-700 flex items-center justify-center">
            <span className="text-white font-playfair font-bold text-lg">A</span>
          </div>
          <h1 className="font-playfair text-xl font-semibold text-slate-800">
            Advocatus IA <span className="text-slate-400 font-inter text-sm font-normal ml-2">| Portal do Cliente</span>
          </h1>
        </div>
      </header>
      
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto w-full">
        {children}
      </main>
      
      <footer className="py-6 text-center text-sm text-gray-400 border-t border-gray-200 bg-white">
        &copy; {new Date().getFullYear()} Advocatus IA. Todos os direitos reservados.
      </footer>
    </div>
  );
}
