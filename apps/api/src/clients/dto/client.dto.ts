import { z } from 'zod'

export const CreateClientSchema = z.object({
    name: z.string().min(2, 'Nome obrigatório').max(200),
    type: z.enum(['SINGULAR', 'COLETIVO']).default('SINGULAR'),
    nif: z
        .string()
        .regex(/^\d{9}$/, 'NIF deve ter 9 dígitos')
        .optional(),
    email: z.string().email('Email inválido').optional(),
    phone: z.string().min(9).max(20).optional(),
    address: z.string().max(500).optional(),
    notes: z.string().max(2000).optional(),
    gdprConsent: z.boolean().optional(),
})

export const UpdateClientSchema = CreateClientSchema.partial()

export const ClientFiltersSchema = z.object({
    search: z.string().optional(),
    type: z.enum(['SINGULAR', 'COLETIVO']).optional(),
    page: z.coerce.number().int().min(1).default(1),
    perPage: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateClientDto = z.infer<typeof CreateClientSchema>
export type UpdateClientDto = z.infer<typeof UpdateClientSchema>
export type ClientFiltersDto = z.infer<typeof ClientFiltersSchema>
