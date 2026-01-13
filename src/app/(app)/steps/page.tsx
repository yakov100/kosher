'use client'

import { useState, useMemo } from 'react'
import { Plus, Flame, Target, TrendingUp, Timer } from 'lucide-react'
import { useWalking, useSettings } from '@/hooks/useSupabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { WalkingEntryModal } from '@/components/steps/StepsEntryModal'
import { WalkingChart } from '@/components/steps/StepsChart'
import { calculateStreak, getLast7Days, getLast30Days, getToday } from '@/lib/utils'

type ViewMode = 'week' | 'month'

export default function WalkingPage() {
  const { records, refetch } = useWalking()
  const { settings } = useSettings()
  const [viewMode, setViewMode] = useState<ViewMode>('week')
  const [showModal, setShowModal] = useState(false)

  const dailyGoal = settings?.daily_walking_minutes_goal || 30

  const chartData = useMemo(() => {
    const days = viewMode === 'week' ? getLast7Days() : getLast30Days()
    
    return days.map(date => {
      const record = records.find(r => r.date === date)
      return {
        date,
        minutes: record?.minutes || 0,
        goal: dailyGoal,
        hasData: !!record,
      }
    })
  }, [records, viewMode, dailyGoal])

  const stats = useMemo(() => {
    const days = viewMode === 'week' ? getLast7Days() : getLast30Days()
    const relevantRecords = records.filter(r => days.includes(r.date))
    
    const totalMinutes = relevantRecords.reduce((sum, r) => sum + r.minutes, 0)
    const average = relevantRecords.length > 0 ? Math.round(totalMinutes / relevantRecords.length) : 0
    const goalDays = relevantRecords.filter(r => r.minutes >= dailyGoal).length
    
    // Calculate streak
    const allDates = records.map(r => r.date)
    const streak = calculateStreak(allDates)

    return { average, goalDays, streak, totalDays: days.length }
  }, [records, viewMode, dailyGoal])

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins} דק׳`
    const hours = Math.floor(mins / 60)
    const remaining = mins % 60
    return remaining > 0 ? `${hours}:${remaining.toString().padStart(2, '0')} שע׳` : `${hours} שע׳`
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-700">הליכה</h1>
        <Button
          variant="primary"
          size="sm"
          icon={<Plus size={18} />}
          onClick={() => setShowModal(true)}
        >
          הזנה
        </Button>
      </header>

      {/* View Mode Toggle */}
      <div className="flex gap-2 p-1 bg-gray-100/70 rounded-xl">
        <button
          onClick={() => setViewMode('week')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'week'
              ? 'bg-emerald-500 text-white'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          שבוע
        </button>
        <button
          onClick={() => setViewMode('month')}
          className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
            viewMode === 'month'
              ? 'bg-emerald-500 text-white'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          חודש
        </button>
      </div>

      {/* Chart */}
      <Card>
        <WalkingChart data={chartData} goal={dailyGoal} />
      </Card>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <Card className="text-center">
          <TrendingUp className="w-5 h-5 text-emerald-500 mx-auto mb-2" />
          <div className="text-xl font-bold text-gray-700">{stats.average}</div>
          <div className="text-xs text-gray-400">ממוצע דק׳ יומי</div>
        </Card>

        <Card className="text-center">
          <Target className="w-5 h-5 text-amber-500 mx-auto mb-2" />
          <div className="text-xl font-bold text-gray-700">
            {stats.goalDays}
            <span className="text-sm text-gray-400 font-normal">/{stats.totalDays}</span>
          </div>
          <div className="text-xs text-gray-400">ימי יעד</div>
        </Card>

        <Card className="text-center">
          <Flame className="w-5 h-5 text-orange-500 mx-auto mb-2" />
          <div className="text-xl font-bold text-gray-700">{stats.streak}</div>
          <div className="text-xs text-gray-400">ימים ברצף</div>
        </Card>
      </div>

      {/* Recent Records */}
      <Card>
        <h3 className="font-semibold text-gray-600 mb-4">רשומות אחרונות</h3>
        <div className="space-y-3">
          {records.slice(0, 7).map(record => (
            <div
              key={record.id}
              className="flex items-center justify-between p-3 rounded-lg bg-gray-100/60"
            >
              <div>
                <div className="font-medium text-gray-700 flex items-center gap-2">
                  <Timer className="w-4 h-4 text-emerald-500" />
                  {formatMinutes(record.minutes)}
                </div>
                <div className="text-xs text-gray-400">
                  {new Date(record.date).toLocaleDateString('he-IL', {
                    weekday: 'short',
                    day: 'numeric',
                    month: 'short',
                  })}
                </div>
              </div>
              {record.minutes >= dailyGoal ? (
                <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-600">
                  ✓ יעד
                </span>
              ) : (
                <span className="text-xs text-gray-400">
                  {Math.round((record.minutes / dailyGoal) * 100)}%
                </span>
              )}
            </div>
          ))}
          
          {records.length === 0 && (
            <div className="text-center py-8 text-gray-400">
              אין רשומות עדיין. התחל להזין דקות הליכה!
            </div>
          )}
        </div>
      </Card>

      <WalkingEntryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        defaultDate={getToday()}
        onSuccess={() => {
          setShowModal(false)
          refetch()
        }}
      />
    </div>
  )
}
