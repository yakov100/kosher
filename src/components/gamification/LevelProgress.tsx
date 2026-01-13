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
      <div className="flex items-center gap-3 p-3 rounded-xl bg-white/70 border border-gray-100">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-400 to-violet-500 flex items-center justify-center">
            <span className="text-lg font-bold text-white">{level}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-amber-400 rounded-full p-0.5">
            <Zap size={12} className="text-amber-800" />
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">{title}</span>
            <span className="text-xs text-emerald-600">{currentXP}/{nextLevelXP} XP</span>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-400 to-violet-400 transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative p-5 rounded-2xl bg-gradient-to-br from-white/90 to-violet-50/80 border border-violet-100/50 overflow-hidden">
      {/* Background glow */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-200/40 rounded-full blur-3xl" />
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-violet-200/40 rounded-full blur-3xl" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {/* Level badge */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-400 via-teal-400 to-violet-500 flex items-center justify-center shadow-lg shadow-emerald-300/40 animate-float">
                <span className="text-2xl font-black text-white">{level}</span>
              </div>
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full p-1.5 shadow-lg">
                <Zap size={14} className="text-amber-800" />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-bold text-gray-700">{title}</h3>
              <p className="text-sm text-gray-500">רמה {level}</p>
            </div>
          </div>

          <div className="text-left">
            <p className="text-2xl font-bold bg-gradient-to-r from-emerald-500 to-violet-500 bg-clip-text text-transparent">
              {totalXP.toLocaleString()}
            </p>
            <p className="text-xs text-gray-400">סה״כ XP</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">התקדמות לרמה הבאה</span>
            <span className="text-emerald-600 font-medium">{currentXP} / {nextLevelXP} XP</span>
          </div>
          
          <div className="relative h-4 bg-gray-200/70 rounded-full overflow-hidden">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-emerald-400 via-teal-400 to-violet-400 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            >
              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shine" />
            </div>
            
            {/* Progress text overlay */}
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs font-bold text-gray-700 drop-shadow-sm">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Next level hint */}
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <ChevronUp size={14} className="text-violet-500" />
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
