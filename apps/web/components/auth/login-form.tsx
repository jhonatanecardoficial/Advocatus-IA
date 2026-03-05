"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { ArrowRight, Lock, Mail, Loader2 } from "lucide-react"
import Link from "next/link"

const loginSchema = z.object({
    email: z.string().email("Por favor, insira um email válido."),
    password: z.string().min(6, "A palavra-passe deve ter pelo menos 6 caracteres."),
})

type LoginFormValues = z.infer<typeof loginSchema>

export function LoginForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [errorMsg, setErrorMsg] = useState("")

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { email: "", password: "" },
    })

    async function onSubmit(_data: LoginFormValues) {
        setIsLoading(true)
        setErrorMsg("")
        try {
            const response = await fetch(process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/auth/login` : "http://localhost:4000/api/v1/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(_data),
                credentials: "include", // Importante para receber/enviar cookies HttpOnly
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData?.message || "Erro de autenticação.");
            }

            // Simulate success and redirect
            window.location.href = "/dashboard"
        } catch (err: any) {
            setErrorMsg(err.message || "Credenciais inválidas. Por favor, tente novamente.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="w-full max-w-sm mx-auto space-y-8">
            {/* Header */}
            <div className="space-y-2">
                <h2 className="text-3xl font-display font-bold text-navy-800 tracking-tight">
                    Acesso ao Portal
                </h2>
                <p className="text-sm text-slate-500 font-body">
                    Bem-vindo de volta. Insira as suas credenciais para gerir os seus processos.
                </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" suppressHydrationWarning>
                {errorMsg && (
                    <div className="p-3 text-sm font-medium text-red-600 bg-red-50 border border-red-100 rounded-sm animate-fade-in">
                        {errorMsg}
                    </div>
                )}

                <div className="space-y-4">
                    {/* Email Input */}
                    <div className="space-y-1">
                        <label className="text-sm font-semibold text-navy-800" htmlFor="email">
                            Email
                        </label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Mail className="h-4 w-4" />
                            </div>
                            <input
                                id="email"
                                type="email"
                                disabled={isLoading}
                                placeholder="advogado@escritorio.pt"
                                className={`block w-full pl-10 pr-3 py-2.5 bg-white border ${errors.email ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-amber-400 focus:border-amber-400"
                                    } rounded-sm text-sm text-navy-800 placeholder-slate-400 outline-none transition-colors shadow-sm`}
                                {...register("email")}
                            />
                        </div>
                        {errors.email && (
                            <p className="text-xs text-red-600 animate-slide-in">{errors.email.message}</p>
                        )}
                    </div>

                    {/* Password Input */}
                    <div className="space-y-1">
                        <div className="flex items-center justify-between">
                            <label className="text-sm font-semibold text-navy-800" htmlFor="password">
                                Palavra-passe
                            </label>
                            <Link
                                href="/recuperar"
                                className="text-xs font-medium text-amber-600 hover:text-amber-800 transition-colors"
                                tabIndex={-1}
                                suppressHydrationWarning
                            >
                                Esqueceu a palavra-passe?
                            </Link>
                        </div>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                                <Lock className="h-4 w-4" />
                            </div>
                            <input
                                id="password"
                                type="password"
                                disabled={isLoading}
                                placeholder="••••••••"
                                className={`block w-full pl-10 pr-3 py-2.5 bg-white border ${errors.password ? "border-red-400 focus:ring-red-400" : "border-slate-200 focus:ring-amber-400 focus:border-amber-400"
                                    } rounded-sm text-sm text-navy-800 placeholder-slate-400 outline-none transition-colors shadow-sm`}
                                {...register("password")}
                            />
                        </div>
                        {errors.password && (
                            <p className="text-xs text-red-600 animate-slide-in">{errors.password.message}</p>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={isLoading}
                    className="group relative flex w-full justify-center items-center gap-2 rounded-sm bg-navy-800 px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-navy-700 hover:shadow-elevated disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                    ) : (
                        <>
                            Entrar
                            <ArrowRight className="h-4 w-4 text-amber-400 transition-transform group-hover:translate-x-1" />
                        </>
                    )}
                </button>

                <p className="text-center text-xs text-slate-500">
                    Não tem uma conta?{" "}
                    <Link href="/register" className="font-semibold text-navy-800 hover:text-amber-600 transition-colors" suppressHydrationWarning>
                        Solicitar Acesso
                    </Link>
                </p>
            </form>
        </div>
    )
}
