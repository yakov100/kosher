'use client'

import { cn } from '@/lib/utils'
import { ReactNode, ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
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
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-gradient-to-r from-emerald-400 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-300/40 hover:-translate-y-0.5 active:translate-y-0',
    secondary: 'bg-white/80 text-gray-600 border border-gray-200 hover:bg-white hover:border-gray-300',
    ghost: 'text-gray-600 hover:bg-gray-100/70 hover:text-gray-800',
    danger: 'bg-rose-100 text-rose-600 border border-rose-200 hover:bg-rose-200',
  }

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
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
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      ) : icon}
      {children}
    </button>
  )
}
