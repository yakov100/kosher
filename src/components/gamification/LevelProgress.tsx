'use client'

import { Zap, ChevronUp, Trophy } from 'lucide-react'

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
      <div className="flex items-center gap-4 p-5 bg-[var(--card)] rounded-xl shadow-sm border border-[var(--border)]">
        <div className="relative shrink-0">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] p-[2px] shadow-lg">
             <div className="w-full h-full rounded-full bg-[var(--card)] flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/20 to-[var(--primary)]/20 opacity-50" />
                <span className="text-2xl font-black bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] bg-clip-text text-transparent relative z-10">{level}</span>
             </div>
          </div>
          <div className="absolute -bottom-1 -right-1 bg-[var(--card)] rounded-full p-1 border border-[var(--border)] shadow-sm">
            <div className="bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] rounded-full p-1">
              <Zap size={10} className="text-white fill-white" />
            </div>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-[var(--foreground)]">{title}</span>
            <span className="text-xs font-medium text-[var(--muted-foreground)]">{currentXP}/{nextLevelXP} XP</span>
          </div>
          <div className="h-2.5 bg-[var(--muted)] rounded-full overflow-hidden border border-[var(--border)]/50">
            <div 
              className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--primary)] transition-all duration-500 shadow-[0_0_10px_rgba(var(--primary),0.5)]"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative p-8 rounded-[var(--radius-base)] bg-[var(--card)] border border-[var(--border)] shadow-sm overflow-hidden group">
      {/* Ambient background glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-[var(--primary)]/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-6">
            {/* Level badge - Premium Design */}
            <div className="relative shrink-0">
              {/* Outer glow ring */}
              <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] rounded-full blur opacity-40 animate-pulse-slow" />
              
              {/* Main circle container */}
              <div className="relative w-24 h-24 rounded-full bg-gradient-to-br from-[var(--accent)] via-[var(--primary)] to-[var(--accent)] p-[3px] shadow-xl">
                {/* Inner circle content */}
                <div className="w-full h-full rounded-full bg-[var(--card)] flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 to-[var(--primary)]/10" />
                  <span className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wider mb-0.5 relative z-10">LEVEL</span>
                  <span className="text-4xl font-black bg-gradient-to-br from-[var(--accent)] to-[var(--primary)] bg-clip-text text-transparent relative z-10 leading-none">{level}</span>
                </div>
              </div>

              {/* Decorative Icon Badge */}
              <div className="absolute -top-2 -right-2">
                <div className="relative">
                    <div className="absolute inset-0 bg-[var(--primary)] rounded-full blur-sm opacity-50" />
                    <div className="relative bg-[var(--card)] rounded-full p-1.5 border border-[var(--border)] shadow-md">
                        <Trophy size={16} className="text-[var(--accent)]" />
                    </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-[var(--foreground)] mb-1">{title}</h3>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/20">
                  דרגה {Math.ceil(level / 5)}
                </span>
                <span className="text-sm text-[var(--muted-foreground)]">ממשיכים לטפס!</span>
              </div>
            </div>
          </div>

          <div className="text-left hidden sm:block">
            <p className="text-4xl font-black text-[var(--foreground)] tracking-tight">
              {totalXP.toLocaleString()}
            </p>
            <p className="text-xs font-bold text-[var(--muted-foreground)] uppercase tracking-wide">סה״כ XP שנצבר</p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-[var(--foreground)] font-semibold flex items-center gap-2">
                <Zap size={16} className="text-[var(--accent)]" />
                התקדמות לרמה הבאה
            </span>
            <span className="font-mono font-medium text-[var(--muted-foreground)] bg-[var(--muted)]/50 px-2 py-0.5 rounded-md text-xs">
                {currentXP} / {nextLevelXP} XP
            </span>
          </div>
          
          <div className="relative h-6 bg-[var(--muted)]/50 rounded-full overflow-hidden border border-[var(--border)]/50 shadow-inner">
            <div 
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-[var(--accent)] via-[var(--primary)] to-[var(--accent)] bg-[length:200%_100%] animate-shine rounded-full transition-all duration-700 ease-out shadow-[0_0_15px_rgba(var(--primary),0.4)]"
              style={{ width: `${progress}%` }}
            />
            
            {/* Progress text overlay */}
            <div className="absolute inset-0 flex items-center justify-center mix-blend-overlay">
              <span className="text-xs font-black text-white/90 drop-shadow-md">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Next level hint */}
          <div className="flex items-center justify-center gap-2 text-xs font-medium text-[var(--muted-foreground)] bg-[var(--muted)]/30 py-2 rounded-lg border border-[var(--border)]/30">
            <ChevronUp size={14} className="text-[var(--accent)] animate-bounce" />
            <span>חסרים רק <span className="text-[var(--foreground)] font-bold">{nextLevelXP - currentXP} XP</span> כדי להגיע לרמה {level + 1}</span>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes shine {
          0% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.05); }
        }
        .animate-shine {
          animation: shine 3s linear infinite;
        }
        .animate-pulse-slow {
          animation: pulse-slow 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
