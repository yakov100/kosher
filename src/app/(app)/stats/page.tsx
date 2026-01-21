'use client'

import React, { useState, useMemo } from 'react'
import { getLast7Days, getLast30Days, calculateMovingAverage, getToday } from '@/lib/utils'
import { useWalking, useWeight, useSettings, useDailyContent } from '@/hooks/useSupabase'
import { useGamification } from '@/hooks/useGamification'
import { WalkingEntryModal } from '@/components/steps/StepsEntryModal'
import { WeightEntryModal } from '@/components/weight/WeightEntryModal'
import { WalkingChart } from '@/components/steps/StepsChart'
import { WeightChart } from '@/components/weight/WeightChart'
import { BackButton } from '@/components/ui/BackButton'
import { 
  Footprints, 
  Scale, 
  ChartBar,
  Activity,
  Pencil,
  Trash2,
  X
} from 'lucide-react'
import type { Tables } from '@/types/database'

type TabType = 'charts' | 'activity'

export default function StatsPage() {
  const { records, getTodayRecord, getConsecutiveGoalDays, deleteRecord: deleteWalkingRecord, refetch: refetchRecords } = useWalking()
  const { weights, getLatestWeight, deleteWeight, refetch: refetchWeights } = useWeight()
  const { settings, loading: settingsLoading } = useSettings()
  const { 
    updateStreak,
    incrementStat,
    addXP,
    loading: gamificationLoading 
  } = useGamification()
  
  const [activeTab, setActiveTab] = useState<TabType>('charts')
  const [showWalkingModal, setShowWalkingModal] = useState(false)
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [editWalkingRecord, setEditWalkingRecord] = useState<Tables<'steps_records'> | undefined>()
  const [editWeightRecord, setEditWeightRecord] = useState<Tables<'weight_records'> | undefined>()
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  
  const todayRecord = getTodayRecord()
  const latestWeight = getLatestWeight()
  const previousWeight = weights[1]
  const dailyGoal = settings?.daily_walking_minutes_goal || 30
  const { consecutiveDays: consecutiveGoalDays, todayGoalMet } = getConsecutiveGoalDays(dailyGoal)

  // Calculate walking stats
  const walkingStats = useMemo(() => {
    const last7 = getLast7Days()
    const last30 = getLast30Days()
    const records7 = records.filter(r => last7.includes(r.date))
    const records30 = records.filter(r => last30.includes(r.date))
    
    const todayMinutes = todayRecord?.minutes || 0
    const weeklyAvg = records7.length > 0 
      ? Math.round(records7.reduce((sum, r) => sum + r.minutes, 0) / records7.length)
      : 0
    const monthlyTotal = records30.reduce((sum, r) => sum + r.minutes, 0)
    const goalDaysThisWeek = records7.filter(r => r.minutes >= dailyGoal).length
    
    const thisWeekTotal = records7.reduce((sum, r) => sum + r.minutes, 0)
    const lastWeekRecords = records.filter(r => {
      const date = new Date(r.date)
      const weekAgo = new Date()
      weekAgo.setDate(weekAgo.getDate() - 14)
      const twoWeeksAgo = new Date()
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 21)
      return date >= twoWeeksAgo && date < weekAgo
    })
    const lastWeekTotal = lastWeekRecords.reduce((sum, r) => sum + r.minutes, 0)
    const weeklyTrend = lastWeekTotal > 0 
      ? Math.round(((thisWeekTotal - lastWeekTotal) / lastWeekTotal) * 100)
      : 0

    return { todayMinutes, weeklyAvg, monthlyTotal, goalDaysThisWeek, weeklyTrend }
  }, [records, todayRecord, dailyGoal])

  // Calculate weight stats
  const weightStats = useMemo(() => {
    if (weights.length === 0) return null
    const latest = Number(latestWeight?.weight || 0)
    const previous = Number(previousWeight?.weight || 0)
    const change = previous > 0 ? Number((latest - previous).toFixed(1)) : 0
    return { latest, change, count: weights.length }
  }, [weights, latestWeight, previousWeight])

  // Chart data
  const walkingChartData = useMemo(() => {
    const data = records
      .map(r => ({ date: r.date, value: r.minutes }))
      .sort((a, b) => a.date.localeCompare(b.date))
    const withMovingAvg = calculateMovingAverage(data, 7)
    return withMovingAvg.map(d => ({
      date: d.date,
      minutes: d.value,
      movingAvg: d.movingAvg,
      hasData: true
    }))
  }, [records])

  const weightChartData = useMemo(() => {
    const data = weights
      .map(w => ({ date: w.recorded_at.split('T')[0], value: Number(w.weight) }))
      .sort((a, b) => a.date.localeCompare(b.date))
    return calculateMovingAverage(data, 7)
  }, [weights])

  // Activity items
  const activities = useMemo(() => {
    const items: Array<{
      id: string
      type: 'walking' | 'weight'
      date: string
      value: string
      record: Tables<'steps_records'> | Tables<'weight_records'>
    }> = []

    records.forEach(record => {
      items.push({
        id: `walking-${record.id}`,
        type: 'walking',
        date: record.date,
        value: `${record.minutes} דק׳`,
        record,
      })
    })

    weights.forEach(record => {
      items.push({
        id: `weight-${record.id}`,
        type: 'weight',
        date: record.recorded_at.split('T')[0],
        value: `${record.weight} ק״ג`,
        record,
      })
    })

    return items
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20)
  }, [records, weights])

  const handleWalkingUpdate = async (recordDate?: string, previousMinutes?: number) => {
    const beforeMinutes = previousMinutes || 0
    await refetchRecords()
    await updateStreak(recordDate || getToday())
    await incrementStat('steps')
    
    // Calculate the difference in minutes to give proportional XP
    const afterMinutes = records.find(r => r.date === recordDate)?.minutes || 0
    const minutesDifference = afterMinutes - beforeMinutes
    
    // Give XP proportional to walking time added (1 XP per 2 minutes)
    if (minutesDifference > 0) {
      const xpAmount = Math.floor(minutesDifference / 2)
      if (xpAmount > 0) {
        await addXP(xpAmount)
      }
    }
  }

  const handleWeightUpdate = async (recordDate?: string) => {
    await refetchWeights()
    await updateStreak(recordDate || new Date().toISOString())
    await incrementStat('weight')
    await addXP(15)
  }

  const handleDeleteActivity = async (activity: typeof activities[0]) => {
    setDeleting(true)
    try {
      if (activity.type === 'walking') {
        await deleteWalkingRecord((activity.record as Tables<'steps_records'>).id)
        await refetchRecords()
        // Update streak after deletion to recalculate
        await updateStreak(getToday())
      } else {
        await deleteWeight((activity.record as Tables<'weight_records'>).id)
        await refetchWeights()
      }
      setDeleteConfirmId(null)
    } catch (error) {
      console.error('Error deleting record:', error)
    } finally {
      setDeleting(false)
    }
  }

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}`
    const hours = Math.floor(mins / 60)
    const remaining = mins % 60
    return remaining > 0 ? `${hours}:${remaining.toString().padStart(2, '0')}` : `${hours}h`
  }

  if (settingsLoading || gamificationLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-[var(--primary)]">טוען...</div>
      </div>
    )
  }

  const tabs = [
    { id: 'charts' as TabType, label: 'גרפים', icon: ChartBar },
    { id: 'activity' as TabType, label: 'היסטוריה', icon: Activity },
  ]

  return (
    <div className="pb-4">
      {/* Sticky Header + Tabs */}
      <div className="sticky -top-6 z-50 bg-[var(--background)] pt-6 pb-4">
        {/* Header */}
        <header className="py-3 flex items-center gap-3">
          <BackButton />
          <h1 className="text-xl font-bold text-white">נתונים</h1>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-white/95 backdrop-blur-sm rounded-2xl shadow-md border border-white/20">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl
              font-semibold text-sm transition-all duration-300
              ${activeTab === tab.id 
                ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-md shadow-emerald-400/20 scale-[1.02]' 
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }
            `}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
        </div>
      </div>

      {/* Content Area */}
      <div>
      {/* Charts Tab */}
      {activeTab === 'charts' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Walking Chart */}
          {walkingChartData.length > 0 && (
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-emerald-100">
                  <Footprints className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">הליכה</h3>
                  <p className="text-xs text-slate-600">30 ימים אחרונים</p>
                </div>
              </div>
              <WalkingChart data={walkingChartData} goal={dailyGoal} />
            </div>
          )}

          {/* Weight Chart */}
          {weightChartData.length > 0 && (
            <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-blue-100">
                  <Scale className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-800">משקל</h3>
                  <p className="text-xs text-slate-600">30 ימים אחרונים</p>
                </div>
              </div>
              <WeightChart data={weightChartData} />
            </div>
          )}
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <div className="animate-fadeIn">
          {activities.length === 0 ? (
            <div className="text-center py-16 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-50 border border-slate-200">
              <div className="text-5xl mb-4">🚀</div>
              <div className="text-slate-600 font-medium">
                אין פעילות עדיין. התחל להזין נתונים!
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {activities.map((activity, index) => {
                const isWalking = activity.type === 'walking'
                const isDeleting = deleteConfirmId === activity.id
                return (
                  <div
                    key={activity.id}
                    className={`
                      p-4 rounded-2xl
                      bg-gradient-to-br from-slate-50 to-white border border-slate-200
                      hover:border-slate-300 transition-all duration-200
                    `}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {isDeleting ? (
                      <div className="animate-fadeIn">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2.5 rounded-xl bg-rose-100 border border-rose-200 animate-pulse">
                            <Trash2 className="w-5 h-5 text-rose-600" />
                          </div>
                          <p className="text-sm text-slate-700 font-medium">
                            האם אתה בטוח שברצונך למחוק רשומה זו?
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="group flex-1 relative py-2.5 px-4 rounded-xl overflow-hidden font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <div className="absolute inset-0 bg-slate-100 group-hover:bg-slate-200 transition-all duration-300" />
                            <div className="absolute inset-0 border border-slate-200 group-hover:border-slate-300 rounded-xl transition-all duration-300" />
                            <span className="relative z-10 flex items-center justify-center gap-2 text-slate-700">
                              <X size={16} />
                              ביטול
                            </span>
                          </button>
                          <button
                            onClick={() => handleDeleteActivity(activity)}
                            disabled={deleting}
                            className="group flex-1 relative py-2.5 px-4 rounded-xl overflow-hidden font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
                          >
                            <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 bg-[length:200%_100%] group-hover:animate-shimmer" />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 blur-xl bg-rose-500/50 transition-opacity duration-300" />
                            <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                              <Trash2 size={16} className={deleting ? 'animate-bounce' : ''} />
                              {deleting ? 'מוחק...' : 'מחק'}
                            </span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                          <div className={`p-2.5 rounded-xl ${
                            isWalking ? 'bg-emerald-100' : 'bg-blue-100'
                          }`}>
                            {isWalking ? (
                              <Footprints className="w-5 h-5 text-emerald-600" />
                            ) : (
                              <Scale className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-lg text-slate-800">
                              {activity.value}
                            </div>
                            <div className="text-xs text-slate-600">
                              {new Date(activity.date).toLocaleDateString('he-IL', { 
                                weekday: 'short', 
                                day: 'numeric', 
                                month: 'short' 
                              })}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {/* Edit Button - Cool gradient hover */}
                          <button
                            onClick={() => {
                              if (isWalking) {
                                setEditWalkingRecord(activity.record as Tables<'steps_records'>)
                                setShowWalkingModal(true)
                              } else {
                                setEditWeightRecord(activity.record as Tables<'weight_records'>)
                                setShowWeightModal(true)
                              }
                            }}
                            className="group relative p-2.5 rounded-xl overflow-hidden transition-all duration-300 hover:scale-110 active:scale-95"
                            title="עריכה"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/0 via-blue-500/0 to-cyan-500/0 group-hover:from-violet-500/20 group-hover:via-blue-500/20 group-hover:to-cyan-500/20 transition-all duration-300" />
                            <div className="absolute inset-0 border border-transparent group-hover:border-violet-400/30 rounded-xl transition-all duration-300" />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 blur-lg bg-violet-500/20 transition-opacity duration-300" />
                            <Pencil 
                              size={17} 
                              className="relative z-10 text-slate-500 group-hover:text-violet-500 transition-all duration-300 group-hover:-rotate-12" 
                            />
                          </button>
                          {/* Delete Button - Animated trash */}
                          <button
                            onClick={() => setDeleteConfirmId(activity.id)}
                            className="group relative p-2.5 rounded-xl overflow-hidden transition-all duration-300 hover:scale-110 active:scale-95"
                            title="מחיקה"
                          >
                            <div className="absolute inset-0 bg-gradient-to-br from-rose-500/0 via-pink-500/0 to-red-500/0 group-hover:from-rose-500/20 group-hover:via-pink-500/20 group-hover:to-red-500/20 transition-all duration-300" />
                            <div className="absolute inset-0 border border-transparent group-hover:border-rose-400/30 rounded-xl transition-all duration-300" />
                            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 blur-lg bg-rose-500/20 transition-opacity duration-300" />
                            <Trash2 
                              size={17} 
                              className="relative z-10 text-slate-500 group-hover:text-rose-500 transition-all duration-300 group-hover:rotate-12" 
                            />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
      </div>

      {/* Modals */}
      <WalkingEntryModal
        isOpen={showWalkingModal}
        onClose={() => {
          setShowWalkingModal(false)
          setEditWalkingRecord(undefined)
        }}
        existingRecord={editWalkingRecord}
        onSuccess={(recordDate) => {
          const previousMinutes = editWalkingRecord?.minutes || 0
          setShowWalkingModal(false)
          setEditWalkingRecord(undefined)
          handleWalkingUpdate(recordDate, previousMinutes)
        }}
        onDelete={() => {
          setEditWalkingRecord(undefined)
          refetchRecords()
        }}
      />
      <WeightEntryModal
        isOpen={showWeightModal}
        onClose={() => {
          setShowWeightModal(false)
          setEditWeightRecord(undefined)
        }}
        existingRecord={editWeightRecord}
        onSuccess={(recordDate) => {
          setShowWeightModal(false)
          setEditWeightRecord(undefined)
          handleWeightUpdate(recordDate)
        }}
        onDelete={() => {
          setEditWeightRecord(undefined)
          refetchWeights()
        }}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); opacity: 0.3; }
          25% { transform: translate(10px, -15px) rotate(90deg); opacity: 0.7; }
          50% { transform: translate(-5px, -25px) rotate(180deg); opacity: 0.5; }
          75% { transform: translate(-15px, -10px) rotate(270deg); opacity: 0.8; }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideIn {
          animation: slideIn 0.5s ease-out forwards;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
