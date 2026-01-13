'use client'

import { useState } from 'react'
import { formatHebrewDate } from '@/lib/utils'
import { useWalking, useWeight, useSettings, useDailyContent } from '@/hooks/useSupabase'
import { useGamification } from '@/hooks/useGamification'
import { WalkingCard } from '@/components/dashboard/StepsCard'
import { WeightCard } from '@/components/dashboard/WeightCard'
import { WeeklyStatusCard } from '@/components/dashboard/WeeklyStatusCard'
import { TipCard } from '@/components/dashboard/TipCard'
import { ChallengeCard } from '@/components/dashboard/ChallengeCard'
import { 
  MotivationalBanner, 
  LevelProgress, 
  StreakFlame,
  AchievementPopup,
  Confetti,
  TreatRewardCard,
  TreatProgressCard
} from '@/components/gamification'
import { AlertCircle, Trophy } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const { records, getTodayRecord, getConsecutiveGoalDays, refetch: refetchRecords } = useWalking()
  const { weights, getLatestWeight, refetch: refetchWeights } = useWeight()
  const { settings, loading: settingsLoading } = useSettings()
  const { tip, challenge, completeChallenge } = useDailyContent()
  const { 
    gamification, 
    levelInfo, 
    motivationalMessage, 
    newAchievement, 
    clearNewAchievement,
    userAchievements,
    updateStreak,
    incrementStat,
    addXP,
    loading: gamificationLoading 
  } = useGamification()
  
  const [today] = useState(new Date())
  const [showGoalConfetti, setShowGoalConfetti] = useState(false)
  const [treatDismissed, setTreatDismissed] = useState(false)
  const todayRecord = getTodayRecord()
  const latestWeight = getLatestWeight()
  const previousWeight = weights[1]
  
  // Calculate consecutive goal days for treat progress
  const dailyGoalForTreat = settings?.daily_walking_minutes_goal || 30
  const { consecutiveDays: consecutiveGoalDays, todayGoalMet } = getConsecutiveGoalDays(dailyGoalForTreat)

  // Check if no weight for 7+ days
  const daysSinceLastWeight = latestWeight
    ? Math.floor((Date.now() - new Date(latestWeight.recorded_at).getTime()) / (1000 * 60 * 60 * 24))
    : null

  const handleChallengeComplete = async () => {
    try {
      await completeChallenge()
      await incrementStat('challenge')
      await addXP(50) // Bonus XP for completing challenge
    } catch (error) {
      console.error('Error completing challenge:', error)
    }
  }

  const handleWalkingUpdate = async () => {
    await refetchRecords()
    await updateStreak(new Date().toISOString())
    await incrementStat('steps') // Keep as 'steps' for backward compatibility
    
    // Check if goal reached for confetti
    const updatedTodayRecord = getTodayRecord()
    const dailyGoal = settings?.daily_walking_minutes_goal || 30
    if (updatedTodayRecord && updatedTodayRecord.minutes >= dailyGoal) {
      setShowGoalConfetti(true)
      await addXP(25) // Bonus XP for reaching goal
    }
  }

  const handleWeightUpdate = async () => {
    await refetchWeights()
    await updateStreak(new Date().toISOString())
    await incrementStat('weight')
    await addXP(15) // XP for logging weight
  }

  if (settingsLoading || gamificationLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-emerald-500">טוען...</div>
      </div>
    )
  }

  const dailyGoal = settings?.daily_walking_minutes_goal || 30
  const hasReachedGoal = todayRecord && todayRecord.minutes >= dailyGoal

  return (
    <div className="space-y-5">
      {/* Goal reached confetti */}
      <Confetti active={showGoalConfetti} onComplete={() => setShowGoalConfetti(false)} />
      
      {/* Achievement popup */}
      <AchievementPopup achievement={newAchievement} onClose={clearNewAchievement} />

      {/* Header with date */}
      <header className="text-center mb-4">
        <h1 className="text-2xl font-bold gradient-text mb-1">היום</h1>
        <p className="text-gray-500">{formatHebrewDate(today)}</p>
      </header>

      {/* Motivational Banner */}
      <MotivationalBanner 
        message={motivationalMessage} 
        streak={gamification?.current_streak || 0} 
      />

      {/* Treat Reward Card - Shows when 2 weeks goal achieved */}
      {!treatDismissed && consecutiveGoalDays >= 14 && (
        <TreatRewardCard 
          consecutiveGoalDays={consecutiveGoalDays}
          targetDays={14}
          onDismiss={() => setTreatDismissed(true)}
        />
      )}

      {/* Treat Progress Card - Shows progress toward 2-week treat (only after achieving at least 1 goal) */}
      {consecutiveGoalDays > 0 && consecutiveGoalDays < 14 && (
        <TreatProgressCard 
          consecutiveGoalDays={consecutiveGoalDays}
          targetDays={14}
          todayGoalMet={todayGoalMet}
        />
      )}

      {/* Level Progress & Streak Row */}
      <div className="grid grid-cols-3 gap-3">
        {/* Level Card */}
        <Link href="/insights" className="col-span-2">
          <LevelProgress 
            level={levelInfo.level}
            currentXP={levelInfo.currentLevelXP}
            nextLevelXP={levelInfo.nextLevelXP}
            progress={levelInfo.progress}
            totalXP={gamification?.total_xp || 0}
            compact
          />
        </Link>

        {/* Streak Card */}
        <div className="p-3 rounded-xl bg-white/70 border border-gray-100 flex flex-col items-center justify-center">
          <StreakFlame 
            streak={gamification?.current_streak || 0} 
            size="sm"
          />
        </div>
      </div>

      {/* Achievements Preview */}
      {userAchievements.length > 0 && (
        <Link href="/insights" className="block">
          <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-r from-violet-100/70 to-pink-100/70 border border-violet-200/50">
            <div className="flex items-center gap-3">
              <Trophy className="text-amber-500" size={24} />
              <div>
                <h3 className="font-medium text-gray-700">{userAchievements.length} הישגים</h3>
                <p className="text-xs text-gray-500">לחץ לצפייה בכל ההישגים</p>
              </div>
            </div>
            <div className="flex -space-x-2 rtl:space-x-reverse">
              {userAchievements.slice(0, 4).map((ach, i) => (
                <div 
                  key={ach.id}
                  className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-lg border-2 border-gray-100"
                  style={{ zIndex: 4 - i }}
                >
                  {ach.icon}
                </div>
              ))}
              {userAchievements.length > 4 && (
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-medium text-gray-500 border-2 border-white">
                  +{userAchievements.length - 4}
                </div>
              )}
            </div>
          </div>
        </Link>
      )}

      {/* Weight reminder */}
      {daysSinceLastWeight !== null && daysSinceLastWeight >= 7 && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-100/70 border border-amber-200/60 text-amber-700">
          <AlertCircle size={20} />
          <span className="text-sm">עברו {daysSinceLastWeight} ימים מהשקילה האחרונה</span>
        </div>
      )}

      {/* Walking Card */}
      <WalkingCard
        todayRecord={todayRecord}
        dailyGoal={dailyGoal}
        onUpdate={handleWalkingUpdate}
        goalReached={hasReachedGoal}
      />

      {/* Weight Card */}
      <WeightCard
        latestWeight={latestWeight}
        previousWeight={previousWeight}
        onUpdate={handleWeightUpdate}
      />

      {/* Weekly Status */}
      <WeeklyStatusCard
        walkingRecords={records}
        weights={weights}
        dailyGoal={dailyGoal}
        weeklyGoalDays={settings?.weekly_goal_days || 5}
        currentStreak={gamification?.current_streak || 0}
        longestStreak={gamification?.longest_streak || 0}
      />

      {/* Daily Tip */}
      {settings?.show_daily_tip && <TipCard tip={tip} />}

      {/* Daily Challenge */}
      {settings?.show_daily_challenge && (
        <ChallengeCard
          challenge={challenge}
          onComplete={handleChallengeComplete}
        />
      )}
    </div>
  )
}
