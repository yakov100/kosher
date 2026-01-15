'use client'

import { ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

interface HeroMetricProps {
  value: string | number
  label: string
  unit?: string
  actionLabel: string
  onAction: () => void
  icon?: ReactNode
  variant?: 'primary' | 'secondary'
}

export function HeroMetric({ 
  value, 
  label, 
  unit, 
  actionLabel, 
  onAction, 
  icon,
  variant = 'primary' 
}: HeroMetricProps) {
  const gradientClass = variant === 'primary' 
    ? 'bg-gradient-to-br from-[var(--primary)]/15 via-white to-[var(--accent)]/10'
    : 'bg-gradient-to-br from-[var(--secondary)]/15 via-white to-[var(--primary)]/10'

  return (
    <section className={`relative py-20 px-6 rounded-[var(--radius-lg)] ${gradientClass} overflow-hidden shadow-sm`}>
      {/* Background decoration - very subtle */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--primary)] rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[var(--accent)] rounded-full blur-3xl" />
      </div>

      <div className="relative z-10">
        {/* Label */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-[var(--muted-foreground)] mb-6">
            {icon && <span className="text-[var(--primary)]">{icon}</span>}
            {label}
          </div>
          
          {/* Hero Value */}
          <div className="flex items-baseline justify-center gap-2">
            <span className="text-7xl font-black text-[var(--foreground)] leading-none">
              {value}
            </span>
            {unit && (
              <span className="text-2xl font-semibold text-[var(--muted-foreground)]">
                {unit}
              </span>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="flex justify-center mt-10">
          <Button
            variant={variant}
            size="lg"
            onClick={onAction}
            className="min-w-[200px]"
          >
            {actionLabel}
          </Button>
        </div>
      </div>
    </section>
  )
}
