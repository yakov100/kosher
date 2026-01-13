'use client'

import { useMemo } from 'react'
import { Gift, Flame, Star, Target, TrendingUp } from 'lucide-react'

interface TreatProgressCardProps {
  consecutiveGoalDays: number
  targetDays?: number
  todayGoalMet?: boolean
}

// Encouraging messages based on progress
function getProgressMessage(days: number, target: number, todayMet: boolean): { message: string; emoji: string } {
  const remaining = target - days
  const progress = (days / target) * 100

  // Already achieved
  if (days >= target) {
    return { message: 'מגיע לך פינוק! 🎉', emoji: '🏆' }
  }

  // Almost there (last 3 days)
  if (remaining <= 3) {
    if (remaining === 1) {
      return { message: 'עוד יום אחד בלבד לפינוק!', emoji: '🔥' }
    }
    return { message: `רק ${remaining} ימים לפינוק שלך!`, emoji: '⚡' }
  }

  // More than halfway
  if (progress >= 50) {
    return { message: `עברת את חצי הדרך! נשארו ${remaining} ימים`, emoji: '💪' }
  }

  // First week done
  if (days >= 7) {
    return { message: `שבוע שלם! רק עוד ${remaining} ימים`, emoji: '🌟' }
  }

  // Good start (3+ days)
  if (days >= 3) {
    return { message: `רצף יפה! עוד ${remaining} ימים לפינוק`, emoji: '✨' }
  }

  // Just started
  if (days >= 1) {
    return { message: `התחלה מצוינת! המשך כך`, emoji: '🚀' }
  }

  // No progress yet
  if (todayMet) {
    return { message: 'יום ראשון במסע לפינוק!', emoji: '🎯' }
  }

  return { message: 'עמוד ביעד היום והתחל את המסע!', emoji: '💫' }
}

export function TreatProgressCard({ consecutiveGoalDays, targetDays = 14, todayGoalMet = false }: TreatProgressCardProps) {
  const progress = Math.min((consecutiveGoalDays / targetDays) * 100, 100)
  const { message, emoji } = getProgressMessage(consecutiveGoalDays, targetDays, todayGoalMet)

  // Generate milestones
  const milestones = useMemo(() => {
    return [
      { day: 3, icon: '⭐', label: 'התחלה', achieved: consecutiveGoalDays >= 3 },
      { day: 7, icon: '🔥', label: 'שבוע', achieved: consecutiveGoalDays >= 7 },
      { day: 10, icon: '💎', label: 'כמעט שם', achieved: consecutiveGoalDays >= 10 },
      { day: 14, icon: '🎁', label: 'פינוק!', achieved: consecutiveGoalDays >= 14 },
    ]
  }, [consecutiveGoalDays])

  // Don't show if already achieved the treat (show TreatRewardCard instead)
  if (consecutiveGoalDays >= targetDays) {
    return null
  }

  return (
    <div className="relative overflow-hidden rounded-2xl border border-violet-200/60 bg-gradient-to-br from-violet-100/60 via-white/80 to-pink-100/60 p-4">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-violet-200/30 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
      <Gift className="absolute bottom-2 left-2 w-12 h-12 text-violet-300/30" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-violet-100">
            <Target className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-700 text-sm">מסלול לפינוק</h3>
            <p className="text-xs text-gray-400">14 ימים עם יעד = פינוק!</p>
          </div>
        </div>
        <div className="text-2xl">{emoji}</div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 mb-3">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
          <span>{consecutiveGoalDays} מתוך {targetDays} ימים</span>
          <span className="text-violet-600 font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-gray-200/60 rounded-full overflow-hidden relative">
          {/* Milestone markers on the bar */}
          {milestones.map((milestone) => (
            <div
              key={milestone.day}
              className="absolute top-0 bottom-0 w-0.5 bg-gray-300/60"
              style={{ left: `${(milestone.day / targetDays) * 100}%` }}
            />
          ))}
          {/* Progress fill */}
          <div
            className={`h-full transition-all duration-700 ease-out rounded-full ${
              progress >= 70
                ? 'bg-gradient-to-r from-violet-400 via-pink-400 to-amber-400'
                : progress >= 40
                ? 'bg-gradient-to-r from-violet-400 to-pink-400'
                : 'bg-gradient-to-r from-violet-500 to-violet-400'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Milestones */}
      <div className="relative z-10 flex justify-between mb-3">
        {milestones.map((milestone) => (
          <div
            key={milestone.day}
            className={`flex flex-col items-center transition-all duration-300 ${
              milestone.achieved ? 'opacity-100 scale-100' : 'opacity-50 scale-95'
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-lg mb-1 transition-all duration-300 ${
                milestone.achieved
                  ? 'bg-gradient-to-br from-violet-200 to-pink-200 border-2 border-violet-300/50 shadow-lg shadow-violet-200/40'
                  : 'bg-gray-100 border border-gray-200'
              }`}
            >
              {milestone.achieved ? milestone.icon : '○'}
            </div>
            <span className={`text-[10px] ${milestone.achieved ? 'text-violet-600' : 'text-gray-400'}`}>
              {milestone.label}
            </span>
          </div>
        ))}
      </div>

      {/* Motivational message */}
      <div className="relative z-10 text-center py-2 px-3 rounded-xl bg-white/70 border border-gray-200/50">
        <p className="text-sm text-gray-600">
          {message}
        </p>
        {consecutiveGoalDays > 0 && consecutiveGoalDays < targetDays && (
          <div className="flex items-center justify-center gap-1 mt-1 text-xs text-violet-600">
            <Flame className="w-3 h-3" />
            <span>רצף: {consecutiveGoalDays} ימים</span>
          </div>
        )}
      </div>

      {/* Today's status hint */}
      {!todayGoalMet && consecutiveGoalDays > 0 && (
        <div className="relative z-10 mt-2 text-center">
          <p className="text-xs text-amber-600 flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3" />
            עמוד ביעד היום כדי לשמור על הרצף!
          </p>
        </div>
      )}
    </div>
  )
}
