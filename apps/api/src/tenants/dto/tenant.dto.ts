import { z } from 'zod'

export const UpdateTenantSchema = z.object({
  name: z.string().min(2).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  settings: z.record(z.any()).optional(),
})

export type UpdateTenantDto = z.infer<typeof UpdateTenantSchema>
