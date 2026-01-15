'use client'

import { cn } from '@/lib/utils'
import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label className="block text-sm font-semibold text-[var(--foreground)]">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3 rounded-xl bg-[var(--card)] border border-[var(--border)] text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all',
            error && 'border-red-400 focus:border-red-400 focus:ring-red-400/30',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs font-medium text-[var(--muted-foreground)]">{hint}</p>
        )}
        {error && (
          <p className="text-xs font-bold text-red-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
