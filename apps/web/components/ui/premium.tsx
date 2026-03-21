import React from 'react'

/* === Premium Button Components === */
export function ButtonPrimary({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={`button-premium button-primary ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}

export function ButtonSecondary({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={`button-premium button-secondary ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}

export function ButtonAmber({ children, className = '', ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
    return (
        <button
            className={`button-premium button-amber ${className}`}
            {...props}
        >
            {children}
        </button>
    )
}

/* === Premium Card Components === */
interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    hover?: boolean
}

export function Card({ children, hover = true, className = '', ...props }: CardProps) {
    return (
        <div
            className={`card-premium ${hover ? 'hover-lift' : ''} ${className}`}
            {...props}
        >
            {children}
        </div>
    )
}

export function CardWithStatistic({ label, value, trend, className = '' }: { label: string; value: string | number; trend?: 'up' | 'down'; className?: string }) {
    return (
        <Card className={`p-6 bg-white/[0.03] border-white/10 ${className}`}>
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">{label}</p>
            <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-white">{value}</span>
                {trend && (
                    <span className={`text-xs font-semibold ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                        {trend === 'up' ? '↑' : '↓'} {trend === 'up' ? '+12%' : '-8%'}
                    </span>
                )}
            </div>
        </Card>
    )
}

/* === Skeleton Loader === */
export function SkeletonLoader({ count = 3, height = 'h-12' }: { count?: number; height?: string }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className={`skeleton-loading rounded-lg ${height}`}></div>
            ))}
        </div>
    )
}

/* === Empty State === */
interface EmptyStateProps {
    icon?: React.ReactNode
    title: React.ReactNode
    description: React.ReactNode
    action?: React.ReactNode
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
    return (
        <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
            {icon && <div className="mb-4 text-slate-400" role="img" aria-hidden="true">{icon}</div>}
            <h3 className="font-display text-xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-300 mb-6 max-w-sm">{description}</p>
            {action}
        </div>
    )
}

/* === Premium Badge === */
interface BadgeProps {
    children: React.ReactNode
    color?: 'navy' | 'amber' | 'green' | 'red' | 'slate'
}

export function Badge({ children, color = 'navy' }: BadgeProps) {
    const colorClasses = {
        navy: 'bg-navy-100 text-navy',
        amber: 'bg-amber-100 text-amber-900',
        green: 'bg-green-100 text-green-900',
        red: 'bg-red-100 text-red-900',
        slate: 'bg-slate-100 text-slate-900',
    }

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${colorClasses[color]}`}>
            {children}
        </span>
    )
}
