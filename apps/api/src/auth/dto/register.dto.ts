import { z } from 'zod'

export const RegisterSchema = z.object({
    email: z.string().email('Email inválido'),
    password: z.string().min(8, 'A senha deve ter no mínimo 8 caracteres'),
    name: z.string().min(2, 'O nome deve ter no mínimo 2 caracteres'),
    tenantName: z.string().min(2, 'O nome do escritório deve ter no mínimo 2 caracteres'),
})

export type RegisterDto = z.infer<typeof RegisterSchema>
