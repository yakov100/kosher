'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getLast7Days, getLast30Days, calculateMovingAverage } from '@/lib/utils'
import { useWalking, useWeight, useSettings, useDailyContent } from '@/hooks/useSupabase'
import { useGamification } from '@/hooks/useGamification'
import { WalkingEntryModal } from '@/components/steps/StepsEntryModal'
import { WeightEntryModal } from '@/components/weight/WeightEntryModal'
import { 
  LevelProgress, 
  TreatRewardCard,
  TreatProgressCard
} from '@/components/gamification'
import { MetricSection } from '@/components/dashboard/MetricSection'
import { ActivityFeed } from '@/components/dashboard/ActivityFeed'
import { WalkingChart } from '@/components/steps/StepsChart'
import { WeightChart } from '@/components/weight/WeightChart'
import { TipCard } from '@/components/dashboard/TipCard'
import { ChallengeCard } from '@/components/dashboard/ChallengeCard'
import { AlertCircle, Trophy, ChevronDown, ChevronUp } from 'lucide-react'
import type { Tables } from '@/types/database'
import { Button } from '@/components/ui/Button'
import { BackButton } from '@/components/ui/BackButton'

export default function StatsPage() {
  const router = useRouter()
  const { records, getTodayRecord, getConsecutiveGoalDays, refetch: refetchRecords } = useWalking()
  const { weights, getLatestWeight, refetch: refetchWeights } = useWeight()
  const { settings, loading: settingsLoading } = useSettings()
  const { tip, challenge, completeChallenge } = useDailyContent()
  const { 
    gamification, 
    levelInfo, 
    userAchievements,
    updateStreak,
    incrementStat,
    addXP,
    loading: gamificationLoading 
  } = useGamification()
  
  const [treatDismissed, setTreatDismissed] = useState(false)
  const [chartsExpanded, setChartsExpanded] = useState(true)
  const [dailyBriefExpanded, setDailyBriefExpanded] = useState(true)
  const [showWalkingModal, setShowWalkingModal] = useState(false)
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [editWalkingRecord, setEditWalkingRecord] = useState<Tables<'steps_records'> | undefined>()
  const [editWeightRecord, setEditWeightRecord] = useState<Tables<'weight_records'> | undefined>()
  
  const todayRecord = getTodayRecord()
  const latestWeight = getLatestWeight()
  const previousWeight = weights[1]
  const dailyGoal = settings?.daily_walking_minutes_goal || 30
  const dailyGoalForTreat = settings?.daily_walking_minutes_goal || 30
  const { consecutiveDays: consecutiveGoalDays, todayGoalMet } = getConsecutiveGoalDays(dailyGoalForTreat)

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
    
    // Calculate weekly trend
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

    return {
      todayMinutes,
      weeklyAvg,
      monthlyTotal,
      goalDaysThisWeek,
      weeklyTrend,
    }
  }, [records, todayRecord, dailyGoal])

  // Calculate weight stats
  const weightStats = useMemo(() => {
    if (weights.length === 0) return null

    const last7Days = new Date()
    last7Days.setDate(last7Days.getDate() - 7)
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)

    const weights7 = weights.filter(w => new Date(w.recorded_at) >= last7Days)
    const weights30 = weights.filter(w => new Date(w.recorded_at) >= last30Days)

    const latest = Number(latestWeight?.weight || 0)
    const previous = Number(previousWeight?.weight || 0)
    const change = previous > 0 ? Number((latest - previous).toFixed(1)) : 0

    const avg30 = weights30.length > 0
      ? Number((weights30.reduce((sum, w) => sum + Number(w.weight), 0) / weights30.length).toFixed(1))
      : 0

    return {
      latest,
      change,
      avg30,
      count: weights.length,
    }
  }, [weights, latestWeight, previousWeight])

  // Chart data
  const walkingChartData = useMemo(() => {
    const days = getLast7Days()
    return days.map(date => {
      const record = records.find(r => r.date === date)
      return {
        date,
        minutes: record?.minutes || 0,
        goal: dailyGoal,
        hasData: !!record,
      }
    })
  }, [records, dailyGoal])

  const weightChartData = useMemo(() => {
    const data = weights
      .map(w => ({
        date: w.recorded_at.split('T')[0],
        value: Number(w.weight),
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
    return calculateMovingAverage(data, 7)
  }, [weights])

  const handleChallengeComplete = async () => {
    try {
      await completeChallenge()
      await incrementStat('challenge')
      await addXP(50)
    } catch (error) {
      console.error('Error completing challenge:', error)
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

  const formatMinutes = (mins: number) => {
    if (mins < 60) return `${mins}`
    const hours = Math.floor(mins / 60)
    const remaining = mins % 60
    return remaining > 0 ? `${hours}:${remaining.toString().padStart(2, '0')}` : `${hours}`
  }

  if (settingsLoading || gamificationLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-[var(--primary)]">טוען...</div>
      </div>
    )
  }

  const daysSinceLastWeight = latestWeight
    ? Math.floor((Date.now() - new Date(latestWeight.recorded_at).getTime()) / (1000 * 60 * 60 * 24))
    : null

  return (
    <div className="pb-20">
      <header className="py-6 flex items-center gap-2">
        <BackButton />
        <h1 className="text-2xl font-bold text-[var(--foreground)]">נתונים נוספים</h1>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Weekly Summary - Walking */}
          <MetricSection
            title="סיכום שבועי"
            metrics={[
              {
                value: walkingStats.weeklyAvg,
                label: 'ממוצע דק׳ יומי',
                size: 'lg',
                trend: walkingStats.weeklyTrend !== 0 ? {
                  value: `${walkingStats.weeklyTrend > 0 ? '+' : ''}${walkingStats.weeklyTrend}%`,
                  isPositive: walkingStats.weeklyTrend > 0
                } : undefined
              },
              {
                value: `${walkingStats.goalDaysThisWeek}/7`,
                label: 'ימי יעד',
                size: 'lg'
              },
              {
                value: formatMinutes(walkingStats.monthlyTotal),
                label: 'סה״כ חודש',
                size: 'lg'
              }
            ]}
            layout="horizontal"
          />

          {/* Weight Details (if exists) */}
          {weightStats && (
            <MetricSection
              title="משקל"
              metrics={[
                {
                  value: weightStats.change !== 0 ? `${weightStats.change > 0 ? '+' : ''}${weightStats.change}` : '0',
                  label: 'שינוי (ק״ג)',
                  size: 'md',
                  trend: {
                    value: weightStats.change < -0.1 ? '↓' : weightStats.change > 0.1 ? '↑' : '→',
                    isPositive: weightStats.change < -0.1
                  }
                },
                {
                  value: weightStats.avg30,
                  label: 'ממוצע חודש (ק״ג)',
                  size: 'md'
                },
                {
                  value: weightStats.count,
                  label: 'סה״כ מדידות',
                  size: 'md'
                }
              ]}
              layout="horizontal"
              className="border-t border-gray-200"
            />
          )}

          {/* Weight reminder */}
          {daysSinceLastWeight !== null && daysSinceLastWeight >= 7 && (
            <section className="py-8 border-t border-gray-200">
              <div className="flex items-center justify-center gap-3 text-[var(--muted-foreground)]">
                <AlertCircle size={20} className="text-[var(--accent)]" />
                <span className="text-sm font-medium">
                  עברו {daysSinceLastWeight} ימים מהשקילה האחרונה
                </span>
              </div>
            </section>
          )}

          {/* Gamification Section */}
          <section className="py-12 border-t border-gray-200">
            <div className="space-y-4">
              <LevelProgress 
                level={levelInfo.level}
                currentXP={levelInfo.currentLevelXP}
                nextLevelXP={levelInfo.nextLevelXP}
                progress={levelInfo.progress}
                totalXP={gamification?.total_xp || 0}
                compact
              />
              
              {/* Treat Progress */}
              {!treatDismissed && consecutiveGoalDays >= 14 && (
                <TreatRewardCard 
                  consecutiveGoalDays={consecutiveGoalDays}
                  targetDays={14}
                  onDismiss={() => setTreatDismissed(true)}
                />
              )}
              {consecutiveGoalDays > 0 && consecutiveGoalDays < 14 && (
                <TreatProgressCard 
                  consecutiveGoalDays={consecutiveGoalDays}
                  targetDays={14}
                  todayGoalMet={todayGoalMet}
                />
              )}
            </div>
          </section>

          {/* Charts Section */}
          <section className="py-10 border-t border-gray-200">
            <button
              onClick={() => setChartsExpanded(!chartsExpanded)}
              className="w-full flex items-center justify-between mb-6"
            >
              <h3 className="text-base font-semibold text-[var(--foreground)]">גרפים</h3>
              {chartsExpanded ? (
                <ChevronUp className="text-[var(--muted-foreground)]" size={18} />
              ) : (
                <ChevronDown className="text-[var(--muted-foreground)]" size={18} />
              )}
            </button>
            {chartsExpanded && (
              <div className="space-y-8">
                <div>
                  <h4 className="text-sm font-medium text-[var(--muted-foreground)] mb-4">הליכה - 7 ימים אחרונים</h4>
                  <WalkingChart data={walkingChartData} goal={dailyGoal} />
                </div>
                {weightChartData.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-[var(--muted-foreground)] mb-4">משקל - 30 ימים אחרונים</h4>
                    <WeightChart data={weightChartData} />
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Sidebar */}
        <div className="space-y-8">
          {/* Daily Brief */}
          {(settings?.show_daily_tip || settings?.show_daily_challenge) && (
            <section className="py-10 border-t border-gray-200 lg:border-t-0 lg:pt-0">
              <button
                onClick={() => setDailyBriefExpanded(!dailyBriefExpanded)}
                className="w-full flex items-center justify-between mb-6"
              >
                <h3 className="text-base font-semibold text-[var(--foreground)]">סיכום יומי</h3>
                {dailyBriefExpanded ? (
                  <ChevronUp className="text-[var(--muted-foreground)]" size={18} />
                ) : (
                  <ChevronDown className="text-[var(--muted-foreground)]" size={18} />
                )}
              </button>
              {dailyBriefExpanded && (
                <div className="space-y-4">
                  {settings?.show_daily_tip && <TipCard tip={tip} />}
                  {settings?.show_daily_challenge && (
                    <ChallengeCard
                      challenge={challenge}
                      onComplete={handleChallengeComplete}
                    />
                  )}
                </div>
              )}
            </section>
          )}

          {/* Achievements Preview */}
          {userAchievements.length > 0 && (
            <section className="py-10 border-t border-gray-200 lg:border-t-0 lg:pt-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Trophy className="text-[var(--accent)]" size={24} />
                  <div>
                    <h3 className="font-semibold text-base text-[var(--foreground)]">{userAchievements.length} הישגים</h3>
                    <p className="text-xs text-[var(--muted-foreground)]">לחץ לצפייה בכל ההישגים</p>
                  </div>
                </div>
                <div className="flex -space-x-2 rtl:space-x-reverse">
                  {userAchievements.slice(0, 4).map((ach, i) => (
                    <div 
                      key={ach.id}
                      className="w-10 h-10 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-xl"
                      style={{ zIndex: 4 - i }}
                    >
                      {ach.icon}
                    </div>
                  ))}
                  {userAchievements.length > 4 && (
                    <div className="w-10 h-10 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center text-xs font-black">
                      +{userAchievements.length - 4}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Activity Feed */}
          <ActivityFeed
            walkingRecords={records}
            weightRecords={weights}
            onEditWalking={(record) => {
              setEditWalkingRecord(record)
              setShowWalkingModal(true)
            }}
            onEditWeight={(record) => {
              setEditWeightRecord(record)
              setShowWeightModal(true)
            }}
          />
        </div>
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
      />
    </div>
  )
}
