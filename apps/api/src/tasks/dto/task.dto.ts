import { z } from 'zod'

export const CreateTaskSchema = z.object({
    matterId: z.string().cuid('ID de processo inválido'),
    title: z.string().min(3).max(500),
    description: z.string().max(2000).optional(),
    type: z
        .enum(['PRAZO', 'AUDIENCIA', 'DILIGENCIA', 'REUNIAO', 'OUTRO'])
        .default('OUTRO'),
    priority: z.enum(['BAIXA', 'MEDIA', 'ALTA', 'CRITICA']).default('MEDIA'),
    dueAt: z.coerce.date().optional(),
    assignedToId: z.string().cuid().optional(),
})

export const UpdateTaskSchema = CreateTaskSchema.partial().extend({
    completedAt: z.coerce.date().nullable().optional(),
})

export type CreateTaskDto = z.infer<typeof CreateTaskSchema>
export type UpdateTaskDto = z.infer<typeof UpdateTaskSchema>
