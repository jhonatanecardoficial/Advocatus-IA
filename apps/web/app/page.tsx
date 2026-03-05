'use client'

import Link from 'next/link'
import { ChevronRight, Shield, Clock, Users, FileText, Zap, Award } from 'lucide-react'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-body">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 glass-effect border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-navy flex items-center justify-center text-white font-display font-bold">A</div>
                        <span className="font-display text-xl font-bold text-navy hidden sm:inline">Advocatus IA</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link href="/login" className="text-navy hover:text-navy-800 transition font-medium">
                            Entrar
                        </Link>
                        <Link href="/register" className="button-premium button-primary">
                            Começar Grátis
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 md:py-32">
                <div className="max-w-7xl mx-auto px-6 md:px-12 grid md:grid-cols-2 gap-12 items-center">
                    <div className="animate-fade-in">
                        <h1 className="font-display text-4xl md:text-5xl font-bold text-navy mb-6 leading-tight">
                            A Advocacia não tem de ser caótica
                        </h1>
                        <p className="text-lg text-slate-600 mb-8 leading-relaxed">
                            Recupere o controlo do seu tempo. Gerencie processos, clientes e assinaturas digitais tudo num só lugar com inteligência artificial.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Link href="/register" className="button-premium button-primary group">
                                Começar Agora
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition" />
                            </Link>
                            <button className="button-premium button-secondary">
                                Ver Demo
                            </button>
                        </div>
                    </div>

                    {/* Hero Image Placeholder */}
                    <div className="hidden md:block relative h-96">
                        <div className="absolute inset-0 bg-gradient-to-br from-navy/10 to-amber/10 rounded-2xl animate-pulse-glow"></div>
                        <div className="absolute inset-4 bg-white rounded-xl border border-slate-200 shadow-elevated flex items-center justify-center">
                            <span className="text-slate-400">Dashboard Preview</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Social Proof Section */}
            <section className="py-12 md:py-16 bg-navy/5 border-y border-slate-200/50">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <p className="text-center text-sm font-semibold text-slate-600 uppercase tracking-wider mb-8">Segurança e Conformidade</p>
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="text-center">
                            <Shield className="w-8 h-8 text-navy mx-auto mb-3" />
                            <p className="font-semibold text-navy">Encriptação End-to-End</p>
                            <p className="text-sm text-slate-600 mt-1">Dados protegidos com AES-256</p>
                        </div>
                        <div className="text-center">
                            <Award className="w-8 h-8 text-navy mx-auto mb-3" />
                            <p className="font-semibold text-navy">RGPD Compliant</p>
                            <p className="text-sm text-slate-600 mt-1">Certificado para Portugal e EU</p>
                        </div>
                        <div className="text-center">
                            <FileText className="w-8 h-8 text-navy mx-auto mb-3" />
                            <p className="font-semibold text-navy">Assinatura Digital</p>
                            <p className="text-sm text-slate-600 mt-1">Qualificado A.Q.E.S</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section (Z-Pattern) */}
            <section className="py-20 md:py-32">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <h2 className="font-display text-3xl md:text-4xl font-bold text-navy text-center mb-16">Tudo o que precisa para escalar</h2>

                    <div className="z-pattern-grid">
                        {/* Feature 1 */}
                        <div className="card-premium p-8 hover-lift animate-fade-in">
                            <Clock className="w-10 h-10 text-amber mb-4" />
                            <h3 className="font-display text-xl font-bold text-navy mb-3">Gestão de Tempo</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Calendário inteligente com lembretes automáticos. Recupere horas de produtividade diariamente.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="card-premium p-8 hover-lift animate-fade-in" style={{ animationDelay: '0.1s' }}>
                            <Users className="w-10 h-10 text-amber mb-4" />
                            <h3 className="font-display text-xl font-bold text-navy mb-3">Gestão de Clientes</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Base de dados centralizada com histórico de comunicações. Atenda melhor, mais rápido.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="card-premium p-8 hover-lift animate-fade-in" style={{ animationDelay: '0.2s' }}>
                            <FileText className="w-10 h-10 text-amber mb-4" />
                            <h3 className="font-display text-xl font-bold text-navy mb-3">Processos Jurídicos</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Rastreie processos do início ao fim. Alertas automáticos para prazos críticos.
                            </p>
                        </div>

                        {/* Feature 4 */}
                        <div className="card-premium p-8 hover-lift animate-fade-in" style={{ animationDelay: '0.3s' }}>
                            <Zap className="w-10 h-10 text-amber mb-4" />
                            <h3 className="font-display text-xl font-bold text-navy mb-3">IA Integrada</h3>
                            <p className="text-slate-600 leading-relaxed">
                                Análise automática de documentos e geração de templates. Trabalhe mais inteligentemente.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-32 bg-navy text-white">
                <div className="max-w-4xl mx-auto px-6 md:px-12 text-center">
                    <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
                        Pronto para revolucionar o seu escritório?
                    </h2>
                    <p className="text-lg text-navy-100 mb-10">
                        Junte-se a centenas de advogados que já estão a ganhar tempo e a oferecer melhor atendimento com Advocatus IA.
                    </p>
                    <Link href="/register" className="button-premium button-amber inline-flex">
                        Começar Teste Gratuito
                        <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-navy text-navy-100 py-12 border-t border-navy-700">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div>
                            <div className="w-8 h-8 rounded-lg bg-amber/20 flex items-center justify-center text-amber font-display font-bold mb-4">A</div>
                            <p className="text-sm">Advocatus IA — Plataforma de Gestão Jurídica com IA para Portugal.</p>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Produto</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition">Features</a></li>
                                <li><a href="#" className="hover:text-white transition">Preços</a></li>
                                <li><a href="#" className="hover:text-white transition">API</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Legal</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="#" className="hover:text-white transition">Privacidade</a></li>
                                <li><a href="#" className="hover:text-white transition">Termos</a></li>
                                <li><a href="#" className="hover:text-white transition">RGPD</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold mb-4">Contacto</h4>
                            <ul className="space-y-2 text-sm">
                                <li><a href="mailto:support@advocatus.ai" className="hover:text-white transition">support@advocatus.ai</a></li>
                                <li><a href="#" className="hover:text-white transition">LinkedIn</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-navy-700 pt-8 text-center text-sm text-navy-200">
                        <p>&copy; 2026 Advocatus IA. Todos os direitos reservados.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}
