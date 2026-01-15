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
}

export function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
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
          'relative w-full rounded-3xl shadow-2xl p-8 fade-in',
          'bg-gradient-to-br from-slate-800/95 via-slate-800/90 to-slate-900/95',
          'border border-white/10',
          'backdrop-blur-xl',
          sizes[size]
        )}
      >
        {/* Top gradient accent line */}
        <div className="absolute top-0 left-8 right-8 h-1 rounded-full bg-gradient-to-r from-emerald-400 via-violet-400 to-blue-400" />
        
        {/* Corner decorations */}
        <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-violet-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-4 left-4 w-20 h-20 bg-gradient-to-tr from-emerald-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />
        
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between mb-8 relative">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 shadow-lg shadow-violet-500/10">
                <Sparkles className="w-5 h-5 text-violet-300" />
              </div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 rounded-xl text-white/40 hover:text-white bg-white/5 hover:bg-white/15 border border-transparent hover:border-white/20 transition-all duration-300 hover:scale-110 active:scale-95"
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
