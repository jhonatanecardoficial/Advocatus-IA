import { z } from 'zod'

export const UpdateTenantSchema = z.object({
  name: z.string().min(2).optional(),
  logoUrl: z.string().url().optional().or(z.literal('')),
  settings: z.record(z.string(), z.any()).optional(),
  nif: z.string().min(9).max(9).optional(),
  address: z.string().optional(),
  postalCode: z.string().optional(),
  city: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  commercialRegistration: z.string().optional(),
})

export type UpdateTenantDto = z.infer<typeof UpdateTenantSchema>
