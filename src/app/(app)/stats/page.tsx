'use client'

import { useState, useMemo } from 'react'
import { getLast7Days, getLast30Days, calculateMovingAverage } from '@/lib/utils'
import { useWalking, useWeight, useSettings, useDailyContent } from '@/hooks/useSupabase'
import { useGamification } from '@/hooks/useGamification'
import { WalkingEntryModal } from '@/components/steps/StepsEntryModal'
import { WeightEntryModal } from '@/components/weight/WeightEntryModal'
import { Modal } from '@/components/ui/Modal'
import { AchievementCard } from '@/components/gamification/AchievementCard'
import { ChallengeCard } from '@/components/dashboard/ChallengeCard'
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
        <div className="space-y-6 animate-fadeIn">
          {/* Circle Metrics - Like Dashboard */}
          <div className="flex flex-col items-center justify-center py-6">
            {/* Large Circle - Walking */}
            <div className="relative z-0 mb-4">
              <CircleMetric
                size="large"
                icon={<Footprints className="w-7 h-7" />}
                value={walkingStats.weeklyAvg}
                label="ממוצע השבוע"
                sublabel="דקות ליום"
                progress={Math.min((walkingStats.weeklyAvg / dailyGoal) * 100, 100)}
                trend={walkingStats.weeklyTrend}
                bgGradient="from-emerald-50 to-teal-50"
              />
            </div>

            {/* Bottom Row - Weight and Streak */}
            <div className="flex items-center justify-center gap-6 -mt-8 relative z-10">
              {/* Weight Circle */}
              <CircleMetric
                size="medium"
                icon={<Scale className="w-5 h-5" />}
                value={weightStats?.latest || '--'}
                label="ק״ג אחרון"
                sublabel={
                  weightStats?.change !== 0 && weightStats?.change !== undefined
                    ? `${weightStats.change > 0 ? '+' : ''}${weightStats.change} מהקודם`
                    : undefined
                }
                bgGradient="from-blue-50 to-cyan-50"
              />

              {/* Streak Circle */}
              <CircleMetric
                size="small"
                icon={<Flame className="w-4 h-4" />}
                value={gamification?.current_streak || 0}
                label="ימים ברצף"
                sublabel={consecutiveGoalDays > 0 ? `${consecutiveGoalDays} ביעד` : undefined}
                bgGradient="from-orange-50 to-amber-50"
              />
            </div>
          </div>

          {/* Cards Grid - Simplified */}
          <div className="grid grid-cols-2 gap-3">

            {/* Level Progress Card */}
            <div className="col-span-2 p-5 rounded-3xl bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-md">
                      <span className="text-xl font-black text-white">{levelInfo.level}</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-white border border-violet-200">
                      <Zap size={12} className="text-violet-500" />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-slate-800 text-lg">{levelTitle}</div>
                    <div className="text-sm text-slate-600">{gamification?.total_xp || 0} XP</div>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-xs text-slate-500">לרמה הבאה</div>
                  <div className="text-base font-bold text-slate-800">{levelInfo.nextLevelXP - levelInfo.currentLevelXP} XP</div>
                </div>
              </div>
              <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${levelInfo.progress}%` }}
                />
              </div>
            </div>

            {/* Goal Days Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-50 to-sky-50 border border-cyan-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-cyan-100">
                  <Target className="w-4 h-4 text-cyan-600" />
                </div>
                <span className="text-sm font-semibold text-slate-800">ימי יעד</span>
              </div>
              <div className="text-3xl font-black text-slate-800">
                {walkingStats.goalDaysThisWeek}
                <span className="text-lg font-semibold text-slate-600">/7</span>
              </div>
            </div>

            {/* Monthly Total Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-rose-50 border border-pink-100">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-pink-100">
                  <Calendar className="w-4 h-4 text-pink-600" />
                </div>
                <span className="text-sm font-semibold text-slate-800">החודש</span>
              </div>
              <div className="text-3xl font-black text-slate-800">
                {formatMinutes(walkingStats.monthlyTotal)}
                <span className="text-sm font-semibold text-slate-600 mr-1">דק׳</span>
              </div>
            </div>

            {/* Achievements Preview */}
            {userAchievements.length > 0 && (
              <button 
                onClick={() => setShowAchievementsModal(true)}
                className="col-span-2 p-5 rounded-3xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-100 hover:border-amber-200 transition-all cursor-pointer text-right hover:scale-[1.01]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-amber-100">
                      <Trophy className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800">{userAchievements.length} הישגים</div>
                      <div className="text-xs text-slate-600">לחץ לצפייה</div>
                    </div>
                  </div>
                  <div className="flex -space-x-2 rtl:space-x-reverse">
                    {userAchievements.slice(0, 5).map((ach, i) => (
                      <div 
                        key={ach.id}
                        className="w-10 h-10 rounded-full bg-white border-2 border-amber-100 flex items-center justify-center text-lg"
                        style={{ zIndex: 5 - i }}
                      >
                        {ach.icon}
                      </div>
                    ))}
                  </div>
                </div>
              </button>
            )}

            {/* Daily Tip - Compact */}
            {settings?.show_daily_tip && tip && (
              <div className="col-span-2 p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-50 border border-slate-200">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-emerald-100 shrink-0">
                    <Lightbulb className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-slate-800 mb-1">{tip.title}</div>
                    <div className="text-xs text-slate-600 line-clamp-2">{tip.body}</div>
                  </div>
                </div>
              </div>
            )}

            {/* Daily Challenge - Enhanced */}
            {settings?.show_daily_challenge && (
              <div className="col-span-2 space-y-3">
                {/* Challenges List */}
                {challenges.length > 0 && challenges.map((ch: ChallengeWithHistory) => (
                  <ChallengeCard
                    key={ch.historyId}
                    challenge={ch}
                    onComplete={() => {
                      if (ch.historyId) {
                        completeChallenge(ch.historyId).then(() => {
                          incrementStat('challenge')
                          addXP(50)
                        }).catch(error => {
                          console.error('Error completing challenge:', error)
                        })
                      }
                    }}
                    onReplace={ch.completed ? undefined : () => {
                      if (ch.historyId) {
                        replaceChallenge(ch.historyId).catch(error => {
                          console.error('Error replacing challenge:', error)
                        })
                      }
                    }}
                    onRemove={() => {
                      if (ch.historyId) {
                        removeChallenge(ch.historyId).catch(error => {
                          console.error('Error removing challenge:', error)
                        })
                      }
                    }}
                    challengeStreak={challengeStreak}
                    xpReward={50}
                    compact
                  />
                ))}

                {/* Add Challenge Button - Centered below challenges */}
                <div className="flex justify-center pt-2">
                  <button
                    onClick={handleAddNewChallenge}
                    disabled={isAddingChallenge}
                    aria-label="הוסף אתגר"
                    title="הוסף אתגר"
                    className={`
                      group relative w-12 h-12 rounded-full
                      overflow-hidden
                      transition-all duration-300
                      hover:scale-110 active:scale-95
                      disabled:opacity-70 disabled:cursor-not-allowed
                      flex items-center justify-center
                    `}
                  >
                    {/* Button background gradient */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)] via-[var(--primary)] to-[var(--accent)] bg-[length:200%_100%] group-hover:animate-shimmer" />
                    
                    {/* Glow effect */}
                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 blur-xl bg-[var(--accent)]/50 transition-opacity duration-300" />
                    
                    {/* Button content */}
                    {isAddingChallenge ? (
                      <div className="relative z-10 w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <Plus size={20} className="relative z-10 text-white" />
                    )}
                  </button>
                </div>
              </div>
            )}
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
      `}</style>
    </div>
  )
}
