import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
    // Habilitar Turbopack (stable em dev)
    // experimental: { turbo: {} },

    // Headers de segurança
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
                ],
            },
        ]
    },

    // Imagens externas permitidas
    images: {
        remotePatterns: [
            {
                protocol: 'https',
                hostname: '*.supabase.co',
            },
        ],
    },
}

export default nextConfig
