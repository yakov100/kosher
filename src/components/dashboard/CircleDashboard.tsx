'use client'

import { useState, useEffect, useCallback } from 'react'
import { ProgressRing } from '@/components/ui/ProgressRing'
import { Timer, Scale, Trophy, Flame, Play, Pause, RotateCcw } from 'lucide-react'

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
  onWalkingClick: () => void
  onWeightClick: () => void
}

export function CircleDashboard({
  walking,
  weight,
  gamification,
  onWalkingClick,
  onWeightClick,
}: CircleDashboardProps) {
  const walkingProgress = Math.min((walking.current / walking.target) * 100, 100)
  
  // Timer state
  const [isTimerActive, setIsTimerActive] = useState(false)
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [timerStarted, setTimerStarted] = useState(false)

  // Calculate remaining minutes to target
  const remainingMinutesToGoal = Math.max(walking.target - walking.current, 0)

  // Initialize timer with remaining time
  const startTimer = useCallback(() => {
    if (!timerStarted) {
      setRemainingSeconds(remainingMinutesToGoal * 60)
      setTimerStarted(true)
    }
    setIsTimerActive(true)
  }, [remainingMinutesToGoal, timerStarted])

  const pauseTimer = () => {
    setIsTimerActive(false)
  }

  const resetTimer = () => {
    setIsTimerActive(false)
    setTimerStarted(false)
    setRemainingSeconds(remainingMinutesToGoal * 60)
  }

  // Timer countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (isTimerActive && remainingSeconds > 0) {
      interval = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            setIsTimerActive(false)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [isTimerActive, remainingSeconds])

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
                onClick={(e) => {
                  e.stopPropagation()
                  resetTimer()
                }}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 border border-slate-200 shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                title="אפס טיימר"
              >
                <RotateCcw size={14} className="text-slate-600" />
              </button>
            )}
            <button
              onClick={(e) => {
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

        <div 
          className="cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
          onClick={onWalkingClick}
        >
          <div className="absolute inset-0 bg-[var(--primary)]/20 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          <ProgressRing 
            progress={walkingProgress} 
            size={220} 
            strokeWidth={12}
            bgClassName="bg-gradient-to-br from-emerald-50 to-teal-50"
          >
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
                    {isTimerActive ? 'הולך...' : 'מושהה'}
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
        <button
          onClick={onWeightClick}
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
  )
}
