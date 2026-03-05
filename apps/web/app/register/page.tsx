import { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/register-form'
import { Scale } from 'lucide-react'

export const metadata: Metadata = {
    title: 'Criar Conta',
    description: 'Solicite acesso ao Advocatus IA e junte-se aos escritórios jurídicos líderes em inovação tecnológica.',
}

export default function RegisterPage() {
    return (
        <main className="min-h-screen w-full bg-navy grid grid-cols-1 lg:grid-cols-[40%_60%]">
            {/* 
        Left Side: Forms (Focal Point & Contrast) 
        - Bright contrast.
        - Notice the inverted topology compared to Login. Form is on the Left.
      */}
            <div className="flex items-center justify-center p-6 sm:p-12 lg:p-16 bg-slate-50 relative shadow-[20px_0_30px_rgb(15_29_58/0.2)] z-20">
                <RegisterForm />

                {/* Mobile-only Branding */}
                <div className="absolute bottom-6 left-0 right-0 lg:hidden flex justify-center items-center gap-2">
                    <Scale className="h-4 w-4 text-navy" />
                    <span className="text-sm font-display font-bold text-navy tracking-widest uppercase">
                        Advocatus IA
                    </span>
                </div>
            </div>

            {/* 
        Right Side: Typographic Hero (Inverted layout for Register)
      */}
            <div className="hidden lg:flex flex-col justify-between p-12 lg:p-24 bg-navy-800 relative overflow-hidden">
                {/* Decorative Grid overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>

                <div className="relative z-10 flex justify-end">
                    <div className="flex items-center gap-3 mb-16">
                        <span className="text-xl font-display font-bold text-white tracking-widest uppercase text-right">
                            Advocatus IA
                        </span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-sm bg-amber-400">
                            <Scale className="h-6 w-6 text-navy-800" strokeWidth={2.5} />
                        </div>
                    </div>
                </div>

                <div className="relative z-10 flex flex-col items-end text-right">
                    <h1 className="text-6xl xl:text-7xl font-display font-bold text-white leading-[1.1] tracking-tight">
                        A Nova Era <br />
                        da Prática <br />
                        <span className="text-amber-400">Jurídica.</span>
                    </h1>
                    <p className="mt-8 text-lg text-slate-300 font-body leading-relaxed max-w-xl">
                        Abandone workflows obsoletos. Centralizamos gestão de clientes, processos Citius e faturação num único kernel inteligente guiado por IA.
                    </p>
                </div>

                <div className="relative z-10">
                    {/* Empty space to balance visually or future quote */}
                </div>
            </div>
        </main>
    )
}
