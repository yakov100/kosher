'use client'

import { ReactNode } from 'react'
import { Card } from '@/components/ui/Card'

interface StatCardProps {
  icon?: ReactNode
  value: string | number
  label: string
  trend?: {
    value: string | number
    isPositive?: boolean
  }
  variant?: 'default' | 'primary' | 'secondary' | 'accent'
  className?: string
}

export function StatCard({ icon, value, label, trend, variant = 'default', className }: StatCardProps) {
  const variantStyles = {
    default: 'bg-[var(--card)] border-[var(--border)]',
    primary: 'bg-[var(--primary)]/10 border-[var(--primary)]/30',
    secondary: 'bg-[var(--secondary)]/10 border-[var(--secondary)]/30',
    accent: 'bg-[var(--accent)]/10 border-[var(--accent)]/30',
  }

  return (
    <Card variant={variant} className={`text-center p-4 ${className}`}>
      {icon && (
        <div className="flex justify-center mb-2">
          {icon}
        </div>
      )}
      <div className="text-4xl font-black text-[var(--foreground)] mb-1">
        {value}
      </div>
      <div className="text-xs font-medium text-[var(--muted-foreground)] mb-1">
        {label}
      </div>
      {trend && (
        <div className={`text-xs font-bold ${
          trend.isPositive === true ? 'text-[var(--primary)]' :
          trend.isPositive === false ? 'text-red-500' :
          'text-[var(--muted-foreground)]'
        }`}>
          {trend.value}
        </div>
      )}
    </Card>
  )
}

interface StatsGridProps {
  children: ReactNode
  cols?: 2 | 3 | 4
}

export function StatsGrid({ children, cols = 3 }: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }

  return (
    <div className={`grid ${gridCols[cols]} gap-3`}>
      {children}
    </div>
  )
}
