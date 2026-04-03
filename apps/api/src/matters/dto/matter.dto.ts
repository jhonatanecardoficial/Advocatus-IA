import { z } from 'zod'

export const CreateMatterSchema = z.object({
    clientId: z.string().cuid('ID de cliente inválido'),
    title: z.string().min(3, 'Título obrigatório').max(500),
    type: z
        .enum(['CIVEL', 'PENAL', 'LABORAL', 'ADMINISTRATIVO', 'FISCAL', 'FAMILIA', 'COMERCIAL', 'OUTRO'])
        .default('OUTRO'),
    description: z.string().max(5000).optional(),
    courtReference: z.string().max(100).optional(),
    citiusReference: z.string().max(100).optional(),
    opposingParty: z.string().max(200).optional(),
    opposingCounsel: z.string().max(200).optional(),
    deadlineAt: z.preprocess((val) => val === "" ? null : val, z.coerce.date().nullable().optional()),
    responsibleId: z.string().cuid().optional(),
})

export const UpdateMatterSchema = CreateMatterSchema.partial().extend({
    status: z
        .enum(['ATIVO', 'ENCERRADO', 'SUSPENSO', 'ARQUIVADO'])
        .optional(),
})

export const MatterFiltersSchema = z.object({
    search: z.string().optional(),
    clientId: z.string().optional(),
    type: z
        .enum(['CIVEL', 'PENAL', 'LABORAL', 'ADMINISTRATIVO', 'FISCAL', 'FAMILIA', 'COMERCIAL', 'OUTRO'])
        .optional(),
    status: z.enum(['ATIVO', 'ENCERRADO', 'SUSPENSO', 'ARQUIVADO']).optional(),
    responsibleId: z.string().optional(),
    page: z.coerce.number().int().min(1).default(1),
    perPage: z.coerce.number().int().min(1).max(100).default(20),
})

export type CreateMatterDto = z.infer<typeof CreateMatterSchema>
export type UpdateMatterDto = z.infer<typeof UpdateMatterSchema>
export type MatterFiltersDto = z.infer<typeof MatterFiltersSchema>
