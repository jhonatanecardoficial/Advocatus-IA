import { z } from 'zod'

export const GetUploadUrlSchema = z.object({
    matterId: z.string().cuid('ID de processo inválido'),
    filename: z.string().min(1, 'Nome do ficheiro obrigatório').max(255),
    mimeType: z.string().min(1, 'Mime type obrigatório'),
    sizeBytes: z.number().int().positive('O tamanho deve ser maior que 0').max(50 * 1024 * 1024, 'Tamanho máximo permitido: 50MB'),
})

export const ConfirmUploadSchema = z.object({
    matterId: z.string().cuid('ID de processo inválido'),
    filename: z.string().min(1),
    mimeType: z.string().min(1),
    sizeBytes: z.number().int().positive(),
    storagePath: z.string().min(1),
    parentVersionId: z.string().cuid().optional(),
    signatureType: z.enum(['NONE', 'SES', 'AES', 'QES']).optional(),
    signatureStatus: z.enum(['PENDING', 'SIGNED', 'REJECTED']).optional(),
})

export const RequestSignatureSchema = z.object({
    documentId: z.string().cuid(),
    signatureType: z.enum(['SES', 'AES', 'QES']),
    signatories: z.array(z.string().email()).optional(), // Para multi-signatários futuramente
})

export type GetUploadUrlDto = z.infer<typeof GetUploadUrlSchema>
export type ConfirmUploadDto = z.infer<typeof ConfirmUploadSchema>
export type RequestSignatureDto = z.infer<typeof RequestSignatureSchema>
