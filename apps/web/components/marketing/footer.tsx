export function Footer() {
    return (
        <footer 
            aria-label="Rodapé do Site"
            className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800"
        >
            <div className="max-w-7xl mx-auto px-6 md:px-12">
                <div className="grid md:grid-cols-4 gap-8 mb-12">
                    <div>
                        <div className="w-8 h-8 bg-slate-800 flex items-center justify-center text-slate-300 font-display font-bold mb-4">A</div>
                        <p className="text-sm">Desenvolvido com rigor para o mercado jurídico português. Compliant com RGPD e eIDAS.</p>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Produto</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition">Funcionalidades</a></li>
                            <li><a href="#" className="hover:text-white transition">Preços & Planos</a></li>
                            <li><a href="#" className="hover:text-white transition">Programa de Referral</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Legal e Compliance</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="#" className="hover:text-white transition">Política de Privacidade</a></li>
                            <li><a href="#" className="hover:text-white transition">Termos de Utilização</a></li>
                            <li><a href="#" className="hover:text-white transition">Conformidade RGPD</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-white mb-4">Contacto direto</h4>
                        <ul className="space-y-2 text-sm">
                            <li><a href="mailto:piloto@advocatus.ai" className="hover:text-white transition">piloto@advocatus.ai</a></li>
                            <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
                        </ul>
                    </div>
                </div>
                <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row justify-between items-center text-sm">
                    <p>&copy; 2026 Advocatus IA. Todos os direitos reservados.</p>
                    <p className="mt-4 md:mt-0 font-mono text-xs opacity-50">v1.0.0-pilot</p>
                </div>
            </div>
        </footer>
    );
}
