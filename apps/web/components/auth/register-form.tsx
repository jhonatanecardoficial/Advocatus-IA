"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowRight, ArrowLeft, Building2, User, Mail, Lock, Loader2, Scale } from "lucide-react"
import Link from "next/link"
import { registerAction } from "@/app/actions/auth"

const registerSchema = z.object({
    step: z.number().min(1).max(3),
    // Step 1: Personal Target
    firstName: z.string().min(2, "Nome deve ter +2 caracteres.").optional(),
    lastName: z.string().min(2, "Apelido deve ter +2 caracteres.").optional(),
    // Step 2: Entity
    officeName: z.string().min(3, "Nome do escritório deve ter +3 caracteres.").optional(),
    role: z.enum(["advogado", "parceiro", "gestor"]).optional(),
    // Step 3: Auth Creds
    email: z.string().email("Inserir um email válido.").optional(),
    password: z.string().min(8, "A palavra-passe deve ter 8+ caracteres.").optional(),
})

type RegisterFormValues = z.infer<typeof registerSchema>

export function RegisterForm() {
    const [currentStep, setCurrentStep] = useState(1)
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    const {
        register,
        handleSubmit,
        trigger,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            step: 1,
            firstName: "",
            lastName: "",
            officeName: "",
            role: "advogado",
            email: "",
            password: "",
        },
    })

    // Validação dinâmica por step (Progressive Disclosure)
    const nextStep = async () => {
        let fieldsToValidate: (keyof RegisterFormValues)[] = []

        if (currentStep === 1) fieldsToValidate = ["firstName", "lastName"]
        if (currentStep === 2) fieldsToValidate = ["officeName", "role"]

        const isStepValid = await trigger(fieldsToValidate)
        if (isStepValid) setCurrentStep((prev) => prev + 1)
    }

    const prevStep = () => setCurrentStep((prev) => prev - 1)

    async function onSubmit(data: RegisterFormValues) {
        if (currentStep !== 3) return

        // Validate final step before submit
        const isStepValid = await trigger(["email", "password"])
        if (!isStepValid) return

        setIsLoading(true)
        setErrorMsg("")
        try {
            const result = await registerAction(data);

            if (result.error) {
                setErrorMsg(result.error);
            } else if (result.success) {
                window.location.href = "/dashboard"
            }
        } catch (error: any) {
            console.error(error)
            setErrorMsg("Ocorreu um erro inesperado no registo.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-sm mx-auto space-y-8">
            {/* Dynamic Header */}
            <div className="space-y-3">
                {/* Step Indicator (Goal Gradient Effect) */}
                <div className="flex items-center gap-2 mb-2">
                    {[1, 2, 3].map((step) => (
                        <div
                            key={step}
                            className={`h-1.5 flex-1 rounded-full transition-colors duration-300 ${currentStep >= step ? "bg-amber-400" : "bg-slate-200"
                                }`}
                        />
                    ))}
                </div>

                <h2 className="text-3xl font-display font-bold text-navy-800 tracking-tight">
                    {currentStep === 1 && "Bem-vindo."}
                    {currentStep === 2 && "A sua firma."}
                    {currentStep === 3 && "Segurança."}
                </h2>
                <p className="text-sm text-slate-500 font-body">
                    {currentStep === 1 && "Preencha os seus dados pessoais para avançar."}
                    {currentStep === 2 && "Defina o escritório que irá administrar."}
                    {currentStep === 3 && "Crie credenciais fortes e seguras."}
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" suppressHydrationWarning>
                {errorMsg && (
                    <div className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-sm animate-fade-in">
                        {errorMsg}
                    </div>
                )}
                {/* STEP 1: Personal */}
                {currentStep === 1 && (
                    <div className="space-y-4 animate-slide-in">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-navy-800" htmlFor="firstName">Nome</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <User className="h-4 w-4" />
                                </div>
                                <input
                                    id="firstName"
                                    type="text"
                                    placeholder="João"
                                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 focus:ring-amber-400 focus:border-amber-400 rounded-sm text-sm"
                                    {...register("firstName")}
                                />
                            </div>
                            {errors.firstName && <p className="text-xs text-red-600">{errors.firstName.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-navy-800" htmlFor="lastName">Apelido</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <User className="h-4 w-4" />
                                </div>
                                <input
                                    id="lastName"
                                    type="text"
                                    placeholder="Silva"
                                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 focus:ring-amber-400 focus:border-amber-400 rounded-sm text-sm"
                                    {...register("lastName")}
                                />
                            </div>
                            {errors.lastName && <p className="text-xs text-red-600">{errors.lastName.message}</p>}
                        </div>
                    </div>
                )}

                {/* STEP 2: Entity */}
                {currentStep === 2 && (
                    <div className="space-y-4 animate-slide-in">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-navy-800" htmlFor="officeName">Nome do Escritório</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Building2 className="h-4 w-4" />
                                </div>
                                <input
                                    id="officeName"
                                    type="text"
                                    placeholder="Silva & Advogados, SP"
                                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 focus:ring-amber-400 focus:border-amber-400 rounded-sm text-sm"
                                    {...register("officeName")}
                                />
                            </div>
                            {errors.officeName && <p className="text-xs text-red-600">{errors.officeName.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-navy-800" htmlFor="role">A sua Função</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Scale className="h-4 w-4" />
                                </div>
                                <select
                                    id="role"
                                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 focus:ring-amber-400 focus:border-amber-400 rounded-sm text-sm appearance-none"
                                    {...register("role")}
                                >
                                    <option value="advogado">Sócio / Advogado</option>
                                    <option value="gestor">Gestor / Administrativo</option>
                                    <option value="parceiro">Parceiro Associado</option>
                                </select>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 3: Auth */}
                {currentStep === 3 && (
                    <div className="space-y-4 animate-slide-in">
                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-navy-800" htmlFor="email">Email Profissional</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Mail className="h-4 w-4" />
                                </div>
                                <input
                                    id="email"
                                    type="email"
                                    placeholder="joao@silvaadvogados.pt"
                                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 focus:ring-amber-400 focus:border-amber-400 rounded-sm text-sm"
                                    {...register("email")}
                                />
                            </div>
                            {errors.email && <p className="text-xs text-red-600">{errors.email.message}</p>}
                        </div>

                        <div className="space-y-1">
                            <label className="text-sm font-semibold text-navy-800" htmlFor="password">Palavra-passe</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                    <Lock className="h-4 w-4" />
                                </div>
                                <input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    className="block w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 focus:ring-amber-400 focus:border-amber-400 rounded-sm text-sm"
                                    {...register("password")}
                                />
                            </div>
                            {errors.password && <p className="text-xs text-red-600">{errors.password.message}</p>}
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="pt-2 flex gap-3">
                    {currentStep > 1 && (
                        <button
                            type="button"
                            onClick={prevStep}
                            className="flex items-center justify-center p-3 rounded-sm border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-navy transition-colors focus:ring-2 focus:ring-navy focus:outline-none"
                            aria-label="Voltar"
                        >
                            <ArrowLeft className="h-4 w-4" />
                        </button>
                    )}

                    {currentStep < 3 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="flex-1 flex justify-center items-center gap-2 rounded-sm bg-navy-800 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-navy-700 hover:shadow-elevated"
                        >
                            Avançar Passo
                            <ArrowRight className="h-4 w-4 text-amber-400" />
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group flex-1 relative flex justify-center items-center gap-2 rounded-sm bg-amber-400 px-4 py-3 text-sm font-semibold text-navy-800 transition-all hover:bg-amber-500 hover:shadow-elevated disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    Criar Conta
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </>
                            )}
                        </button>
                    )}
                </div>

                <p className="text-center text-xs text-slate-500 mt-6">
                    Já tem acesso autorizado?{" "}
                    <Link href="/login" className="font-semibold text-navy-800 hover:text-amber-600 transition-colors" suppressHydrationWarning>
                        Voltar ao Login
                    </Link>
                </p>
            </form>
        </div>
    )
}
