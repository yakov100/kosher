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
      <h3 className="font-semibold text-gray-600 mb-4">
        סיכום שבועי ({formatDate(start, 'dd/MM')} - {formatDate(end, 'dd/MM')})
      </h3>

      <div className="grid grid-cols-4 gap-3">
        {/* Goal days */}
        <div className="text-center p-3 rounded-xl bg-amber-50/80">
          <Trophy className="w-5 h-5 text-amber-500 mx-auto mb-2" />
          <div className="text-xl font-bold text-gray-700">
            {goalDaysAchieved}
            <span className="text-xs text-gray-400 font-normal">/{weeklyGoalDays}</span>
          </div>
          <div className="text-[10px] text-gray-400">ימי יעד</div>
        </div>

        {/* Logged days */}
        <div className="text-center p-3 rounded-xl bg-emerald-50/80">
          <Calendar className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
          <div className="text-xl font-bold text-gray-700">
            {loggedDays}
            <span className="text-xs text-gray-400 font-normal">/7</span>
          </div>
          <div className="text-[10px] text-gray-400">ימי הזנה</div>
        </div>

        {/* Current Streak */}
        <div className="text-center p-3 rounded-xl bg-gradient-to-br from-orange-50 to-rose-50 border border-orange-200/50">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-2" />
          <div className="text-xl font-bold text-orange-500">
            {currentStreak}
          </div>
          <div className="text-[10px] text-gray-400">רצף נוכחי</div>
        </div>

        {/* Weight count */}
        <div className="text-center p-3 rounded-xl bg-violet-50/80">
          <Scale className="w-5 h-5 text-violet-500 mx-auto mb-2" />
          <div className="text-xl font-bold text-gray-700">{weightCount}</div>
          <div className="text-[10px] text-gray-400">שקילות</div>
        </div>
      </div>

      {/* Longest streak badge */}
      {longestStreak > 0 && (
        <div className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500">
          <span className="text-amber-500">🏆</span>
          <span>רצף שיא: {longestStreak} ימים</span>
        </div>
      )}
    </Card>
  )
}
