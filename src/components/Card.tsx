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
        'bg-white rounded-xl border border-gray-200 shadow-sm p-4 fade-in',
        highlight && 'border-teal-500/50 glow',
        onClick && 'cursor-pointer hover:border-slate-600 transition-all duration-200',
        className
      )}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
