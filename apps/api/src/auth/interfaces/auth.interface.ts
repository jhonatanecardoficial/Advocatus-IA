export interface JwtPayload {
    sub: string        // Supabase user ID
    email: string
    tenantId?: string
    iat?: number
    exp?: number
}

export interface RequestUser {
    id: string
    email: string
    name: string
    role: string
    tenantId: string
    supabaseUserId: string
    mfaEnabled: boolean
}
