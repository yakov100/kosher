'use client'

import { cn } from '@/lib/utils'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  highlight?: boolean
}

export default function Card({ children, className, onClick, highlight }: CardProps) {
  return (
    <div
      className={cn(
        'bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm p-4 fade-in',
        highlight && 'border-[var(--primary)]/50 glow',
        onClick && 'cursor-pointer hover:border-[var(--primary)] transition-all duration-200',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
