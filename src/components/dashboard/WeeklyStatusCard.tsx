'use client'

import { Trophy, Calendar, Scale, Flame } from 'lucide-react'
import { Card } from '@/components/ui/Card'
import type { Tables } from '@/types/database'
import { getWeekRange, formatDate } from '@/lib/utils'

interface WeeklyStatusCardProps {
  walkingRecords: Tables<'steps_records'>[]
  weights: Tables<'weight_records'>[]
  dailyGoal: number
  weeklyGoalDays: number
  currentStreak?: number
  longestStreak?: number
}

export function WeeklyStatusCard({ 
  walkingRecords, 
  weights, 
  dailyGoal, 
  weeklyGoalDays,
  currentStreak = 0,
  longestStreak = 0
}: WeeklyStatusCardProps) {
  const { start, end } = getWeekRange()
  
  // Filter this week's data
  const weekRecords = walkingRecords.filter(r => {
    const date = new Date(r.date)
    return date >= start && date <= end
  })

  const weekWeights = weights.filter(w => {
    const date = new Date(w.recorded_at)
    return date >= start && date <= end
  })

  const goalDaysAchieved = weekRecords.filter(r => r.minutes >= dailyGoal).length
  const loggedDays = weekRecords.length
  const weightCount = weekWeights.length

  return (
    <Card className="fade-in stagger-3">
      <h3 className="font-black text-xl text-[var(--foreground)] mb-5 uppercase tracking-wide">
        סיכום שבועי ({formatDate(start, 'dd/MM')} - {formatDate(end, 'dd/MM')})
      </h3>

      <div className="grid grid-cols-4 gap-3">
        {/* Goal days */}
        <div className="text-center p-3 rounded-[var(--radius-sm)] bg-[var(--primary)]/20 border border-[var(--primary)]/30">
          <Trophy className="w-6 h-6 text-[var(--primary)] mx-auto mb-2" />
          <div className="text-2xl font-black text-[var(--foreground)]">
            {goalDaysAchieved}
            <span className="text-sm font-bold text-[var(--muted-foreground)]">/{weeklyGoalDays}</span>
          </div>
          <div className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">ימי יעד</div>
        </div>

        {/* Logged days */}
        <div className="text-center p-3 rounded-[var(--radius-sm)] bg-[var(--accent)]/20 border border-[var(--accent)]/30">
          <Calendar className="w-6 h-6 text-[var(--accent)] mx-auto mb-2" />
          <div className="text-2xl font-black text-[var(--foreground)]">
            {loggedDays}
            <span className="text-sm font-bold text-[var(--muted-foreground)]">/7</span>
          </div>
          <div className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">ימי הזנה</div>
        </div>

        {/* Current Streak */}
        <div className="text-center p-3 rounded-[var(--radius-sm)] bg-[var(--secondary)]/20 border border-[var(--secondary)]/30">
          <Flame className="w-6 h-6 text-[var(--secondary)] mx-auto mb-2" />
          <div className="text-2xl font-black text-[var(--foreground)]">
            {currentStreak}
          </div>
          <div className="text-[10px] font-bold text-[var(--muted-foreground)] uppercase">רצף נוכחי</div>
        </div>

        {/* Weight count */}
        <div className="text-center p-3 rounded-xl bg-gray-50 border border-gray-200">
          <Scale className="w-6 h-6 text-[var(--muted-foreground)] mx-auto mb-2" />
          <div className="text-2xl font-black text-[var(--foreground)]">{weightCount}</div>
          <div className="text-[10px] font-semibold text-[var(--muted-foreground)] uppercase">שקילות</div>
        </div>
      </div>

      {/* Longest streak badge */}
      {longestStreak > 0 && (
        <div className="mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-[var(--radius-sm)] bg-[var(--accent)]/20 border border-[var(--accent)]/30">
          <span className="text-xl">🏆</span>
          <span className="text-sm font-black text-[var(--foreground)] uppercase">רצף שיא: {longestStreak} ימים</span>
        </div>
      )}
    </Card>
  )
}
