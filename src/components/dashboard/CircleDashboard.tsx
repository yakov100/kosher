'use client'

import { useMemo, useCallback } from 'react'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { Timer, Scale, Trophy, Flame, Play, Pause, RotateCcw, Plus } from 'lucide-react'
import { useTimer } from '@/hooks/useTimer'
import WalkingAnimation from './WalkingAnimation'

interface CircleDashboardProps {
  walking: {
    target: number
    current: number
  }
  weight: {
    current: number
  }
  gamification: {
    level: number
    streak: number
  }
  onWalkingCircleClick: () => void
  onWalkingAddClick: () => void
  onWeightCircleClick: () => void
  onWeightAddClick: () => void
  onTimerStop?: (elapsedMinutes: number) => void
}

export function CircleDashboard({
  walking,
  weight,
  gamification,
  onWalkingCircleClick,
  onWalkingAddClick,
  onWeightCircleClick,
  onWeightAddClick,
  onTimerStop,
}: CircleDashboardProps) {
  const walkingProgress = Math.min((walking.current / walking.target) * 100, 100)
  
  // Calculate remaining minutes to target
  const remainingMinutesToGoal = useMemo(() => Math.max(walking.target - walking.current, 0), [walking.target, walking.current])
  const remainingSecondsToGoal = useMemo(() => remainingMinutesToGoal * 60, [remainingMinutesToGoal])
  
  // Full goal in seconds (for reset functionality)
  const fullGoalSeconds = useMemo(() => walking.target * 60, [walking.target])
  
  // Handler for external changes (manual entries during timer)
  const handleExternalChange = useCallback(() => {
    // Timer was paused automatically due to manual entry
    // We could show a notification here if needed
    console.log('Timer paused due to manual entry')
  }, [])

  // Use global timer hook with localStorage persistence
  const {
    isTimerActive,
    remainingSeconds,
    timerStarted,
    startTimer,
    pauseTimer,
    resetTimer,
  } = useTimer(remainingSecondsToGoal, fullGoalSeconds, onTimerStop, handleExternalChange)

  // Format seconds to MM:SS
  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <div className="flex flex-col items-center justify-center py-10 relative">
      {/* Top: Large Circle (Walking) */}
      <div className="relative z-0">
        {/* Timer Button - Top of Circle */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20">
          <div className="flex items-center gap-1">
            {timerStarted && (
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  resetTimer()
                }}
                className="w-8 h-8 rounded-full bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                title="אפס טיימר"
              >
                <RotateCcw size={14} className="text-emerald-600" />
              </button>
            )}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                if (isTimerActive) {
                  pauseTimer()
                } else {
                  startTimer()
                }
              }}
              disabled={remainingMinutesToGoal === 0}
              className={`
                h-10 rounded-full shadow-lg flex items-center justify-center gap-2 transition-all hover:scale-110 active:scale-95
                ${timerStarted 
                  ? 'px-3 min-w-[90px]' 
                  : 'w-10'
                }
                ${isTimerActive 
                  ? 'bg-orange-500 hover:bg-orange-600 text-white' 
                  : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                }
                ${remainingMinutesToGoal === 0 ? 'opacity-50 cursor-not-allowed' : ''}
              `}
              title={isTimerActive ? 'עצור' : 'התחל הליכה'}
            >
              {isTimerActive ? (
                <>
                  <Pause size={16} />
                  <span className="font-mono font-bold text-sm">{formatTime(remainingSeconds)}</span>
                </>
              ) : timerStarted ? (
                <>
                  <Play size={16} />
                  <span className="font-mono font-bold text-sm">{formatTime(remainingSeconds)}</span>
                </>
              ) : (
                <Play size={18} />
              )}
            </button>
          </div>
        </div>

        {/* Add button on right side */}
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            onWalkingAddClick()
          }}
          className="
            absolute -right-4 top-1/2 -translate-y-1/2 z-20
            w-10 h-10 rounded-full
            bg-gradient-to-br from-emerald-400 to-teal-400
            shadow-xl shadow-emerald-400/40
            flex items-center justify-center
            hover:scale-115 active:scale-95
            hover:from-emerald-300 hover:to-teal-300
            transition-all duration-200
            border-2 border-white/40
          "
          title="הוסף הליכה"
        >
          <Plus size={20} className="text-white drop-shadow-sm" />
        </button>

        <div
          className="cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
          onClick={onWalkingCircleClick}
        >
          <div className="absolute inset-0 bg-[var(--primary)]/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <ProgressRing
            progress={walkingProgress}
            size={220}
            strokeWidth={12}
            bgClassName={isTimerActive ? '' : 'bg-gradient-to-br from-emerald-50 to-teal-50'}
          >
            <div className="relative flex flex-col items-center justify-center w-full h-full">
              {/* Walking animation - shown when timer is active (fills the circle) */}
              {isTimerActive && (
                <div className="absolute inset-0 flex items-center justify-center z-0">
                  <WalkingAnimation isActive={isTimerActive} size={196} />
                </div>
              )}

              {/* Timer content - only shown when timer is not active */}
              {!isTimerActive && (
                <div className="flex flex-col items-center text-center">
                  <Timer className="w-8 h-8 text-emerald-600 mb-2" />
                  {timerStarted ? (
                    <>
                      <div className="text-4xl font-bold text-slate-800 font-mono">
                        {formatTime(remainingSeconds)}
                      </div>
                      <div className="text-sm font-medium text-slate-500">
                        זמן שנותר
                      </div>
                      <div className="text-xs text-emerald-600 mt-1 font-semibold">
                        מושהה
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="text-4xl font-bold text-slate-800">
                        {walking.target}
                      </div>
                      <div className="text-sm font-medium text-slate-500">
                        דקות יעד
                      </div>
                      <div className="text-xs text-emerald-600 mt-1 font-semibold">
                        {walking.current > 0 ? `הלכת ${walking.current}` : 'טרם התחלת'}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          </ProgressRing>
        </div>
      </div>

      {/* Bottom: Medium (Weight) and Small (Stats) */}
      <div className="flex items-center justify-center gap-4 -mt-16 relative z-10">
        {/* Small Circle (Stats/Level) */}
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-purple-50 to-fuchsia-50 border border-purple-100 shadow-xl flex flex-col items-center justify-center text-slate-800 relative z-0 mb-4 overflow-hidden group">
          <div className="absolute inset-0 bg-white/20 backdrop-blur-xl opacity-50" />
          
          <div className="relative z-10 flex flex-col items-center w-full">
            <div className="flex items-center gap-1.5 mb-1.5">
              <div className="p-1 rounded-full bg-purple-100 text-purple-600">
                <Trophy size={14} />
              </div>
              <span className="text-xl font-black">{gamification.level}</span>
            </div>
            
            <div className="w-12 h-[1px] bg-purple-200 mb-1.5" />
            
            <div className="flex items-center gap-1.5">
              <div className="p-1 rounded-full bg-orange-100 text-orange-600">
                <Flame size={14} />
              </div>
              <span className="text-xl font-black">{gamification.streak}</span>
            </div>
          </div>
        </div>

        {/* Medium Circle (Weight) */}
        <div className="relative">
          {/* Add button at bottom */}
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onWeightAddClick()
            }}
            className="
              absolute -bottom-4 left-1/2 -translate-x-1/2 z-20
              w-9 h-9 rounded-full
              bg-gradient-to-br from-blue-400 to-cyan-400
              shadow-xl shadow-blue-400/40
              flex items-center justify-center
              hover:scale-115 active:scale-95
              hover:from-blue-300 hover:to-cyan-300
              transition-all duration-200
              border-2 border-white/40
            "
            title="הוסף משקל"
          >
            <Plus size={18} className="text-white drop-shadow-sm" />
          </button>

          <button
            onClick={onWeightCircleClick}
            className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-50 to-cyan-50 border-4 border-[var(--background)] shadow-2xl flex flex-col items-center justify-center text-slate-800 transition-transform hover:scale-105 active:scale-95 relative z-10 overflow-hidden group"
          >
            <div className="absolute inset-0 bg-white/20 backdrop-blur-xl opacity-50" />

            <div className="relative z-10 flex flex-col items-center">
              <div className="p-2 rounded-full bg-blue-100 text-blue-600 mb-1">
                <Scale className="w-6 h-6" />
              </div>
              <div className="text-3xl font-black tracking-tight">
                {weight.current > 0 ? weight.current : '--'}
              </div>
              <div className="text-xs font-medium text-slate-500">
                ק״ג אחרון
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
