import { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'
import { Scale } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Entrar',
    description: 'Inicie sessão na sua conta Advocatus IA para gerir processos e equipas com inteligência artificial.',
}

export default function LoginPage() {
    return (
        <main className="min-h-screen w-full bg-navy grid grid-cols-1 lg:grid-cols-[65%_35%]">
            {/* 
        Left Side: Typographic Hero (Brutalism & Authority) 
        - Zero stock photography of scales/courthouses.
        - Just raw, structured typography enforcing trust.
      */}
            <div className="hidden lg:flex flex-col justify-between p-12 lg:p-24 bg-navy-800 relative overflow-hidden">
                {/* Decorative Grid overlay - Subtle structure */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-16">
                        <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-400">
                            <Scale className="h-6 w-6 text-navy-800" strokeWidth={2.5} />
                        </div>
                        <span className="text-xl font-display font-bold text-white tracking-widest uppercase">
                            Advocatus IA
                        </span>
                    </div>

                    <h1 className="text-6xl xl:text-8xl font-display font-bold text-white leading-[1.1] tracking-tight">
                        A Lei <br />
                        Encontra <br />
                        <span className="text-amber-400">a Lógica.</span>
                    </h1>
                </div>

                <div className="relative z-10 max-w-xl">
                    <p className="text-lg text-slate-300 font-body leading-relaxed">
                        Plataforma de inteligência jurídica para gestão de escritórios de topo.
                        Segurança de grau militar, análise de processos via IA e faturação automatizada.
                    </p>
                    <div className="mt-8 flex items-center gap-4 text-sm font-semibold text-slate-400">
                        <span>ISO 27001 Certified</span>
                        <span className="h-1 w-1 rounded-full bg-slate-500"></span>
                        <span>GDPR Compliant</span>
                        <span className="h-1 w-1 rounded-full bg-slate-500"></span>
                        <span>Citius Integration</span>
                    </div>
                </div>
            </div>

            {/* 
        Right Side: Forms (Focal Point & Contrast) 
        - Bright contrast against the dark background.
        - Minimalist and strictly functional.
      */}
            <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-50 relative shadow-2xl z-20">
                <LoginForm />

                {/* Mobile-only Branding */}
                <div className="absolute bottom-6 left-0 right-0 lg:hidden flex justify-center items-center gap-2">
                    <Scale className="h-4 w-4 text-navy" />
                    <span className="text-sm font-display font-bold text-navy tracking-widest uppercase">
                        Advocatus IA
                    </span>
                </div>
            </div>
        </main>
    )
}
