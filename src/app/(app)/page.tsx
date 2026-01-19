'use client'

import { useState } from 'react'
import { formatHebrewDate, getToday } from '@/lib/utils'
import { useWalking, useWeight, useSettings, useDailyContent } from '@/hooks/useSupabase'
import { useGamification } from '@/hooks/useGamification'
import { WalkingEntryModal } from '@/components/steps/StepsEntryModal'
import { WeightEntryModal } from '@/components/weight/WeightEntryModal'
import { CircleDashboard } from '@/components/dashboard/CircleDashboard'
import { HistoryModal } from '@/components/dashboard/HistoryModal'
import { GamificationModal } from '@/components/dashboard/GamificationModal'
import { ChallengeCard } from '@/components/dashboard/ChallengeCard'
import { AchievementPopup, Confetti } from '@/components/gamification'
import { Plus } from 'lucide-react'

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

export default function DashboardPage() {
  const { records: walkingRecords, getTodayRecord, refetch: refetchRecords, addOrUpdateRecord, deleteRecord: deleteWalkingRecord } = useWalking()
  const { weights: weightRecords, getLatestWeight, refetch: refetchWeights, deleteWeight: deleteWeightRecord } = useWeight()
  const { settings, loading: settingsLoading } = useSettings()
  const { 
    gamification, 
    achievements,
    userAchievements,
    levelInfo, 
    newAchievement, 
    clearNewAchievement,
    updateStreak,
    incrementStat,
    addXP,
    loading: gamificationLoading 
  } = useGamification()
  const { challenge, challenges, challengeStreak, completeChallenge, replaceChallenge, addNewChallenge, removeChallenge, loading: challengeLoading } = useDailyContent()
  
  const [today] = useState(new Date())
  const [showGoalConfetti, setShowGoalConfetti] = useState(false)
  const [showWalkingModal, setShowWalkingModal] = useState(false)
  const [showWeightModal, setShowWeightModal] = useState(false)
  const [showWalkingHistory, setShowWalkingHistory] = useState(false)
  const [showWeightHistory, setShowWeightHistory] = useState(false)
  const [showGamificationModal, setShowGamificationModal] = useState(false)
  const [editingWalking, setEditingWalking] = useState<typeof walkingRecords[0] | null>(null)
  const [editingWeight, setEditingWeight] = useState<typeof weightRecords[0] | null>(null)
  const [isAddingChallenge, setIsAddingChallenge] = useState(false)
  
  const todayRecord = getTodayRecord()
  const latestWeight = getLatestWeight()
  const dailyGoal = settings?.daily_walking_minutes_goal || 30

  const handleWalkingUpdate = async (recordDate?: string) => {
    await refetchRecords()
    // Use the provided date or fall back to today
    await updateStreak(recordDate || getToday())
    await incrementStat('steps')
    
    const updatedTodayRecord = getTodayRecord()
    if (updatedTodayRecord && updatedTodayRecord.minutes >= dailyGoal) {
      setShowGoalConfetti(true)
      await addXP(25)
    }
  }

  const handleTimerStop = async (elapsedMinutes: number) => {
    try {
      const today = getToday()
      // Refetch to get the latest record for today (in case it changed)
      await refetchRecords()
      const latestTodayRecord = getTodayRecord()
      const currentMinutes = latestTodayRecord?.minutes || 0
      const newTotalMinutes = currentMinutes + elapsedMinutes

      await addOrUpdateRecord(today, newTotalMinutes)
      await handleWalkingUpdate()
    } catch (error: unknown) {
      // Properly log Supabase errors which don't serialize with console.error
      const err = error as { message?: string; code?: string; details?: string }
      console.error('Error saving timer data:', err?.message || err?.code || JSON.stringify(error))
    }
  }

  const handleWeightUpdate = async (recordDate?: string) => {
    await refetchWeights()
    // Use the provided date or fall back to today
    await updateStreak(recordDate || new Date().toISOString())
    await incrementStat('weight')
    await addXP(15)
  }

  const handleChallengeComplete = async () => {
    try {
      if (challenge?.historyId) {
        await completeChallenge(challenge.historyId)
        await incrementStat('challenge')
        await addXP(50)
        setShowGoalConfetti(true)
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
        <h1 className="text-2xl font-semibold text-white mb-2">{formatHebrewDate(today)}</h1>
        <p className="text-sm font-medium text-white/80">היום</p>
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
          onWalkingCircleClick={() => setShowWalkingHistory(true)}
          onWalkingAddClick={() => setShowWalkingModal(true)}
          onWeightCircleClick={() => setShowWeightHistory(true)}
          onWeightAddClick={() => setShowWeightModal(true)}
          onGamificationCircleClick={() => setShowGamificationModal(true)}
          onTimerStop={handleTimerStop}
        />
      </div>

      {/* Daily Challenge - Compact */}
      {settings?.show_daily_challenge && (
        <div className="mt-4">
          {/* Challenges List */}
          <div className="px-4 space-y-3 flex flex-col items-center">
            {challenges.length > 0 && challenges.map((ch: ChallengeWithHistory) => (
              <ChallengeCard
              key={ch.historyId}
              challenge={ch}
              onComplete={() => {
                if (ch.historyId) {
                  completeChallenge(ch.historyId).then(() => {
                    incrementStat('challenge')
                    addXP(50)
                    setShowGoalConfetti(true)
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
          </div>

          {/* Add Challenge Button - Centered below challenges */}
          <div className="px-4 flex justify-center pt-1">
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

      {/* Modals */}
      <WalkingEntryModal
        isOpen={showWalkingModal}
        onClose={() => {
          setShowWalkingModal(false)
          setEditingWalking(null)
        }}
        onSuccess={(recordDate) => {
          setShowWalkingModal(false)
          setEditingWalking(null)
          handleWalkingUpdate(recordDate)
        }}
        existingRecord={editingWalking ?? undefined}
      />
      <WeightEntryModal
        isOpen={showWeightModal}
        onClose={() => {
          setShowWeightModal(false)
          setEditingWeight(null)
        }}
        onSuccess={(recordDate) => {
          setShowWeightModal(false)
          setEditingWeight(null)
          handleWeightUpdate(recordDate)
        }}
        existingRecord={editingWeight ?? undefined}
      />

      {/* History Modals */}
      <HistoryModal
        isOpen={showWalkingHistory}
        onClose={() => setShowWalkingHistory(false)}
        type="walking"
        walkingRecords={walkingRecords}
        dailyGoal={dailyGoal}
        onEditWalking={(record) => {
          setEditingWalking(record)
          setShowWalkingHistory(false)
          setShowWalkingModal(true)
        }}
        onDeleteWalking={async (id) => {
          await deleteWalkingRecord(id)
          await refetchRecords()
          // Update streak after deletion to recalculate
          await updateStreak(getToday())
        }}
        onAddNew={() => {
          setShowWalkingHistory(false)
          setShowWalkingModal(true)
        }}
      />
      <HistoryModal
        isOpen={showWeightHistory}
        onClose={() => setShowWeightHistory(false)}
        type="weight"
        weightRecords={weightRecords}
        dailyGoal={dailyGoal}
        onEditWeight={(record) => {
          setEditingWeight(record)
          setShowWeightHistory(false)
          setShowWeightModal(true)
        }}
        onDeleteWeight={async (id) => {
          await deleteWeightRecord(id)
          await refetchWeights()
        }}
        onAddNew={() => {
          setShowWeightHistory(false)
          setShowWeightModal(true)
        }}
      />

      {/* Gamification Modal */}
      {gamification && (
        <GamificationModal
          isOpen={showGamificationModal}
          onClose={() => setShowGamificationModal(false)}
          gamification={gamification}
          achievements={achievements}
          userAchievements={userAchievements}
        />
      )}
    </div>
  )
}
