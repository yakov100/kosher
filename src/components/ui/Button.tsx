'use client'

import { cn } from '@/lib/utils'
import { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'accent' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  loading?: boolean
  icon?: ReactNode
}

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth,
  loading,
  icon,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold transition-all duration-300 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-[var(--primary)] text-[#1a1a1a] hover:bg-[var(--primary-hover)] hover:shadow-md hover:shadow-[var(--primary)]/20 active:scale-[0.98]',
    secondary: 'bg-[var(--secondary)] text-[#1a1a1a] hover:bg-[var(--secondary-hover)] hover:shadow-md hover:shadow-[var(--secondary)]/20 active:scale-[0.98]',
    accent: 'bg-[var(--accent)] text-[#1a1a1a] hover:bg-[var(--accent-hover)] hover:shadow-md hover:shadow-[var(--accent)]/20 active:scale-[0.98]',
    ghost: 'text-[var(--foreground)] hover:bg-[var(--card-hover)] border border-gray-200 hover:border-gray-300',
    danger: 'bg-red-400 text-white hover:bg-red-500 hover:shadow-md hover:shadow-red-400/20 active:scale-[0.98]',
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  return (
    <button
      className={cn(
        baseStyles,
        variants[variant],
        sizes[size],
        fullWidth && 'w-full',
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-100" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon}
      {children}
    </button>
  )
}
