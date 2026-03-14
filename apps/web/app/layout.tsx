import type { Metadata } from 'next'
import { Playfair_Display, Inter } from 'next/font/google'
import './globals.css'

const playfair = Playfair_Display({
    variable: '--font-playfair',
    subsets: ['latin'],
    display: 'swap',
})

const inter = Inter({
    variable: '--font-inter',
    subsets: ['latin'],
    display: 'swap',
})

export const metadata: Metadata = {
    title: {
        default: 'Advocatus IA — Gestão Jurídica Inteligente',
        template: '%s | Advocatus IA',
    },
    description:
        'Plataforma de gestão jurídica com Inteligência Artificial para escritórios de advocacia portugueses. Gerencie processos, documentos, prazos e faturação com eficiência.',
    keywords: ['advocacia', 'gestão jurídica', 'inteligência artificial', 'Portugal', 'legal tech'],
    authors: [{ name: 'Advocatus IA' }],
    robots: { index: false, follow: false }, // Mudar para true em produção pública
}

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode
}>) {
    return (
        <html lang="pt" suppressHydrationWarning>
            <body className={`${inter.variable} ${playfair.variable} antialiased bg-navy text-navy-100 min-h-screen`}>
                {children}
            </body>
        </html>
    )
}
