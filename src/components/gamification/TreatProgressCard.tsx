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
    <div className="relative overflow-hidden rounded-xl border border-[var(--accent)]/30 bg-[var(--card)] shadow-sm p-5">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-radial from-[var(--accent)]/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
      <Gift className="absolute bottom-2 left-2 w-12 h-12 text-[var(--accent)]/15" />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-[var(--radius-sm)] bg-[var(--accent)]/20">
            <Target className="w-4 h-4 text-[var(--accent)]" />
          </div>
          <div>
            <h3 className="font-semibold text-[var(--foreground)] text-sm">מסלול לפינוק</h3>
            <p className="text-xs text-[var(--muted-foreground)]">14 ימים עם יעד = פינוק!</p>
          </div>
        </div>
        <div className="text-2xl">{emoji}</div>
      </div>

      {/* Progress bar */}
      <div className="relative z-10 mb-3">
        <div className="flex items-center justify-between text-xs text-[var(--muted-foreground)] mb-1">
          <span>{consecutiveGoalDays} מתוך {targetDays} ימים</span>
          <span className="text-[var(--accent)] font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-3 bg-[var(--muted)] rounded-full overflow-hidden relative">
          {/* Milestone markers on the bar */}
          {milestones.map((milestone) => (
            <div
              key={milestone.day}
              className="absolute top-0 bottom-0 w-0.5 bg-[var(--border)]"
              style={{ left: `${(milestone.day / targetDays) * 100}%` }}
            />
          ))}
          {/* Progress fill */}
          <div
            className={`h-full transition-all duration-700 ease-out rounded-full ${
              progress >= 70
                ? 'bg-gradient-to-r from-[var(--accent)] via-[var(--primary)] to-[var(--accent)]'
                : progress >= 40
                ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--primary)]'
                : 'bg-gradient-to-r from-[var(--accent)]/80 to-[var(--accent)]'
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
                  ? 'bg-gradient-to-br from-[var(--accent)]/30 to-[var(--primary)]/30 border-2 border-[var(--accent)]/50 shadow-sm'
                  : 'bg-[var(--muted)] border border-[var(--border)]'
              }`}
            >
              {milestone.achieved ? milestone.icon : '○'}
            </div>
            <span className={`text-[10px] ${milestone.achieved ? 'text-[var(--accent)]' : 'text-[var(--muted-foreground)]'}`}>
              {milestone.label}
            </span>
          </div>
        ))}
      </div>

      {/* Motivational message */}
      <div className="relative z-10 text-center py-2 px-3 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
        <p className="text-sm text-[var(--foreground)]">
          {message}
        </p>
        {consecutiveGoalDays > 0 && consecutiveGoalDays < targetDays && (
          <div className="flex items-center justify-center gap-1 mt-1 text-xs text-[var(--accent)]">
            <Flame className="w-3 h-3" />
            <span>רצף: {consecutiveGoalDays} ימים</span>
          </div>
        )}
      </div>

      {/* Today's status hint */}
      {!todayGoalMet && consecutiveGoalDays > 0 && (
        <div className="relative z-10 mt-2 text-center">
          <p className="text-xs text-[var(--accent)] flex items-center justify-center gap-1">
            <TrendingUp className="w-3 h-3" />
            עמוד ביעד היום כדי לשמור על הרצף!
          </p>
        </div>
      )}
    </div>
  )
}
