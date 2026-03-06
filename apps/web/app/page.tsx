'use client'

import Link from 'next/link'
import { ChevronRight, Shield, FileText, CheckCircle2 } from 'lucide-react'

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-slate-50 font-body selection:bg-amber/20 selection:text-navy">
            {/* Top Navigation */}
            <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/50">
                <div className="max-w-7xl mx-auto px-6 md:px-12 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-navy flex items-center justify-center text-amber font-display font-bold shadow-sm">A</div>
                        <span className="font-display text-2xl font-bold text-navy hidden sm:inline tracking-tight">Advocatus IA</span>
                    </div>
                    <div className="flex items-center gap-6">
                        <Link href="/login" className="text-slate-600 hover:text-navy transition font-medium">
                            Portal do Cliente
                        </Link>
                        <Link href="/login" className="text-navy hover:text-amber transition font-medium">
                            Entrar
                        </Link>
                        <Link href="/login" className="bg-navy text-white px-6 py-2.5 font-medium hover:bg-navy-800 transition shadow-sm rounded-none">
                            Acesso Antecipado
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-24 pb-32">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-slate-100 to-transparent pointer-events-none"></div>

                <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10 grid md:grid-cols-2 gap-16 items-center">
                    <div className="animate-fade-in">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber/10 text-amber-700 font-medium text-sm mb-6 border border-amber/20">
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                            Acesso Exclusivo para Escritórios Selecionados
                        </div>
                        <h1 className="font-display text-5xl md:text-6xl font-extrabold text-navy mb-6 leading-tight tracking-tight">
                            A Excelência Jurídica Exige <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-400">Rigor</span>.
                        </h1>
                        <p className="text-xl text-slate-600 mb-10 leading-relaxed font-light">
                            Eleve a gestão do seu escritório com uma plataforma desenvolvida para a realidade jurídica portuguesa. Gestão de processos, faturação e Inteligência Artificial com garantia de conformidade.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 mb-4">
                            <Link href="/login" className="bg-navy text-white px-8 py-4 font-medium hover:bg-navy-800 transition shadow-md hover:shadow-lg flex items-center justify-center gap-2 group rounded-none">
                                Solicitar Acesso Piloto
                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                            </Link>
                            <a href="#features" className="px-8 py-4 font-medium text-navy border border-slate-300 hover:border-navy hover:bg-slate-50 transition flex items-center justify-center rounded-none">
                                Explorar Funcionalidades
                            </a>
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                            * Diferente de um "teste grátis", o acesso piloto significa atendimento humano: fazemos a configuração, o onboarding dedicado e garantimos a transformação digital no seu dia-a-dia.
                        </p>
                    </div>

                    {/* Hero Dashboard Mockup */}
                    <div className="hidden md:block relative h-[500px] w-full perspective-1000">
                        <div className="absolute inset-0 bg-white shadow-2xl rounded-sm border border-slate-200 transform-gpu rotate-y-[-10deg] rotate-x-[5deg] translate-x-4 flex overflow-hidden">
                            {/* Sidebar Mockup */}
                            <div className="w-48 bg-navy flex flex-col p-4 border-r border-navy-800">
                                <div className="flex items-center gap-2 mb-8">
                                    <div className="w-6 h-6 bg-amber"></div>
                                    <div className="h-2 w-20 bg-white/20"></div>
                                </div>
                                <div className="space-y-3 flex-1">
                                    <div className="h-8 bg-white/10 rounded flex items-center px-2 gap-2">
                                        <div className="w-3 h-3 bg-white/40"></div>
                                        <div className="h-2 w-16 bg-white/40"></div>
                                    </div>
                                    <div className="h-8 rounded flex items-center px-2 gap-2">
                                        <div className="w-3 h-3 bg-white/20"></div>
                                        <div className="h-2 w-20 bg-white/20"></div>
                                    </div>
                                    <div className="h-8 rounded flex items-center px-2 gap-2">
                                        <div className="w-3 h-3 bg-white/20"></div>
                                        <div className="h-2 w-24 bg-white/20"></div>
                                    </div>
                                </div>
                            </div>
                            {/* Main Content Mockup */}
                            <div className="flex-1 bg-slate-50 flex flex-col">
                                {/* Topbar */}
                                <div className="h-14 bg-white border-b border-slate-200 flex items-center px-6 justify-between">
                                    <div className="h-2 w-32 bg-slate-200"></div>
                                    <div className="w-6 h-6 rounded-full bg-slate-200"></div>
                                </div>
                                <div className="p-6 flex-1">
                                    <div className="h-8 w-48 bg-slate-200 mb-6"></div>
                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="h-24 bg-white border border-slate-200 rounded p-4 flex flex-col justify-between">
                                            <div className="h-2 w-16 bg-slate-200"></div>
                                            <div className="h-6 w-12 bg-navy"></div>
                                        </div>
                                        <div className="h-24 bg-white border border-slate-200 rounded p-4 flex flex-col justify-between">
                                            <div className="h-2 w-20 bg-slate-200"></div>
                                            <div className="h-6 w-8 bg-amber"></div>
                                        </div>
                                        <div className="h-24 bg-white border border-slate-200 rounded p-4 flex flex-col justify-between">
                                            <div className="h-2 w-14 bg-slate-200"></div>
                                            <div className="h-6 w-16 bg-navy"></div>
                                        </div>
                                    </div>
                                    <div className="h-32 bg-white border border-slate-200 rounded p-4">
                                        <div className="h-3 w-1/4 bg-slate-200 mb-4"></div>
                                        <div className="space-y-2">
                                            <div className="h-2 w-full bg-slate-100"></div>
                                            <div className="h-2 w-full bg-slate-100"></div>
                                            <div className="h-2 w-3/4 bg-slate-100"></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* AI Guardrails & Trust Section */}
            <section className="py-20 bg-navy text-white border-y border-navy-800">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="grid md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="font-display text-4xl font-bold text-white mb-6 tracking-tight">Inteligência Artificial que Respeita a Toga.</h2>
                            <p className="text-lg text-slate-300 mb-8 font-light leading-relaxed">
                                A nossa IA é estritamente treinada no Diário da República e em fontes oficiais (dados.gov.pt). Sem alucinações baseadas na internet genérica. Sem uso de dados protegidos por direitos de autor.
                            </p>
                            <div className="bg-navy-800 p-6 border-l-4 border-amber shadow-sm">
                                <p className="text-sm text-slate-200 font-mono">
                                    "A IA não substitui o conselho jurídico nem dispensa a consulta das publicações oficiais. Atua como um assistente de pesquisa altamente especializado."
                                </p>
                            </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="bg-navy-800 p-6 shadow-md border border-navy-600">
                                <Shield className="w-8 h-8 text-amber mb-4" />
                                <h3 className="font-bold text-white text-xl mb-2">RGPD Compliant</h3>
                                <p className="text-sm text-slate-300">Arquitetura de dados isolada (Multi-tenant) para o seu escritório.</p>
                            </div>
                            <div className="bg-navy-800 p-6 shadow-md border border-navy-600">
                                <FileText className="w-8 h-8 text-amber mb-4" />
                                <h3 className="font-bold text-white text-xl mb-2">Assinatura QES</h3>
                                <p className="text-sm text-slate-300">Integração planeada com Autenticação.gov e Cartão de Cidadão.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 bg-white">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="text-center max-w-3xl mx-auto mb-20">
                        <h2 className="font-display text-4xl font-bold text-navy mb-6 tracking-tight">Gestão Integral do Seu Escritório</h2>
                        <p className="text-lg text-slate-600">Esqueça a fragmentação entre Excel, WhatsApp e emails. Centralize a sua prática jurídica com ferramentas desenhadas para advogados.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Feature 1 */}
                        <div className="p-8 border border-slate-200 hover:border-navy transition duration-300 group bg-slate-50 relative overflow-hidden">
                            <div className="w-12 h-1 bg-amber mb-6 group-hover:w-full transition-all duration-500"></div>
                            <h3 className="font-display text-xl font-bold text-navy mb-4">Processos e Clientes</h3>
                            <p className="text-slate-600 mb-6 font-light">
                                Ficha de cliente completa, verificação automática de conflitos de interesse e linha do tempo do processo.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                                    <span>Conflict Check Automático</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                                    <span>Portal Seguro do Cliente</span>
                                </li>
                            </ul>
                        </div>

                        {/* Feature 2 */}
                        <div className="p-8 border border-slate-200 hover:border-navy transition duration-300 group bg-slate-50 relative overflow-hidden">
                            <div className="w-12 h-1 bg-navy mb-6 group-hover:w-full transition-all duration-500"></div>
                            <h3 className="font-display text-xl font-bold text-navy mb-4">Honorários e Faturação</h3>
                            <p className="text-slate-600 mb-6 font-light">
                                Registe horas faturáveis com um clique e gere faturas prontas para envio, sem perder minúcias.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-navy shrink-0 mt-0.5" />
                                    <span>Time Tracking Integrado</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-navy shrink-0 mt-0.5" />
                                    <span>Controlo de Despesas</span>
                                </li>
                            </ul>
                        </div>

                        {/* Feature 3 */}
                        <div className="p-8 border border-slate-200 hover:border-navy transition duration-300 group bg-slate-50 relative overflow-hidden">
                            <div className="w-12 h-1 bg-amber mb-6 group-hover:w-full transition-all duration-500"></div>
                            <h3 className="font-display text-xl font-bold text-navy mb-4">Prazos e Documentos</h3>
                            <p className="text-slate-600 mb-6 font-light">
                                Gestão documental centralizada por processo com controlo rigoroso de versões e prazos processuais.
                            </p>
                            <ul className="space-y-3">
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                                    <span>Alertas de Prazos Críticos</span>
                                </li>
                                <li className="flex items-start gap-2 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-amber shrink-0 mt-0.5" />
                                    <span>Validação LTA de Assinaturas</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section className="py-24 bg-slate-50 border-t border-slate-200">
                <div className="max-w-7xl mx-auto px-6 md:px-12">
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="font-display text-3xl font-bold text-navy mb-4 tracking-tight">Planos Transparentes e Claros</h2>
                        <p className="text-slate-600">Valores definitivos, sem custos ocultos. Escolha o plano adequado à dimensão do seu escritório, sabendo exatamente o que está incluído de forma cumulativa.</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        {/* Plan 1 */}
                        <div className="bg-white border border-slate-200 p-8 flex flex-col">
                            <h3 className="font-bold text-navy text-xl mb-2">Prática Solo</h3>
                            <div className="mb-6">
                                <span className="text-4xl font-display font-bold text-navy">€29</span>
                                <span className="text-slate-500">/mês</span>
                            </div>
                            <p className="text-sm text-slate-600 mb-8 border-b border-slate-100 pb-6">
                                Ferramentas fundamentais completas para quem pratica a solo. Tudo incluído sem limites escondidos.
                            </p>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-navy shrink-0" />
                                    <span className="font-medium">1 Utilizador com Acesso Total</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-navy shrink-0" />
                                    <span>Processos e Clientes Ilimitados</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-navy shrink-0" />
                                    <span>Faturação e Gestão Documental Base</span>
                                </li>
                            </ul>
                        </div>

                        {/* Plan 2 */}
                        <div className="bg-navy border border-navy shadow-xl flex flex-col relative transform md:-translate-y-4">
                            <div className="absolute top-0 left-0 w-full h-1 bg-amber"></div>
                            <div className="p-8 flex-1 flex flex-col">
                                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white font-medium text-xs mb-4 w-max border border-white/20">
                                    O Mais Escolhido
                                </div>
                                <h3 className="font-bold text-white text-xl mb-2">Escritório Pequeno</h3>
                                <div className="mb-6">
                                    <span className="text-4xl font-display font-bold text-white">€79</span>
                                    <span className="text-navy-200">/mês</span>
                                </div>
                                <p className="text-sm text-slate-300 mb-8 border-b border-navy-700 pb-6">
                                    Concebido para equipas que partilham processos e precisam de comunicar numa única plataforma.
                                </p>
                                <ul className="space-y-4 mb-8 flex-1">
                                    <li className="flex items-center gap-3 text-sm text-white font-medium">
                                        <CheckCircle2 className="w-4 h-4 text-amber shrink-0" />
                                        <span>Tudo do plano Solo, e mais:</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-slate-300">
                                        <CheckCircle2 className="w-4 h-4 text-amber shrink-0" />
                                        <span>Até 5 Utilizadores em Rede</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-slate-300">
                                        <CheckCircle2 className="w-4 h-4 text-amber shrink-0" />
                                        <span>Pesquisa IA Assistida em Jurisprudência</span>
                                    </li>
                                    <li className="flex items-center gap-3 text-sm text-slate-300">
                                        <CheckCircle2 className="w-4 h-4 text-amber shrink-0" />
                                        <span>Portal do Cliente & Time Tracking Avançado</span>
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Plan 3 */}
                        <div className="bg-white border border-slate-200 p-8 flex flex-col">
                            <h3 className="font-bold text-navy text-xl mb-2">Sociedade Office</h3>
                            <div className="mb-6">
                                <span className="text-4xl font-display font-bold text-navy">€199</span>
                                <span className="text-slate-500">/mês</span>
                            </div>
                            <p className="text-sm text-slate-600 mb-8 border-b border-slate-100 pb-6">
                                Controlo granular, permissões avançadas e arquitetura para escalar sociedades estruturadas.
                            </p>
                            <ul className="space-y-4 mb-8 flex-1">
                                <li className="flex items-center gap-3 text-sm text-slate-700 font-medium">
                                    <CheckCircle2 className="w-4 h-4 text-navy shrink-0" />
                                    <span>Tudo dos planos anteriores, e mais:</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-navy shrink-0" />
                                    <span>Até 15 Utilizadores</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-navy shrink-0" />
                                    <span>Gestão de Permissões (RBAC) Granular</span>
                                </li>
                                <li className="flex items-center gap-3 text-sm text-slate-700">
                                    <CheckCircle2 className="w-4 h-4 text-navy shrink-0" />
                                    <span>Integrações Prioritárias de API e Suporte VIP</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            {/* Pilot CTA Section */}
            <section className="py-24 bg-navy relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay pointer-events-none"></div>
                <div className="max-w-4xl mx-auto px-6 md:px-12 text-center relative z-10">
                    <h2 className="font-display text-4xl font-bold text-white mb-6 tracking-tight">
                        Seja um dos Escritórios Piloto
                    </h2>
                    <p className="text-xl text-slate-300 mb-10 font-light">
                        Estamos a recrutar 10 escritórios pioneiros. Oferecemos o período de implementação e damos prioridade ao seu feedback no desenvolvimento de novas funcionalidades. Em troca, o seu escritório terá um papel ativo em moldar o futuro da Advocatus IA. E ganhe meses grátis garantidos se indicar outros colegas nas fases seguintes.
                    </p>
                    <Link href="/login" className="bg-amber text-navy px-8 py-4 font-bold hover:bg-amber-400 transition shadow-lg flex items-center justify-center gap-2 group mx-auto w-max rounded-none">
                        Inscrever-se na Fase Piloto
                        <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition" />
                    </Link>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 py-16 border-t border-slate-800">
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
        </div>
    )
}
