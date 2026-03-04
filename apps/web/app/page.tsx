import { redirect } from 'next/navigation'

/**
 * Root page — redirects to /app (authenticated area) or /login if not authenticated
 */
export default function RootPage() {
    redirect('/app')
}
