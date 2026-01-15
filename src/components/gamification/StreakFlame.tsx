'use client'

interface StreakFlameProps {
  streak: number
  size?: 'sm' | 'md' | 'lg'
  showNumber?: boolean
}

export function StreakFlame({ streak, size = 'md', showNumber = true }: StreakFlameProps) {
  const sizeClasses = {
    sm: 'text-2xl',
    md: 'text-4xl',
    lg: 'text-6xl'
  }

  const numberSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg'
  }

  // Intensity based on streak length
  const getIntensity = () => {
    if (streak >= 30) return 'legendary'
    if (streak >= 14) return 'epic'
    if (streak >= 7) return 'rare'
    if (streak >= 3) return 'uncommon'
    return 'common'
  }

  const intensity = getIntensity()

  const colorClasses = {
    common: 'from-orange-400 to-rose-400',
    uncommon: 'from-orange-300 via-orange-400 to-rose-500',
    rare: 'from-amber-300 via-orange-400 to-rose-500',
    epic: 'from-amber-200 via-orange-400 to-violet-500',
    legendary: 'from-amber-100 via-orange-400 via-rose-400 to-violet-600'
  }

  if (streak === 0) {
    return (
      <div className="flex flex-col items-center gap-1">
        <span className={`${sizeClasses[size]} grayscale opacity-30`}>🔥</span>
        {showNumber && (
          <span className={`${numberSizeClasses[size]} font-bold text-[var(--muted-foreground)]`}>אין רצף</span>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1 relative">
      {/* Glow effect */}
      <div 
        className={`absolute inset-0 blur-xl opacity-40 bg-gradient-to-t ${colorClasses[intensity]} rounded-full`}
        style={{ transform: 'scale(0.8)' }}
      />
      
      {/* Flame emoji with animation */}
      <div className={`${sizeClasses[size]} animate-flame relative z-10`}>
        🔥
      </div>

      {/* Streak number */}
      {showNumber && (
        <div className={`${numberSizeClasses[size]} font-black relative z-10 text-[var(--foreground)]`}>
          {streak} {streak === 1 ? 'יום' : 'ימים'}
        </div>
      )}

      {/* Extra flames for high streaks */}
      {streak >= 7 && (
        <div className="absolute -top-1 flex gap-1">
          <span className="text-sm animate-flame-left opacity-70">🔥</span>
          <span className="text-sm animate-flame-right opacity-70">🔥</span>
        </div>
      )}

      {/* Sparkles for epic+ streaks */}
      {streak >= 14 && (
        <>
          <span className="absolute -left-2 top-0 text-xs animate-sparkle">✨</span>
          <span className="absolute -right-2 top-0 text-xs animate-sparkle-delay">✨</span>
        </>
      )}

      <style jsx>{`
        @keyframes flame {
          0%, 100% { transform: scale(1) rotate(-2deg); }
          50% { transform: scale(1.1) rotate(2deg); }
        }
        @keyframes flame-left {
          0%, 100% { transform: translateX(-2px) rotate(-5deg); }
          50% { transform: translateX(2px) rotate(5deg); }
        }
        @keyframes flame-right {
          0%, 100% { transform: translateX(2px) rotate(5deg); }
          50% { transform: translateX(-2px) rotate(-5deg); }
        }
        @keyframes sparkle {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.3); }
        }
        .animate-flame {
          animation: flame 0.5s ease-in-out infinite;
        }
        .animate-flame-left {
          animation: flame-left 0.7s ease-in-out infinite;
        }
        .animate-flame-right {
          animation: flame-right 0.7s ease-in-out infinite;
          animation-delay: 0.2s;
        }
        .animate-sparkle {
          animation: sparkle 1s ease-in-out infinite;
        }
        .animate-sparkle-delay {
          animation: sparkle 1s ease-in-out infinite;
          animation-delay: 0.5s;
        }
      `}</style>
    </div>
  )
}
