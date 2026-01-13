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
      return 'from-amber-100/80 via-orange-100/60 to-pink-100/80 border-amber-300/60'
    }
    if (streak >= 14) {
      return 'from-violet-100/80 via-pink-100/60 to-sky-100/80 border-violet-300/60'
    }
    if (streak >= 7) {
      return 'from-orange-100/80 via-rose-100/60 to-amber-100/80 border-orange-300/60'
    }
    if (streak >= 3) {
      return 'from-emerald-100/80 via-teal-100/60 to-sky-100/80 border-emerald-300/60'
    }
    return 'from-gray-100/80 via-white/60 to-gray-100/80 border-gray-200/60'
  }

  return (
    <div 
      className={`
        relative overflow-hidden rounded-2xl border p-4
        bg-gradient-to-r ${getBgStyle()}
        transform transition-all duration-700
        ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}
      `}
    >
      {/* Animated background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(125,211,192,0.4),transparent_50%)] animate-pulse-slow" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center">
        <p className="text-lg font-medium text-gray-700 animate-fade-in">
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
