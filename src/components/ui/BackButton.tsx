'use client'

import { ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface BackButtonProps {
  className?: string
  onClick?: () => void
}

export function BackButton({ className, onClick }: BackButtonProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick()
    } else {
      router.back()
    }
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        "relative group p-3 rounded-full bg-[var(--card)] shadow-md border border-[var(--border)] transition-all duration-300 hover:scale-110 hover:shadow-xl active:scale-95 flex items-center justify-center text-[var(--foreground)] overflow-hidden",
        className
      )}
      aria-label="חזור"
    >
      <div className="absolute inset-0 bg-gradient-to-tr from-[var(--primary)]/20 to-[var(--secondary)]/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      <ArrowRight 
        size={22} 
        className="relative z-10 transition-transform duration-300 group-hover:translate-x-1" 
        strokeWidth={2.5}
      />
    </button>
  )
}
