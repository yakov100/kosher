'use client'

import { useMemo, useState } from 'react'
import {
  Timer,
  Scale,
  Target,
  Flame,
  Calendar,
  TrendingUp,
  TrendingDown,
  Trophy,
  Award,
  Lock,
} from 'lucide-react'
import { useWalking, useWeight, useSettings, useDailyContent } from '@/hooks/useSupabase'
import { useGamification } from '@/hooks/useGamification'
import { Card } from '@/components/ui/Card'
import { LevelProgress, AchievementCard, StreakFlame } from '@/components/gamification'
import {
  calculateStreak,
  getLast7Days,
  getLast30Days,
  calculateMovingAverage,
} from '@/lib/utils'

type TabType = 'stats' | 'achievements'

export default function InsightsPage() {
  const { records } = useWalking()
  const { weights } = useWeight()
  const { settings } = useSettings()
  const { challenge } = useDailyContent()
  const { 
    gamification, 
    levelInfo, 
    achievements, 
    userAchievements,
    loading: gamificationLoading 
  } = useGamification()
  
  const [activeTab, setActiveTab] = useState<TabType>('stats')
  const dailyGoal = settings?.daily_walking_minutes_goal || 30

  const walkingInsights = useMemo(() => {
    const last7 = getLast7Days()
    const last30 = getLast30Days()

    const recordsLast7 = records.filter(r => last7.includes(r.date))
    const recordsLast30 = records.filter(r => last30.includes(r.date))

    const logging7 = Math.round((recordsLast7.length / 7) * 100)
    const logging30 = Math.round((recordsLast30.length / 30) * 100)

    const goalDays7 = recordsLast7.filter(r => r.minutes >= dailyGoal).length
    const goalDays30 = recordsLast30.filter(r => r.minutes >= dailyGoal).length

    const avg7 = recordsLast7.length > 0
      ? Math.round(recordsLast7.reduce((sum, r) => sum + r.minutes, 0) / recordsLast7.length)
      : 0
    const avg30 = recordsLast30.length > 0
      ? Math.round(recordsLast30.reduce((sum, r) => sum + r.minutes, 0) / recordsLast30.length)
      : 0

    const allDates = records.map(r => r.date)
    const streak = calculateStreak(allDates)

    return { logging7, logging30, goalDays7, goalDays30, avg7, avg30, streak }
  }, [records, dailyGoal])

  const weightInsights = useMemo(() => {
    if (weights.length === 0) return null

    const last7Days = new Date()
    last7Days.setDate(last7Days.getDate() - 7)
    const last30Days = new Date()
    last30Days.setDate(last30Days.getDate() - 30)

    const weightsLast7 = weights.filter(w => new Date(w.recorded_at) >= last7Days)
    const weightsLast30 = weights.filter(w => new Date(w.recorded_at) >= last30Days)

    const data = weightsLast30
      .map(w => ({ date: w.recorded_at.split('T')[0], value: Number(w.weight) }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const withMovingAvg = calculateMovingAverage(data, 7)
    const validMovingAvgs = withMovingAvg.filter(d => d.movingAvg !== null)

    let trend = 0
    if (validMovingAvgs.length >= 2) {
      const first = validMovingAvgs[0].movingAvg!
      const last = validMovingAvgs[validMovingAvgs.length - 1].movingAvg!
      trend = Number((last - first).toFixed(1))
    }

    return { count7: weightsLast7.length, count30: weightsLast30.length, trend, latest: Number(weights[0]?.weight || 0) }
  }, [weights])

  const challengeInsights = useMemo(() => {
    return {
      completedWeek: challenge?.completed ? 1 : 0,
      completedMonth: challenge?.completed ? 1 : 0,
    }
  }, [challenge])

  // Group achievements by category
  const achievementsByCategory = useMemo(() => {
    const categories = ['streak', 'steps', 'weight', 'challenge', 'milestone']
    const categoryLabels: Record<string, string> = {
      streak: '🔥 רצף',
      steps: '🚶 הליכה',
      weight: '⚖️ משקל',
      challenge: '🎯 אתגרים',
      milestone: '🌟 אבני דרך'
    }

    return categories.map(category => ({
      category,
      label: categoryLabels[category],
      achievements: achievements.filter(a => a.category === category)
    }))
  }, [achievements])

  const unlockedIds = userAchievements.map(a => a.id)

  if (gamificationLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-emerald-500">טוען...</div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <header>
        <h1 className="text-2xl font-bold text-gray-700">תובנות</h1>
        <p className="text-gray-500 text-sm">סיכום הביצועים וההישגים שלך</p>
      </header>

      {/* Level Progress */}
      <LevelProgress 
        level={levelInfo.level}
        currentXP={levelInfo.currentLevelXP}
        nextLevelXP={levelInfo.nextLevelXP}
        progress={levelInfo.progress}
        totalXP={gamification?.total_xp || 0}
      />

      {/* Streak & Stats Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-gradient-to-br from-orange-100/80 to-rose-100/80 border border-orange-200/50 flex flex-col items-center justify-center">
          <StreakFlame streak={gamification?.current_streak || 0} size="md" />
        </div>
        <div className="p-4 rounded-xl bg-white/70 border border-gray-100 text-center">
          <div className="text-3xl font-bold text-emerald-600">{gamification?.total_walking_minutes_logged || 0}</div>
          <div className="text-xs text-gray-500">ימי הליכה</div>
        </div>
        <div className="p-4 rounded-xl bg-white/70 border border-gray-100 text-center">
          <div className="text-3xl font-bold text-violet-600">{gamification?.total_challenges_completed || 0}</div>
          <div className="text-xs text-gray-500">אתגרים הושלמו</div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 rounded-xl bg-gray-100/70">
        <button
          onClick={() => setActiveTab('stats')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'stats'
              ? 'bg-emerald-500 text-white'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <TrendingUp size={18} />
          סטטיסטיקות
        </button>
        <button
          onClick={() => setActiveTab('achievements')}
          className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-medium transition-all ${
            activeTab === 'achievements'
              ? 'bg-emerald-500 text-white'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          <Award size={18} />
          הישגים ({userAchievements.length}/{achievements.length})
        </button>
      </div>

      {/* Stats Tab */}
      {activeTab === 'stats' && (
        <>
          {/* Walking Insights */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                <Timer size={20} />
              </div>
              <h2 className="font-semibold text-lg text-gray-700">עקביות הליכה</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-100/60">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                  <Calendar size={16} />
                  7 ימים אחרונים
                </div>
                <div className="text-2xl font-bold text-gray-700">{walkingInsights.logging7}%</div>
                <div className="text-xs text-gray-400">ימים עם הזנה</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-100/60">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-2">
                  <Calendar size={16} />
                  30 ימים אחרונים
                </div>
                <div className="text-2xl font-bold text-gray-700">{walkingInsights.logging30}%</div>
                <div className="text-xs text-gray-400">ימים עם הזנה</div>
              </div>
            </div>
          </Card>

          {/* Goal Achievement */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
                <Target size={20} />
              </div>
              <h2 className="font-semibold text-lg text-gray-700">ימי יעד</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-100/60">
                <div className="text-2xl font-bold text-gray-700">
                  {walkingInsights.goalDays7}
                  <span className="text-sm text-gray-400 font-normal">/7</span>
                </div>
                <div className="text-xs text-gray-400">ימים השבוע</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-100/60">
                <div className="text-2xl font-bold text-gray-700">
                  {walkingInsights.goalDays30}
                  <span className="text-sm text-gray-400 font-normal">/30</span>
                </div>
                <div className="text-xs text-gray-400">ימים בחודש</div>
              </div>
            </div>

            <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-orange-100/70 to-amber-100/70 border border-orange-200/50">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="text-orange-500" size={20} />
                <span className="text-gray-600">רצף הזנות</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="text-3xl font-bold text-orange-500">
                  {gamification?.current_streak || 0} <span className="text-lg text-gray-500">ימים</span>
                </div>
                <div className="text-sm text-gray-500">
                  שיא: {gamification?.longest_streak || 0} ימים 🏆
                </div>
              </div>
            </div>
          </Card>

          {/* Average Walking Minutes */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-600">
                <TrendingUp size={20} />
              </div>
              <h2 className="font-semibold text-lg text-gray-700">ממוצע דקות הליכה</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-100/60">
                <div className="text-2xl font-bold text-gray-700">{walkingInsights.avg7} דק׳</div>
                <div className="text-xs text-gray-400">ממוצע 7 ימים</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-100/60">
                <div className="text-2xl font-bold text-gray-700">{walkingInsights.avg30} דק׳</div>
                <div className="text-xs text-gray-400">ממוצע 30 ימים</div>
              </div>
            </div>
          </Card>

          {/* Weight Insights */}
          {weightInsights && (
            <Card>
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-xl bg-violet-100 text-violet-600">
                  <Scale size={20} />
                </div>
                <h2 className="font-semibold text-lg text-gray-700">עקביות שקילה</h2>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="p-4 rounded-xl bg-gray-100/60">
                  <div className="text-2xl font-bold text-gray-700">{weightInsights.count7}</div>
                  <div className="text-xs text-gray-400">שקילות בשבוע</div>
                </div>
                <div className="p-4 rounded-xl bg-gray-100/60">
                  <div className="text-2xl font-bold text-gray-700">{weightInsights.count30}</div>
                  <div className="text-xs text-gray-400">שקילות בחודש</div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-gray-100/60">
                <div className="text-gray-500 text-sm mb-2">מגמת ממוצע נע (30 ימים)</div>
                <div className={`flex items-center gap-2 text-2xl font-bold ${
                  weightInsights.trend < -0.1 ? 'text-emerald-500' :
                  weightInsights.trend > 0.1 ? 'text-orange-500' :
                  'text-gray-500'
                }`}>
                  {weightInsights.trend < -0.1 && <TrendingDown size={24} />}
                  {weightInsights.trend > 0.1 && <TrendingUp size={24} />}
                  {Math.abs(weightInsights.trend)} ק״ג
                </div>
              </div>
            </Card>
          )}

          {/* Challenges */}
          <Card>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-600">
                <Trophy size={20} />
              </div>
              <h2 className="font-semibold text-lg text-gray-700">אתגרים</h2>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-gray-100/60">
                <div className="text-2xl font-bold text-gray-700">{challengeInsights.completedWeek}</div>
                <div className="text-xs text-gray-400">השבוע</div>
              </div>
              <div className="p-4 rounded-xl bg-gray-100/60">
                <div className="text-2xl font-bold text-gray-700">{gamification?.total_challenges_completed || 0}</div>
                <div className="text-xs text-gray-400">סה״כ</div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* Achievements Tab */}
      {activeTab === 'achievements' && (
        <>
          {/* Achievement Progress Bar */}
          <div className="p-4 rounded-xl bg-white/70 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-500">התקדמות הישגים</span>
              <span className="text-sm font-bold text-emerald-600">
                {userAchievements.length} / {achievements.length}
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-emerald-400 to-violet-400 transition-all duration-500"
                style={{ width: `${(userAchievements.length / achievements.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Achievements by Category */}
          {achievementsByCategory.map(({ category, label, achievements: categoryAchievements }) => (
            <div key={category} className="space-y-3">
              <h3 className="font-semibold text-gray-600 flex items-center gap-2">
                {label}
                <span className="text-xs text-gray-400">
                  ({categoryAchievements.filter(a => unlockedIds.includes(a.id)).length}/{categoryAchievements.length})
                </span>
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {categoryAchievements.map(achievement => {
                  const isUnlocked = unlockedIds.includes(achievement.id)
                  const userAch = userAchievements.find(a => a.id === achievement.id)
                  return (
                    <AchievementCard
                      key={achievement.id}
                      achievement={achievement}
                      unlocked={isUnlocked}
                      unlockedAt={userAch?.unlocked_at}
                      compact
                    />
                  )
                })}
              </div>
            </div>
          ))}

          {/* Locked achievements hint */}
          {userAchievements.length < achievements.length && (
            <div className="text-center p-4 rounded-xl bg-gray-100/50 border border-dashed border-gray-300">
              <Lock className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">
                עוד {achievements.length - userAchievements.length} הישגים ממתינים לך!
              </p>
              <p className="text-xs text-gray-400 mt-1">
                המשך לרשום דקות הליכה, משקל ולהשלים אתגרים
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
