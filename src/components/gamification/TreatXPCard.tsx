'use client'

import { useMemo } from 'react'
import { Gift, Star, Target, TrendingUp, Sparkles } from 'lucide-react'

interface TreatXPCardProps {
  currentXP: number
  targetXP?: number
  totalTreatsEarned?: number
}

const TREAT_XP_THRESHOLD = 700

// Encouraging messages based on progress
function getProgressMessage(xp: number, target: number): { message: string; emoji: string } {
  const remaining = target - xp
  const progress = (xp / target) * 100

  // Already achieved
  if (xp >= target) {
    return { message: 'מגיע לך פינוק! 🎉', emoji: '🏆' }
  }

  // Almost there (last 100 XP)
  if (remaining <= 100) {
    if (remaining <= 50) {
      return { message: `עוד ${remaining} נקודות בלבד לפינוק!`, emoji: '🔥' }
    }
    return { message: `כמעט שם! עוד ${remaining} נקודות`, emoji: '⚡' }
  }

  // More than halfway
  if (progress >= 50) {
    return { message: `עברת את חצי הדרך! נשארו ${remaining} נקודות`, emoji: '💪' }
  }

  // Good start (200+ XP)
  if (xp >= 200) {
    return { message: `התקדמות מעולה! עוד ${remaining} נקודות`, emoji: '🌟' }
  }

  // Just started (100+ XP)
  if (xp >= 100) {
    return { message: `התחלה חזקה! עוד ${remaining} נקודות לפינוק`, emoji: '✨' }
  }

  // New start
  return { message: 'צבור נקודות והגע לפינוק הבא!', emoji: '🚀' }
}

export function TreatXPCard({ currentXP, targetXP = TREAT_XP_THRESHOLD, totalTreatsEarned = 0 }: TreatXPCardProps) {
  const progress = Math.min((currentXP / targetXP) * 100, 100)
  const { message, emoji } = getProgressMessage(currentXP, targetXP)

  // Generate milestones
  const milestones = useMemo(() => {
    return [
      { xp: 175, icon: '⭐', label: 'התחלה', achieved: currentXP >= 175 },
      { xp: 350, icon: '🔥', label: 'באמצע', achieved: currentXP >= 350 },
      { xp: 525, icon: '💎', label: 'כמעט שם', achieved: currentXP >= 525 },
      { xp: 700, icon: '🎁', label: 'פינוק!', achieved: currentXP >= 700 },
    ]
  }, [currentXP])

  // Don't show if already achieved the treat (show TreatUnlockedCard instead)
  if (currentXP >= targetXP) {
    return null
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-amber-200 bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-50 shadow-lg p-6">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-radial from-amber-200/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
      <Gift className="absolute bottom-3 left-3 w-16 h-16 text-amber-300/25" />
      <Sparkles className="absolute top-4 left-6 w-5 h-5 text-yellow-400/40 animate-pulse" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg">
            <Target className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800 text-base">מסלול לפינוק הבא</h3>
            <p className="text-xs text-gray-600">700 נקודות = פינוק מיוחד!</p>
          </div>
        </div>
        <div className="text-3xl animate-bounce">{emoji}</div>
      </div>

      {/* Treats counter (if any earned) */}
      {totalTreatsEarned > 0 && (
        <div className="relative z-10 mb-3 px-3 py-2 rounded-xl bg-white/70 border border-amber-200">
          <div className="flex items-center justify-center gap-2">
            <Gift className="w-4 h-4 text-amber-600" />
            <span className="text-sm font-bold text-gray-700">
              קיבלת כבר {totalTreatsEarned} {totalTreatsEarned === 1 ? 'פינוק' : 'פינוקים'}! 🎉
            </span>
          </div>
        </div>
      )}

      {/* Progress bar */}
      <div className="relative z-10 mb-4">
        <div className="flex items-center justify-between text-xs text-gray-600 font-medium mb-2">
          <span>{currentXP} מתוך {targetXP} נקודות</span>
          <span className="text-amber-600 font-bold">{Math.round(progress)}%</span>
        </div>
        <div className="h-3.5 bg-white/60 rounded-full overflow-hidden relative border border-amber-200 shadow-inner">
          {/* Milestone markers on the bar */}
          {milestones.map((milestone) => (
            <div
              key={milestone.xp}
              className="absolute top-0 bottom-0 w-0.5 bg-amber-300/60"
              style={{ left: `${(milestone.xp / targetXP) * 100}%` }}
            />
          ))}
          {/* Progress fill */}
          <div
            className={`h-full transition-all duration-700 ease-out rounded-full ${
              progress >= 70
                ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400'
                : progress >= 40
                ? 'bg-gradient-to-r from-amber-400 to-orange-400'
                : 'bg-gradient-to-r from-yellow-400 to-amber-400'
            } shadow-md`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Milestones */}
      <div className="relative z-10 flex justify-between mb-4">
        {milestones.map((milestone) => (
          <div
            key={milestone.xp}
            className={`flex flex-col items-center transition-all duration-300 ${
              milestone.achieved ? 'opacity-100 scale-100' : 'opacity-50 scale-95'
            }`}
          >
            <div
              className={`w-9 h-9 rounded-full flex items-center justify-center text-base mb-1 transition-all duration-300 ${
                milestone.achieved
                  ? 'bg-gradient-to-br from-amber-400 to-orange-500 border-2 border-amber-500 shadow-md'
                  : 'bg-white/60 border-2 border-amber-200'
              }`}
            >
              {milestone.achieved ? milestone.icon : '○'}
            </div>
            <span className={`text-[10px] font-medium ${milestone.achieved ? 'text-amber-700' : 'text-gray-500'}`}>
              {milestone.label}
            </span>
          </div>
        ))}
      </div>

      {/* Motivational message */}
      <div className="relative z-10 text-center py-3 px-4 rounded-xl bg-white/80 border border-amber-200 shadow-sm">
        <p className="text-sm font-medium text-gray-800">
          {message}
        </p>
        <div className="flex items-center justify-center gap-2 mt-1.5">
          <Star className="w-4 h-4 text-amber-500" />
          <span className="text-xs text-amber-700 font-bold">
            {currentXP} / {targetXP} XP
          </span>
        </div>
      </div>

      {/* Tips hint */}
      <div className="relative z-10 mt-3 text-center">
        <p className="text-xs text-gray-600 flex items-center justify-center gap-1.5">
          <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
          <span>צבור XP על ידי השלמת אתגרים, הליכה ורישום משקל</span>
        </p>
      </div>
    </div>
  )
}
