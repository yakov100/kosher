'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  highlight?: boolean
  onClick?: () => void
  variant?: 'default' | 'primary' | 'secondary' | 'accent'
}

export function Card({ children, className, highlight, onClick, variant = 'default' }: CardProps) {
  const variantStyles = {
    default: 'bg-white border-gray-100 shadow-sm',
    primary: 'bg-white border-[var(--primary)]/20 shadow-sm',
    secondary: 'bg-white border-[var(--secondary)]/20 shadow-sm',
    accent: 'bg-white border-[var(--accent)]/20 shadow-sm',
  }

  return (
    <div
      className={cn(
        'p-8 rounded-[var(--radius-base)] border transition-all duration-300',
        variantStyles[variant],
        highlight && 'ring-2 ring-[var(--primary)] ring-opacity-30',
        onClick && 'cursor-pointer hover:bg-[var(--card-hover)] hover:shadow-md active:scale-[0.99]',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  action?: ReactNode
}

export function CardHeader({ title, subtitle, icon, action }: CardHeaderProps) {
  return (
    <div className="flex items-start justify-between mb-6 gap-3">
      <div className="flex items-center gap-4 min-w-0 flex-1">
        {icon && (
          <div className="p-3 rounded-[var(--radius-sm)] bg-[var(--primary)]/10 text-[var(--primary)]">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-xl text-[var(--foreground)] leading-tight">{title}</h3>
          {subtitle && <p className="text-sm font-medium text-[var(--muted-foreground)] mt-1 break-words">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
