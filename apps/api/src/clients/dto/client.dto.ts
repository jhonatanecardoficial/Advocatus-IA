import { z } from 'zod'

export const CreateClientSchema = z.object({
  nome: z
    .string()
    .trim()
    .min(5, 'O nome deve ter pelo menos 5 caracteres')
    .refine((val) => val.split(/\s+/).filter(Boolean).length >= 2, {
      message: 'Por favor, introduza o nome completo (pelo menos nome e apelido).',
    })
    .max(200),
  tipo: z.enum(['SINGULAR', 'COLETIVO']).default('SINGULAR'),
  nif: z
    .string()
    .regex(/^\d{9}$/, 'NIF deve ter 9 dígitos')
    .optional(),
  email: z.string().trim().email('E-mail inválido').optional().nullable(),
  telefone: z.string().optional().nullable(),
  address: z.string().max(500).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
  gdprConsent: z.boolean().optional(),
})

export const UpdateClientSchema = CreateClientSchema.partial()

export const ClientFiltersSchema = z.object({
  search: z.string().optional(),
  tipo: z.enum(['SINGULAR', 'COLETIVO']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  perPage: z.coerce.number().int().min(1).max(100).default(20),
})

export const ConflictCheckSchema = z.object({
  nome: z.string().optional(),
  nif: z.string().optional(),
  email: z.string().email('E-mail inválido').optional().nullable(),
  telefone: z.string().optional().nullable(),
}).refine(data => data.nome || data.nif || data.email || data.telefone, {
  message: "Pelo menos um critério de pesquisa (nome, nif, email, telefone) deve ser fornecido.",
})

export type CreateClientDto = z.infer<typeof CreateClientSchema>
export type UpdateClientDto = z.infer<typeof UpdateClientSchema>
export type ClientFiltersDto = z.infer<typeof ClientFiltersSchema>
export type ConflictCheckDto = z.infer<typeof ConflictCheckSchema>
