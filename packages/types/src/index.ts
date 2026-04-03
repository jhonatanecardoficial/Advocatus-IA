// === Tipos partilhados entre apps/web e apps/api ===

// --- Roles RBAC — UPPERCASE alinhado com enums Prisma ---
export type UserRole = 'ADMIN' | 'SOCIO' | 'ADVOGADO' | 'ESTAGIARIO' | 'SECRETARIA' | 'CLIENTE'

// --- Tipos de processo jurídico PT ---
export type MatterType =
    | 'civel'
    | 'penal'
    | 'laboral'
    | 'administrativo'
    | 'fiscal'
    | 'familia'
    | 'comercial'
    | 'outro'

export type MatterStatus = 'ativo' | 'encerrado' | 'suspenso' | 'arquivado'

// --- Assinaturas digitais ---
export type SignatureType = 'none' | 'ses' | 'aes' | 'qes'
export type SignatureStatus = 'pending' | 'signed' | 'rejected'
export type SignatureProvider = 'autenticacao_gov' | 'multicert' | 'docusign'

// --- Planos de subscrição ---
export type TenantPlan = 'solo' | 'pequeno' | 'escritorio' | 'enterprise'
export type BillingStatus = 'active' | 'trial' | 'past_due' | 'cancelled'

// --- Tipos de tarefa ---
export type TaskType = 'prazo' | 'audiencia' | 'diligencia' | 'reuniao' | 'outro'
export type TaskPriority = 'baixa' | 'media' | 'alta' | 'critica'

// --- Faturas ---
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled'

// --- Clients ---
export type ClientType = 'SINGULAR' | 'COLETIVO'

// --- API Response wrapper ---
export interface ApiResponse<T> {
    data: T
    meta?: {
        page?: number
        perPage?: number
        total?: number
    }
}

export interface ApiError {
    statusCode: number
    message: string
    error?: string
}
