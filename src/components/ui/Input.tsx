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
      <div className="space-y-2.5">
        {label && (
          <label className="block text-sm font-bold text-white/90">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-5 py-3.5 rounded-xl',
            'bg-white/5 backdrop-blur-sm',
            'border border-white/10',
            'text-white placeholder:text-white/30',
            'focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500/50',
            'hover:bg-white/10 hover:border-white/20',
            'transition-all duration-300',
            'text-base font-medium',
            error && 'border-red-400/50 focus:border-red-400 focus:ring-red-400/30',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs font-medium text-white/40">{hint}</p>
        )}
        {error && (
          <p className="text-xs font-bold text-red-400">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
