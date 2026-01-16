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
          <h1 className="text-xl font-bold text-[var(--foreground)]">נתונים</h1>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-2 p-1 bg-[var(--card)] rounded-2xl">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl
              font-semibold text-sm transition-all duration-300
              ${activeTab === tab.id 
                ? 'bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] text-white shadow-lg shadow-[var(--primary)]/30' 
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--card)]'
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
        <div className="space-y-4 animate-fadeIn">
          {/* Bento Grid - Main Stats */}
          <div className="grid grid-cols-2 gap-3">
            {/* Walking Card - Large */}
            <div className="col-span-2 p-5 rounded-3xl bg-gradient-to-br from-emerald-500/20 via-[var(--card)] to-teal-500/10 border border-emerald-500/20 ">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/20">
                    <Footprints className="w-5 h-5 text-emerald-400" />
                  </div>
                  <span className="font-semibold text-[var(--foreground)]">הליכה השבוע</span>
                </div>
                {walkingStats.weeklyTrend !== 0 && (
                  <div className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                    walkingStats.weeklyTrend > 0 
                      ? 'bg-emerald-500/20 text-emerald-400' 
                      : 'bg-red-500/20 text-red-400'
                  }`}>
                    {walkingStats.weeklyTrend > 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                    {walkingStats.weeklyTrend > 0 ? '+' : ''}{walkingStats.weeklyTrend}%
                  </div>
                )}
              </div>
              <div className="flex items-end justify-between">
                <div>
                  <div className="text-4xl font-black text-emerald-400 mb-1">
                    {walkingStats.weeklyAvg}
                    <span className="text-lg font-semibold text-emerald-400/70 mr-1">דק׳</span>
                  </div>
                  <div className="text-sm text-[var(--muted-foreground)]">ממוצע יומי</div>
                </div>
                <div className="flex gap-1">
                  {[...Array(7)].map((_, i) => (
                    <div 
                      key={i} 
                      className={`w-3 h-8 rounded-full transition-all ${
                        i < walkingStats.goalDaysThisWeek 
                          ? 'bg-gradient-to-t from-emerald-500 to-teal-400' 
                          : 'bg-[var(--muted)]/50'
                      }`}
                      style={{ height: `${20 + (i < walkingStats.goalDaysThisWeek ? 12 : 0)}px` }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Weight Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500/20 via-[var(--card)] to-cyan-500/10 border border-blue-500/20 ">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-blue-500/20">
                  <Scale className="w-4 h-4 text-blue-400" />
                </div>
                <span className="text-sm font-semibold text-[var(--foreground)]">משקל</span>
              </div>
              <div className="text-3xl font-black text-blue-400 mb-1">
                {weightStats?.latest || '--'}
                <span className="text-sm font-semibold text-blue-400/70 mr-1">ק״ג</span>
              </div>
              {weightStats?.change !== 0 && weightStats?.change !== undefined && (
                <div className={`text-xs font-semibold ${weightStats.change < 0 ? 'text-emerald-400' : 'text-orange-400'}`}>
                  {weightStats.change > 0 ? '+' : ''}{weightStats.change} מהמדידה הקודמת
                </div>
              )}
            </div>

            {/* Streak Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-500/20 via-[var(--card)] to-amber-500/10 border border-orange-500/20 ">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-orange-500/20">
                  <Flame className="w-4 h-4 text-orange-400" />
                </div>
                <span className="text-sm font-semibold text-[var(--foreground)]">רצף</span>
              </div>
              <div className="text-3xl font-black text-orange-400 mb-1">
                {gamification?.current_streak || 0}
                <span className="text-sm font-semibold text-orange-400/70 mr-1">ימים</span>
              </div>
              <div className="text-xs text-[var(--muted-foreground)]">
                {consecutiveGoalDays > 0 ? `${consecutiveGoalDays} ימים ביעד 🔥` : 'התחל היום!'}
              </div>
            </div>

            {/* Level Progress Card */}
            <div className="col-span-2 p-4 rounded-2xl bg-gradient-to-br from-violet-500/20 via-[var(--card)] to-purple-500/10 border border-violet-500/20 ">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shadow-lg shadow-violet-500/30">
                      <span className="text-lg font-black text-white">{levelInfo.level}</span>
                    </div>
                    <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[var(--card)] border border-violet-500/30">
                      <Zap size={10} className="text-violet-400" />
                    </div>
                  </div>
                  <div>
                    <div className="font-bold text-[var(--foreground)]">{levelTitle}</div>
                    <div className="text-xs text-[var(--muted-foreground)]">{gamification?.total_xp || 0} XP</div>
                  </div>
                </div>
                <div className="text-left">
                  <div className="text-xs text-[var(--muted-foreground)]">לרמה הבאה</div>
                  <div className="text-sm font-bold text-violet-400">{levelInfo.nextLevelXP - levelInfo.currentLevelXP} XP</div>
                </div>
              </div>
              <div className="h-2 bg-[var(--muted)]/50 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-violet-500 to-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${levelInfo.progress}%` }}
                />
              </div>
            </div>

            {/* Goal Days Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-[var(--card)] to-sky-500/10 border border-cyan-500/20 ">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-cyan-500/20">
                  <Target className="w-4 h-4 text-cyan-400" />
                </div>
                <span className="text-sm font-semibold text-[var(--foreground)]">ימי יעד</span>
              </div>
              <div className="text-3xl font-black text-cyan-400">
                {walkingStats.goalDaysThisWeek}
                <span className="text-lg font-semibold text-cyan-400/70">/7</span>
              </div>
            </div>

            {/* Monthly Total Card */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-500/20 via-[var(--card)] to-rose-500/10 border border-pink-500/20 ">
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-lg bg-pink-500/20">
                  <Calendar className="w-4 h-4 text-pink-400" />
                </div>
                <span className="text-sm font-semibold text-[var(--foreground)]">החודש</span>
              </div>
              <div className="text-3xl font-black text-pink-400">
                {formatMinutes(walkingStats.monthlyTotal)}
                <span className="text-sm font-semibold text-pink-400/70 mr-1">דק׳</span>
              </div>
            </div>

            {/* Achievements Preview */}
            {userAchievements.length > 0 && (
              <button 
                onClick={() => setShowAchievementsModal(true)}
                className="col-span-2 p-4 rounded-2xl bg-gradient-to-br from-amber-500/20 via-[var(--card)] to-yellow-500/10 border border-amber-500/20 hover:border-amber-500/40 transition-all cursor-pointer text-right"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-amber-500/20">
                      <Trophy className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <div className="font-bold text-[var(--foreground)]">{userAchievements.length} הישגים</div>
                      <div className="text-xs text-[var(--muted-foreground)]">לחץ לצפייה</div>
                    </div>
                  </div>
                  <div className="flex -space-x-2 rtl:space-x-reverse">
                    {userAchievements.slice(0, 5).map((ach, i) => (
                      <div 
                        key={ach.id}
                        className="w-10 h-10 rounded-full bg-amber-500/20 border-2 border-[var(--card)] flex items-center justify-center text-lg"
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
              <div className="col-span-2 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] ">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[var(--primary)]/20 shrink-0">
                    <Lightbulb className="w-4 h-4 text-[var(--primary)]" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-semibold text-sm text-[var(--foreground)] mb-1">{tip.title}</div>
                    <div className="text-xs text-[var(--muted-foreground)] line-clamp-2">{tip.body}</div>
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
          <div className="p-5 rounded-3xl bg-[var(--card)] border border-[var(--border)] ">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-emerald-500/20">
                <Footprints className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h3 className="font-bold text-[var(--foreground)]">הליכה</h3>
                <p className="text-xs text-[var(--muted-foreground)]">7 ימים אחרונים</p>
              </div>
            </div>
            <WalkingChart data={walkingChartData} goal={dailyGoal} />
          </div>

          {/* Weight Chart */}
          {weightChartData.length > 0 && (
            <div className="p-5 rounded-3xl bg-[var(--card)] border border-[var(--border)] ">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2.5 rounded-xl bg-blue-500/20">
                  <Scale className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="font-bold text-[var(--foreground)]">משקל</h3>
                  <p className="text-xs text-[var(--muted-foreground)]">30 ימים אחרונים</p>
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
            <div className="text-center py-16 rounded-3xl bg-[var(--card)] border border-[var(--border)]">
              <div className="text-5xl mb-4">🚀</div>
              <div className="text-[var(--muted-foreground)] font-medium">
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
                      bg-[var(--card)] border border-[var(--border)]
                      hover:bg-[var(--card-hover)] transition-all duration-200
                    `}
                    style={{ animationDelay: `${index * 30}ms` }}
                  >
                    {isDeleting ? (
                      <div className="animate-fadeIn">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500/30 to-pink-500/30 border border-rose-500/30 animate-pulse">
                            <Trash2 className="w-5 h-5 text-rose-400" />
                          </div>
                          <p className="text-sm text-rose-300 font-medium">
                            האם אתה בטוח שברצונך למחוק רשומה זו?
                          </p>
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => setDeleteConfirmId(null)}
                            className="group flex-1 relative py-2.5 px-4 rounded-xl overflow-hidden font-semibold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <div className="absolute inset-0 bg-[var(--muted)]/50 group-hover:bg-[var(--muted)] transition-all duration-300" />
                            <div className="absolute inset-0 border border-white/10 group-hover:border-white/20 rounded-xl transition-all duration-300" />
                            <span className="relative z-10 flex items-center justify-center gap-2 text-[var(--foreground)]">
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
                            isWalking ? 'bg-emerald-500/20' : 'bg-blue-500/20'
                          }`}>
                            {isWalking ? (
                              <Footprints className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <Scale className="w-5 h-5 text-blue-400" />
                            )}
                          </div>
                          <div>
                            <div className={`font-bold text-lg ${
                              isWalking ? 'text-emerald-400' : 'text-blue-400'
                            }`}>
                              {activity.value}
                            </div>
                            <div className="text-xs text-[var(--muted-foreground)]">
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
                              className="relative z-10 text-[var(--muted-foreground)] group-hover:text-violet-300 transition-all duration-300 group-hover:-rotate-12" 
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
                              className="relative z-10 text-[var(--muted-foreground)] group-hover:text-rose-400 transition-all duration-300 group-hover:rotate-12" 
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
