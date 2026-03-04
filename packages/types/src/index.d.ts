export type UserRole = 'ADMIN' | 'SOCIO' | 'ADVOGADO' | 'ESTAGIARIO' | 'SECRETARIA' | 'CLIENTE';
export type MatterType = 'civel' | 'penal' | 'laboral' | 'administrativo' | 'fiscal' | 'familia' | 'comercial' | 'outro';
export type MatterStatus = 'ativo' | 'encerrado' | 'suspenso' | 'arquivado';
export type SignatureType = 'none' | 'ses' | 'aes' | 'qes';
export type SignatureStatus = 'pending' | 'signed' | 'rejected';
export type SignatureProvider = 'autenticacao_gov' | 'multicert' | 'docusign';
export type TenantPlan = 'solo' | 'pequeno' | 'escritorio' | 'enterprise';
export type BillingStatus = 'active' | 'trial' | 'past_due' | 'cancelled';
export type TaskType = 'prazo' | 'audiencia' | 'diligencia' | 'reuniao' | 'outro';
export type TaskPriority = 'baixa' | 'media' | 'alta' | 'critica';
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
export type ClientType = 'singular' | 'coletivo';
export interface ApiResponse<T> {
    data: T;
    meta?: {
        page?: number;
        perPage?: number;
        total?: number;
    };
}
export interface ApiError {
    statusCode: number;
    message: string;
    error?: string;
}
//# sourceMappingURL=index.d.ts.map