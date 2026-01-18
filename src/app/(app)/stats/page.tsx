'use client'

import React, { useState, useMemo } from 'react'
import { getLast7Days, getLast30Days, calculateMovingAverage } from '@/lib/utils'
import { useWalking, useWeight, useSettings, useDailyContent } from '@/hooks/useSupabase'
import { useGamification } from '@/hooks/useGamification'
import { WalkingEntryModal } from '@/components/steps/StepsEntryModal'
import { WeightEntryModal } from '@/components/weight/WeightEntryModal'
import { Modal } from '@/components/ui/Modal'
import { AchievementCard } from '@/components/gamification/AchievementCard'
import { WalkingChart } from '@/components/steps/StepsChart'
import { WeightChart } from '@/components/weight/WeightChart'
import { BackButton } from '@/components/ui/BackButton'
import { CircleMetric } from '@/components/dashboard/CircleMetric'

type ChallengeWithHistory = {
  id: string
  category: string
  title: string
  description: string
  metric_type: string
  metric_value: number | null
  rules: string | null
  difficulty: string
  is_active: boolean
  created_at: string
  completed: boolean
  historyId?: string
}
import { 
  Footprints, 
  Scale, 
  Trophy, 
  Zap,
  TrendingUp,
  TrendingDown,
  Target,
  Flame,
  ChartBar,
  Activity,
  Sparkles,
  Calendar,
  Pencil,
  Trash2,
  Lightbulb,
  Check,
  X,
  Plus
} from 'lucide-react'
import type { Tables } from '@/types/database'

type TabType = 'overview' | 'charts' | 'activity'

// Challenge Tile Component
function ChallengeTile({ 
  challenge, 
  onComplete, 
  onReplace, 
  onRemove 
}: { 
  challenge: ChallengeWithHistory
  onComplete: () => void
  onReplace: () => void
  onRemove: () => void
}) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="relative">
      {/* Main Card */}
      <div className={`relative rounded-2xl border overflow-hidden transition-all duration-300 ${
        challenge.completed
          ? 'bg-emerald-500/20 border-emerald-500/40'
          : 'bg-slate-700/50 border-slate-600 hover:border-slate-500'
      }`}>
        {/* Card Content */}
        <div className="relative p-4">
          <div className="flex items-start justify-between mb-2">
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-2.5 flex-1 text-right"
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                challenge.completed 
                  ? 'bg-emerald-500 shadow-md' 
                  : 'bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md'
              }`}>
                {challenge.completed ? (
                  <Check className="w-5 h-5 text-white" strokeWidth={3} />
                ) : (
                  <Flame className="w-5 h-5 text-white" />
                )}
              </div>
              <div>
                <div className={`text-sm font-bold text-right ${challenge.completed ? 'text-emerald-300 line-through' : 'text-white'}`}>
                  {challenge.title}
                </div>
                <span className="text-xs text-white/60 font-medium">
                  {challenge.completed ? 'הושלם!' : challenge.difficulty === 'easy' ? 'קל' : challenge.difficulty === 'medium' ? 'בינוני' : 'מאתגר'}
                </span>
              </div>
            </button>
            {!challenge.completed && (
              <button
                onClick={onRemove}
                className="w-7 h-7 rounded-lg bg-slate-600/50 hover:bg-rose-500/30 border border-slate-500 hover:border-rose-400 flex items-center justify-center transition-all"
              >
                <X size={14} className="text-white/60 hover:text-rose-400" />
              </button>
            )}
          </div>

          {/* Description - Expandable */}
          {isExpanded && challenge.description && (
            <div className="mb-2 p-2.5 rounded-lg bg-slate-600/30 border border-slate-500/50">
              <p className="text-xs text-white/80 leading-relaxed">{challenge.description}</p>
            </div>
          )}

          {/* Action Buttons */}
          {!challenge.completed && (
            <div className="flex gap-2 mt-2">
              <button
                onClick={onReplace}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-600/50 hover:bg-slate-600 border border-slate-500 text-white/80 text-xs font-semibold transition-all"
              >
                החלף
              </button>
              <button
                onClick={onComplete}
                className="flex-1 py-2 px-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-xs font-bold transition-all shadow-md"
              >
                <div className="text-white flex items-center justify-center gap-1.5">
                  <Check size={13} strokeWidth={3} />
                  סיימתי
                </div>
              </button>
            </div>
          )}

          {/* Completion Badge */}
          {challenge.completed && (
            <div className="mt-2 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/30 border border-emerald-400/50">
              <Sparkles size={13} className="text-amber-400" />
              <span className="text-xs font-black text-emerald-300">+50 XP</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function StatsPage() {
  const { records, getTodayRecord, getConsecutiveGoalDays, deleteRecord: deleteWalkingRecord, refetch: refetchRecords } = useWalking()
  const { weights, getLatestWeight, deleteWeight, refetch: refetchWeights } = useWeight()
  const { settings, loading: settingsLoading } = useSettings()
  const { tip, challenge, challenges, challengeStreak, completeChallenge, replaceChallenge, addNewChallenge, removeChallenge } = useDailyContent()
  const { 
    gamification, 
    levelInfo, 
    achievements,
    userAchievements,
    updateStreak,
    incrementStat,
    addXP,
    loading: gamificationLoading 
  } = useGamification()
  
  const [activeTab, setActiveTab] = useState<TabType>('overview')
  const [showWalkingModal, setShowWalkingModal] = useState(false)
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [editWalkingRecord, setEditWalkingRecord] = useState<Tables<'steps_records'> | undefined>()
  const [editWeightRecord, setEditWeightRecord] = useState<Tables<'weight_records'> | undefined>()
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [showAchievementsModal, setShowAchievementsModal] = useState(false)
  const [isAddingChallenge, setIsAddingChallenge] = useState(false)
  
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
    const days = getLast7Days()
    return days.map(date => {
      const record = records.find(r => r.date === date)
      return { date, minutes: record?.minutes || 0, goal: dailyGoal, hasData: !!record }
    })
  }, [records, dailyGoal])

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

  const handleChallengeComplete = async () => {
    try {
      if (challenge?.historyId) {
        await completeChallenge(challenge.historyId)
        await incrementStat('challenge')
        await addXP(50)
      }
    } catch (error) {
      console.error('Error completing challenge:', error)
    }
  }

  const handleReplaceChallenge = async () => {
    try {
      if (challenge?.historyId) {
        await replaceChallenge(challenge.historyId)
      }
    } catch (error) {
      console.error('Error replacing challenge:', error)
    }
  }

  const handleAddNewChallenge = async () => {
    setIsAddingChallenge(true)
    try {
      await addNewChallenge()
    } catch (error) {
      console.error('Error adding new challenge:', error)
    } finally {
      setIsAddingChallenge(false)
    }
  }



  const handleWalkingUpdate = async () => {
    await refetchRecords()
    await updateStreak(new Date().toISOString())
    await incrementStat('steps')
  }

  const handleWeightUpdate = async () => {
    await refetchWeights()
    await updateStreak(new Date().toISOString())
    await incrementStat('weight')
  }

  const handleDeleteActivity = async (activity: typeof activities[0]) => {
    setDeleting(true)
    try {
      if (activity.type === 'walking') {
        await deleteWalkingRecord((activity.record as Tables<'steps_records'>).id)
        await refetchRecords()
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
    { id: 'overview' as TabType, label: 'סיכום', icon: Sparkles },
    { id: 'charts' as TabType, label: 'גרפים', icon: ChartBar },
    { id: 'activity' as TabType, label: 'היסטוריה', icon: Activity },
  ]

  const levelTitle = ['מתחיל', 'מתאמן', 'פעיל', 'מתמיד', 'מתקדם', 'חרוץ', 'קבוע', 'יציב', 'מוביל', 'מומחה'][Math.min(levelInfo.level - 1, 9)] || 'אלוף'

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
      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="animate-fadeIn">
          {/* === Simple iPhone App Style === */}
          <div className="animate-fadeIn">
            <div className="max-w-md mx-auto bg-gradient-to-br from-slate-800 via-slate-700 to-slate-800 rounded-[3rem] overflow-hidden shadow-2xl">
              {/* Subtle Background Pattern */}
              <div className="absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(147,197,253,0.08),transparent_40%)]" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(167,243,208,0.08),transparent_40%)]" />
              </div>

              {/* Content */}
              <div className="relative">
                {/* Top Stats Section */}
                <div className="p-6 space-y-5">
                  {/* Stats Rings */}
                  <div className="flex justify-center mb-4">
                    <div className="relative w-48 h-48">
                      {/* Outer Ring - Weekly Goal Progress */}
                      <svg className="absolute inset-0 w-full h-full -rotate-90">
                        <circle cx="96" cy="96" r="90" fill="none" stroke="rgba(16,185,129,0.15)" strokeWidth="8" />
                        <circle cx="96" cy="96" r="90" fill="none" stroke="url(#ring1)" strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(walkingStats.goalDaysThisWeek / 7) * 565} 565`} className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                      </svg>
                      {/* Middle Ring - Streak */}
                      <svg className="absolute inset-3 w-[calc(100%-24px)] h-[calc(100%-24px)] -rotate-90">
                        <circle cx="84" cy="84" r="78" fill="none" stroke="rgba(251,146,60,0.15)" strokeWidth="6" />
                        <circle cx="84" cy="84" r="78" fill="none" stroke="url(#ring2)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${Math.min((gamification?.current_streak || 0) / 30 * 490, 490)} 490`} className="drop-shadow-[0_0_6px_rgba(251,146,60,0.5)]" />
                      </svg>
                      {/* Inner Ring - Today Progress */}
                      <svg className="absolute inset-6 w-[calc(100%-48px)] h-[calc(100%-48px)] -rotate-90">
                        <circle cx="72" cy="72" r="66" fill="none" stroke="rgba(139,92,246,0.15)" strokeWidth="5" />
                        <circle cx="72" cy="72" r="66" fill="none" stroke="url(#ring3)" strokeWidth="5" strokeLinecap="round" strokeDasharray={`${Math.min((walkingStats.todayMinutes / dailyGoal) * 415, 415)} 415`} className="drop-shadow-[0_0_5px_rgba(139,92,246,0.5)]" />
                      </svg>

                      {/* Center Content */}
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Footprints className="w-7 h-7 text-emerald-400 mb-1" />
                        <div className="text-4xl font-black text-white tracking-tight">{walkingStats.weeklyAvg}</div>
                        <div className="text-xs text-emerald-400 font-medium">דק׳/יום</div>
                      </div>

                            {/* SVG Gradients */}
                            <svg className="absolute" width="0" height="0">
                              <defs>
                                <linearGradient id="ring1" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#10b981" />
                                  <stop offset="100%" stopColor="#06b6d4" />
                                </linearGradient>
                                <linearGradient id="ring2" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#f97316" />
                                  <stop offset="100%" stopColor="#fbbf24" />
                                </linearGradient>
                                <linearGradient id="ring3" x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor="#8b5cf6" />
                                  <stop offset="100%" stopColor="#ec4899" />
                                </linearGradient>
                              </defs>
                            </svg>
                          </div>
                        </div>

                        {/* Ring Legend */}
                        <div className="flex justify-center gap-4 mb-5">
                          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30">
                            <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                            <span className="text-sm text-emerald-300 font-medium">{walkingStats.goalDaysThisWeek}/7 ימים</span>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-orange-500/20 border border-orange-500/30">
                            <div className="w-2.5 h-2.5 rounded-full bg-orange-400" />
                            <span className="text-sm text-orange-300 font-medium">{gamification?.current_streak || 0} רצף</span>
                          </div>
                          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-violet-500/20 border border-violet-500/30">
                            <div className="w-2.5 h-2.5 rounded-full bg-violet-400" />
                            <span className="text-sm text-violet-300 font-medium">{walkingStats.todayMinutes} היום</span>
                          </div>
                        </div>

                        {/* Quick Stats Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-5">
                          {/* Weight */}
                          <div className="flex flex-col items-center p-4 rounded-2xl bg-blue-500/20 border border-blue-500/30">
                            <Scale className="w-6 h-6 text-blue-400 mb-2" />
                            <span className="text-2xl font-black text-white">{weightStats?.latest || '--'}</span>
                            <span className="text-sm text-blue-300 font-medium">משקל (ק״ג)</span>
                          </div>
                          {/* Monthly */}
                          <div className="flex flex-col items-center p-4 rounded-2xl bg-pink-500/20 border border-pink-500/30">
                            <Calendar className="w-6 h-6 text-pink-400 mb-2" />
                            <span className="text-2xl font-black text-white">{Math.floor(walkingStats.monthlyTotal / 60)}:{(walkingStats.monthlyTotal % 60).toString().padStart(2, '0')}</span>
                            <span className="text-sm text-pink-300 font-medium">שעות חודש</span>
                          </div>
                          {/* Level */}
                          <div className="flex flex-col items-center p-4 rounded-2xl bg-violet-500/20 border border-violet-500/30">
                            <Zap className="w-6 h-6 text-violet-400 mb-2" />
                            <span className="text-2xl font-black text-white">{levelInfo.level}</span>
                            <span className="text-sm text-violet-300 font-medium">{levelTitle}</span>
                          </div>
                          {/* XP */}
                          <div className="flex flex-col items-center p-4 rounded-2xl bg-amber-500/20 border border-amber-500/30">
                            <Sparkles className="w-6 h-6 text-amber-400 mb-2" />
                            <span className="text-2xl font-black text-white">{gamification?.total_xp || 0}</span>
                            <span className="text-sm text-amber-300 font-medium">נקודות XP</span>
                          </div>
                        </div>

                        {/* Achievements Row */}
                        {userAchievements.length > 0 && (
                          <button onClick={() => setShowAchievementsModal(true)} className="w-full px-5 py-4 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 transition-colors mb-5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <Trophy className="w-6 h-6 text-amber-400" />
                                <span className="text-base text-white/90 font-bold">{userAchievements.length} הישגים</span>
                              </div>
                              <div className="flex -space-x-2 rtl:space-x-reverse">
                                {userAchievements.slice(0, 6).map((ach, i) => (
                                  <div key={ach.id} className="w-10 h-10 rounded-full bg-slate-700 border-2 border-amber-500/40 flex items-center justify-center text-base" style={{ zIndex: 6 - i }}>
                                    {ach.icon}
                                  </div>
                                ))}
                                {userAchievements.length > 6 && (
                                  <div className="w-10 h-10 rounded-full bg-slate-700 border-2 border-white/30 flex items-center justify-center text-sm text-white/70 font-bold">+{userAchievements.length - 6}</div>
                                )}
                              </div>
                            </div>
                          </button>
                        )}

                        {/* Daily Tip */}
                        {settings?.show_daily_tip && tip && (
                          <div className="p-5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30">
                            <div className="flex items-start gap-3">
                              <Lightbulb className="w-6 h-6 text-emerald-400 shrink-0 mt-1" />
                              <div className="min-w-0">
                                <div className="text-base font-bold text-emerald-300 mb-2">{tip.title}</div>
                                <div className="text-sm text-white/70 leading-relaxed">{tip.body}</div>
                              </div>
                            </div>
                          </div>
                        )}
                </div>

                {/* Challenges Section */}
                {settings?.show_daily_challenge && challenges.length > 0 && (
                  <div className="p-6 pt-0">
                    {/* Section Header */}
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md flex items-center justify-center">
                        <Target className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-lg font-black text-white">אתגרים יומיים</h2>
                        <p className="text-xs text-emerald-400 font-medium">{challenges.filter(c => !c.completed).length} פעילים</p>
                      </div>
                    </div>

                    {/* Challenges List */}
                    <div className="space-y-3">
                      {challenges.map((ch: ChallengeWithHistory) => (
                        <ChallengeTile
                          key={ch.historyId}
                          challenge={ch}
                          onComplete={() => {
                            if (ch.historyId) {
                              completeChallenge(ch.historyId).then(() => {
                                incrementStat('challenge')
                                addXP(50)
                              }).catch(console.error)
                            }
                          }}
                          onReplace={() => {
                            if (ch.historyId) {
                              replaceChallenge(ch.historyId).catch(console.error)
                            }
                          }}
                          onRemove={() => {
                            if (ch.historyId) {
                              removeChallenge(ch.historyId).catch(console.error)
                            }
                          }}
                        />
                      ))}

                      {/* Add New Challenge */}
                      <button
                        onClick={handleAddNewChallenge}
                        disabled={isAddingChallenge}
                        className="w-full py-3 rounded-2xl border border-dashed border-white/30 hover:border-emerald-400 bg-white/5 hover:bg-emerald-500/10 transition-all disabled:opacity-50"
                      >
                        {isAddingChallenge ? (
                          <div className="flex items-center justify-center gap-2">
                            <div className="w-4 h-4 border-2 border-white/30 border-t-emerald-400 rounded-full animate-spin" />
                            <span className="text-sm text-white/70 font-medium">טוען...</span>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <Plus size={16} className="text-emerald-400" />
                            <span className="text-sm font-semibold text-white/80">הוסף אתגר חדש</span>
                          </div>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Charts Tab */}
      {activeTab === 'charts' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Walking Chart */}
          <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-emerald-100">
                <Footprints className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h3 className="font-bold text-slate-800">הליכה</h3>
                <p className="text-xs text-slate-600">7 ימים אחרונים</p>
              </div>
            </div>
            <WalkingChart data={walkingChartData} goal={dailyGoal} />
          </div>

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
        onSuccess={() => {
          setShowWalkingModal(false)
          setEditWalkingRecord(undefined)
          handleWalkingUpdate()
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
        onSuccess={() => {
          setShowWeightModal(false)
          setEditWeightRecord(undefined)
          handleWeightUpdate()
        }}
        onDelete={() => {
          setEditWeightRecord(undefined)
          refetchWeights()
        }}
      />

      {/* Achievements Modal */}
      <Modal 
        isOpen={showAchievementsModal} 
        onClose={() => setShowAchievementsModal(false)}
        title="ההישגים שלי"
        size="lg"
      >
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
          {/* Unlocked Achievements */}
          {userAchievements.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-emerald-400 mb-3 flex items-center gap-2">
                <Trophy className="w-4 h-4" />
                הישגים שהושגו ({userAchievements.length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {userAchievements.map((ach) => (
                  <AchievementCard 
                    key={ach.id}
                    achievement={ach}
                    unlocked={true}
                    unlockedAt={ach.unlocked_at}
                    compact
                  />
                ))}
              </div>
            </div>
          )}

          {/* Locked Achievements */}
          {achievements.filter(a => !userAchievements.find(ua => ua.id === a.id)).length > 0 && (
            <div className="mt-6">
              <h3 className="text-sm font-semibold text-gray-400 mb-3 flex items-center gap-2">
                🔒 הישגים נעולים ({achievements.filter(a => !userAchievements.find(ua => ua.id === a.id)).length})
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {achievements
                  .filter(a => !userAchievements.find(ua => ua.id === a.id))
                  .map((ach) => (
                    <AchievementCard 
                      key={ach.id}
                      achievement={ach}
                      unlocked={false}
                      compact
                    />
                  ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

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
