'use client'

import { Zap, ChevronUp } from 'lucide-react'

interface LevelProgressProps {
  level: number
  currentXP: number
  nextLevelXP: number
  progress: number
  totalXP: number
  compact?: boolean
}

const levelTitles: Record<number, string> = {
  1: 'מתחיל',
  2: 'מתאמן',
  3: 'פעיל',
  4: 'מתמיד',
  5: 'מתקדם',
  6: 'חרוץ',
  7: 'קבוע',
  8: 'יציב',
  9: 'מוביל',
  10: 'מומחה',
  11: 'מקצוען',
  12: 'אלוף',
  13: 'גיבור',
  14: 'אגדה',
  15: 'מאסטר',
  16: 'שליט',
  17: 'אל',
  18: 'טיטאן',
  19: 'אימורטל',
  20: 'אלוהי'
}

export function LevelProgress({ level, currentXP, nextLevelXP, progress, totalXP, compact = false }: LevelProgressProps) {
  const title = levelTitles[Math.min(level, 20)] || 'אגדי'

  if (compact) {
    return (
      <div className="flex items-center gap-4 p-5 bg-white rounded-xl shadow-sm">
        <div className="relative">
          <div className="w-14 h-14 rounded-xl bg-[var(--accent)] flex items-center justify-center shadow-sm">
            <span className="text-2xl font-black text-[#1a1a1a]">{level}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[var(--primary)] rounded-full p-1 border-2 border-white">
            <Zap size={14} className="text-[#1a1a1a]" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-[var(--foreground)]">{title}</span>
            <span className="text-xs font-medium text-[var(--muted-foreground)]">{currentXP}/{nextLevelXP} XP</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative p-8 rounded-[var(--radius-base)] bg-white border border-gray-100 shadow-sm overflow-hidden">
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            {/* Level badge */}
            <div className="relative">
              <div className="w-20 h-20 rounded-xl bg-[var(--accent)] flex items-center justify-center shadow-sm">
                <span className="text-3xl font-black text-[#1a1a1a]">{level}</span>
              </div>
              <div className="absolute -top-1 -right-1 bg-[var(--primary)] rounded-full p-2 border-2 border-white">
                <Zap size={16} className="text-[#1a1a1a]" />
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-semibold text-[var(--foreground)]">{title}</h3>
              <p className="text-sm font-medium text-[var(--muted-foreground)]">רמה {level}</p>
            </div>
          </div>

          <div className="text-left">
            <p className="text-3xl font-black text-[var(--foreground)]">
              {totalXP.toLocaleString()}
            </p>
            <p className="text-xs font-medium text-[var(--muted-foreground)]">סה״כ XP</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--foreground)] font-semibold">התקדמות לרמה הבאה</span>
            <span className="text-[var(--foreground)] font-semibold">{currentXP} / {nextLevelXP} XP</span>
          </div>
          
          <div className="relative h-5 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
            
            {/* Progress text overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-semibold text-[var(--foreground)]">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Next level hint */}
          <div className="flex items-center gap-2 text-xs font-medium text-[var(--foreground)]">
            <ChevronUp size={16} className="text-[var(--accent)]" />
            <span>עוד {nextLevelXP - currentXP} XP לרמה {level + 1}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }
        @keyframes shine {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-shine {
          animation: shine 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
