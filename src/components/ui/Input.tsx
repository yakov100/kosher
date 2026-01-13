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
          <label className="block text-sm font-medium text-gray-600">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'input-field w-full',
            error && 'border-rose-400 focus:border-rose-400 focus:ring-rose-200',
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-gray-400">{hint}</p>
        )}
        {error && (
          <p className="text-xs text-rose-500">{error}</p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'
