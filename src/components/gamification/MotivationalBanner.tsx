'use client'

import { useEffect, useState } from 'react'

interface MotivationalBannerProps {
  message: string
  streak: number
}

export function MotivationalBanner({ message, streak }: MotivationalBannerProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setVisible(true)
  }, [])

  // Different background styles based on streak
  const getBgStyle = () => {
    if (streak >= 30) {
      return 'bg-[var(--primary)] border-[var(--primary)]'
    }
    if (streak >= 14) {
      return 'bg-[var(--accent)] border-[var(--accent)]'
    }
    if (streak >= 7) {
      return 'bg-[var(--secondary)] border-[var(--secondary)]'
    }
    if (streak >= 3) {
      return 'bg-[var(--primary)] border-[var(--primary)]'
    }
    return 'bg-white border-black'
  }

  const getTextStyle = () => {
    if (streak >= 14) {
      return 'text-white'
    }
    return 'text-black'
  }

  return (
    <div 
      className={`
        relative overflow-hidden rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-5
        ${getBgStyle()}
        transform transition-all duration-700
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}
    >
      {/* Content */}
      <div className="relative z-10 text-center">
        <p className={`text-xl font-black ${getTextStyle()} uppercase tracking-wide animate-fade-in`}>
          {message}
        </p>
      </div>

      {/* Decorative floating elements for high streaks */}
      {streak >= 7 && (
        <>
          <span className="absolute top-1 right-3 text-sm animate-float opacity-70">✨</span>
          <span className="absolute bottom-1 left-3 text-sm animate-float-delayed opacity-70">⭐</span>
        </>
      )}

      <style jsx>{`
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; transform: scale(1); }
          50% { opacity: 0.25; transform: scale(1.1); }
        }
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }
      `}</style>
    </div>
  )
}
