'use client'

import { useEffect, ReactNode } from 'react'
import { X } from 'lucide-react'
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
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/30 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className={cn(
          'relative w-full glass-card p-6 fade-in bg-white/95',
          sizes[size]
        )}
      >
        {/* Header */}
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-700">{title}</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100/70 transition-colors"
            >
              <X size={20} />
            </button>
          </div>
        )}
        
        {/* Content */}
        {children}
      </div>
    </div>
  )
}
