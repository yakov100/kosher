'use client'

import { useEffect, ReactNode } from 'react'
import { X, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
  icon?: ReactNode
}

export function Modal({ isOpen, onClose, title, children, size = 'md', icon }: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with gradient */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/50 to-black/60 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Decorative gradient orbs */}
      <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />
      
      {/* Modal */}
      <div
        className={cn(
          'relative w-full rounded-2xl shadow-2xl p-6 fade-in',
          'bg-gradient-to-br from-white via-slate-50/30 to-white',
          'border border-slate-200',
          sizes[size]
        )}
      >
        
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200/60">
            <h2 className="text-lg font-semibold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-all hover:scale-105 active:scale-95"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        {/* Content */}
        <div className="relative">
          {children}
        </div>
      </div>
    </div>
  )
}
