'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { formatHebrewDate } from '@/lib/utils'
import { useWalking, useWeight, useSettings, useDailyContent } from '@/hooks/useSupabase'
import { useGamification } from '@/hooks/useGamification'
import { WalkingEntryModal } from '@/components/steps/StepsEntryModal'
import { WeightEntryModal } from '@/components/weight/WeightEntryModal'
import { CircleDashboard } from '@/components/dashboard/CircleDashboard'
import { ChallengeCard } from '@/components/dashboard/ChallengeCard'
import { AchievementPopup, Confetti } from '@/components/gamification'
import { Button } from '@/components/ui/Button'
import { BarChart2 } from 'lucide-react'

export default function DashboardPage() {
  const router = useRouter()
  const { getTodayRecord, refetch: refetchRecords } = useWalking()
  const { getLatestWeight, refetch: refetchWeights } = useWeight()
  const { settings, loading: settingsLoading } = useSettings()
  const { 
    gamification, 
    levelInfo, 
    newAchievement, 
    clearNewAchievement,
    updateStreak,
    incrementStat,
    addXP,
    loading: gamificationLoading 
  } = useGamification()
  const { challenge, challengeStreak, completeChallenge, loading: challengeLoading } = useDailyContent()
  
  const [today] = useState(new Date())
  const [showGoalConfetti, setShowGoalConfetti] = useState(false)
  const [showWalkingModal, setShowWalkingModal] = useState(false)
  const [showWeightModal, setShowWeightModal] = useState(false)
  
  const todayRecord = getTodayRecord()
  const latestWeight = getLatestWeight()
  const dailyGoal = settings?.daily_walking_minutes_goal || 30

  const handleWalkingUpdate = async () => {
    await refetchRecords()
    await updateStreak(new Date().toISOString())
    await incrementStat('steps')
    
    const updatedTodayRecord = getTodayRecord()
    if (updatedTodayRecord && updatedTodayRecord.minutes >= dailyGoal) {
      setShowGoalConfetti(true)
      await addXP(25)
    }
  }

  const handleWeightUpdate = async () => {
    await refetchWeights()
    await updateStreak(new Date().toISOString())
    await incrementStat('weight')
    await addXP(15)
  }

  const handleChallengeComplete = async () => {
    try {
      await completeChallenge()
      await incrementStat('challenge')
      await addXP(50)
      setShowGoalConfetti(true)
    } catch (error) {
      console.error('Error completing challenge:', error)
    }
  }

  if (settingsLoading || gamificationLoading || challengeLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse text-[var(--primary)]">טוען...</div>
      </div>
    )
  }

  return (
    <div className="pb-20 min-h-[80vh] flex flex-col">
      {/* Confetti & Popups */}
      <Confetti active={showGoalConfetti} onComplete={() => setShowGoalConfetti(false)} />
      <AchievementPopup achievement={newAchievement} onClose={clearNewAchievement} />

      {/* Date Header */}
      <header className="py-8 text-center">
        <h1 className="text-2xl font-semibold text-[var(--foreground)] mb-2">{formatHebrewDate(today)}</h1>
        <p className="text-sm font-medium text-[var(--muted-foreground)]">היום</p>
      </header>

      {/* Main Circle Dashboard */}
      <div className="flex-1 flex flex-col items-center justify-center">
        <CircleDashboard 
          walking={{
            target: dailyGoal,
            current: todayRecord?.minutes || 0
          }}
          weight={{
            current: Number(latestWeight?.weight || 0)
          }}
          gamification={{
            level: levelInfo.level,
            streak: gamification?.current_streak || 0
          }}
          onWalkingClick={() => setShowWalkingModal(true)}
          onWeightClick={() => setShowWeightModal(true)}
        />
      </div>

      {/* Navigation to detailed stats */}
      <div className="mt-8 px-8">
        <Button 
          variant="ghost" 
          fullWidth 
          onClick={() => router.push('/stats')}
          className="flex items-center justify-center gap-2 py-6 text-lg"
        >
          <BarChart2 size={24} />
          נתונים נוספים
        </Button>
      </div>

      {/* Daily Challenge - Compact */}
      {settings?.show_daily_challenge && challenge && (
        <div className="mt-4 px-4">
          <ChallengeCard
            challenge={challenge}
            onComplete={handleChallengeComplete}
            challengeStreak={challengeStreak}
            xpReward={50}
            compact
          />
        </div>
      )}

      {/* Modals */}
      <WalkingEntryModal
        isOpen={showWalkingModal}
        onClose={() => setShowWalkingModal(false)}
        onSuccess={() => {
          setShowWalkingModal(false)
          handleWalkingUpdate()
        }}
      />
      <WeightEntryModal
        isOpen={showWeightModal}
        onClose={() => setShowWeightModal(false)}
        onSuccess={() => {
          setShowWeightModal(false)
          handleWeightUpdate()
        }}
      />
    </div>
  )
}
