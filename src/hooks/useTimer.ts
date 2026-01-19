'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { format } from 'date-fns'

const STORAGE_KEY = 'walking_timer_state'

interface TimerState {
  isActive: boolean
  remainingSeconds: number
  startTime: number | null
  timerStarted: boolean
}

export function useTimer(
  goalSeconds: number,
  fullGoalSeconds: number,
  onTimerComplete?: (elapsedMinutes: number) => void,
  onExternalChange?: () => void
) {
  const [state, setState] = useState<TimerState>({
    isActive: false,
    remainingSeconds: fullGoalSeconds,
    startTime: null,
    timerStarted: false,
  })

  const onTimerCompleteRef = useRef(onTimerComplete)
  onTimerCompleteRef.current = onTimerComplete

  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Load state from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return

    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed: TimerState = JSON.parse(saved)
        
        // Check if it's from today
        const today = format(new Date(), 'yyyy-MM-dd')
        const savedDate = (JSON.parse(saved) as any).savedDate
        
        if (savedDate !== today) {
          localStorage.removeItem(STORAGE_KEY)
          return
        }

        // If timer was active, calculate current remaining time
        if (parsed.isActive && parsed.startTime) {
          const elapsed = Math.floor((Date.now() - parsed.startTime) / 1000)
          const newRemaining = Math.max(0, parsed.remainingSeconds - elapsed)
          
          setState({
            ...parsed,
            remainingSeconds: newRemaining,
            isActive: newRemaining > 0,
          })
        } else {
          setState(parsed)
        }
      }
    } catch (error) {
      console.error('Error loading timer:', error)
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  // Save state to localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (!state.timerStarted) return

    try {
      const today = format(new Date(), 'yyyy-MM-dd')
      const toSave = {
        ...state,
        savedDate: today,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toSave))
    } catch (error) {
      console.error('Error saving timer:', error)
    }
  }, [state])

  // Update remaining seconds when goal changes (only if timer never started)
  useEffect(() => {
    if (!state.timerStarted) {
      setState(prev => ({
        ...prev,
        remainingSeconds: fullGoalSeconds,
      }))
    }
  }, [fullGoalSeconds, state.timerStarted])

  // Timer tick
  useEffect(() => {
    if (!state.isActive) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
      return
    }

    intervalRef.current = setInterval(() => {
      setState(prev => {
        if (!prev.isActive) return prev

        const newRemaining = prev.remainingSeconds - 1

        if (newRemaining <= 0) {
          // Timer completed
          if (intervalRef.current) {
            clearInterval(intervalRef.current)
            intervalRef.current = null
          }

          const totalElapsed = fullGoalSeconds - prev.remainingSeconds + 1
          const elapsedMinutes = Math.round(totalElapsed / 60)
          if (elapsedMinutes > 0 && onTimerCompleteRef.current) {
            onTimerCompleteRef.current(elapsedMinutes)
          }

          localStorage.removeItem(STORAGE_KEY)

          return {
            isActive: false,
            remainingSeconds: fullGoalSeconds,
            startTime: null,
            timerStarted: false,
          }
        }

        return {
          ...prev,
          remainingSeconds: newRemaining,
          startTime: Date.now() - ((prev.remainingSeconds - newRemaining) * 1000),
        }
      })
    }, 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [state.isActive, fullGoalSeconds])

  const startTimer = useCallback(() => {
    setState(prev => ({
      isActive: true,
      remainingSeconds: prev.timerStarted ? prev.remainingSeconds : fullGoalSeconds,
      startTime: Date.now(),
      timerStarted: true,
    }))
  }, [fullGoalSeconds])

  const pauseTimer = useCallback(() => {
    setState(prev => {
      if (!prev.isActive) return prev

      // Use the current remainingSeconds as-is (it's already accurate from the interval)
      const totalElapsed = fullGoalSeconds - prev.remainingSeconds
      const elapsedMinutes = Math.round(totalElapsed / 60)
      
      if (elapsedMinutes > 0 && onTimerCompleteRef.current) {
        onTimerCompleteRef.current(elapsedMinutes)
      }

      return {
        ...prev,
        isActive: false,
        startTime: null,
      }
    })
  }, [fullGoalSeconds])

  const resetTimer = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    // Save any elapsed time
    if (state.timerStarted) {
      const totalElapsed = fullGoalSeconds - state.remainingSeconds
      const elapsedMinutes = Math.round(totalElapsed / 60)
      
      if (elapsedMinutes > 0 && onTimerCompleteRef.current) {
        onTimerCompleteRef.current(elapsedMinutes)
      }
    }

    localStorage.removeItem(STORAGE_KEY)
    
    setState({
      isActive: false,
      remainingSeconds: fullGoalSeconds,
      startTime: null,
      timerStarted: false,
    })
  }, [fullGoalSeconds, state])

  return {
    isTimerActive: state.isActive,
    remainingSeconds: state.remainingSeconds,
    timerStarted: state.timerStarted,
    startTimer,
    pauseTimer,
    resetTimer,
  }
}
