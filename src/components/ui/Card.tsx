'use client'

import { cn } from '@/lib/utils'
import { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  highlight?: boolean
  onClick?: () => void
}

export function Card({ children, className, highlight, onClick }: CardProps) {
  return (
    <div
      className={cn(
        'glass-card p-5',
        highlight && 'border-emerald-400/40 glow',
        onClick && 'cursor-pointer hover:border-emerald-400/50 transition-all',
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
    <div className="flex items-start justify-between mb-4 gap-3">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {icon && (
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
            {icon}
          </div>
        )}
        <div className="min-w-0">
          <h3 className="font-semibold text-lg text-gray-700">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 break-words">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
