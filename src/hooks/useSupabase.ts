'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { User } from '@supabase/supabase-js'
import { getToday, getLast7Days, getLast30Days } from '@/lib/utils'
import { useUserContext } from '@/providers/UserProvider'
import useSWR, { mutate } from 'swr'

// Create supabase client lazily
function getSupabase() {
  return createClient()
}

// Type definitions
interface WeightTrackerSettings {
  id: string
  user_id: string
  daily_walking_minutes_goal: number
  weekly_goal_days: number
  show_daily_tip: boolean
  show_daily_challenge: boolean
  tip_categories: string[]
  reminder_tip_time: string | null
  reminder_walking_time: string | null
  reminder_weight_frequency: string | null
  reminder_weight_time: string | null
  weight_unit: string
  week_starts_on: string
  created_at: string
  updated_at: string
}

interface WalkingRecord {
  id: string
  user_id: string
  date: string
  minutes: number
  note: string | null
  created_at: string
  updated_at: string
}

interface WeightRecord {
  id: string
  user_id: string
  recorded_at: string
  weight: number
  note: string | null
  created_at: string
  updated_at: string
}

interface Tip {
  id: string
  category: string
  title: string
  body: string
  extended_body: string | null
  tags: string[] | null
  difficulty: string | null
  is_active: boolean
  created_at: string
}

interface Challenge {
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
}

// Auth hook
export function useUser() {
  return useUserContext()
}

// Settings hook
export function useSettings() {
  const { user } = useUser()
  
  const fetchSettings = async () => {
    if (!user) return null

    const { data, error } = await getSupabase()
      .from('weight_tracker_settings')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching settings:', error)
      throw error
    }

    // Create default settings if none exist
    if (!data) {
      const { data: newData, error: insertError } = await getSupabase()
        .from('weight_tracker_settings')
        .insert({
          user_id: user.id,
          daily_walking_minutes_goal: 30,
          weekly_goal_days: 5,
        } as never)
        .select()
        .single()

      if (insertError) {
        console.error('Error creating settings:', insertError)
        throw insertError
      }
      return newData as WeightTrackerSettings
    }
    
    return data as WeightTrackerSettings
  }

  const { data: settings, error, isLoading, mutate: mutateSettings } = useSWR(
    user ? ['settings', user.id] : null,
    fetchSettings,
    {
      revalidateOnFocus: false, // Don't revalidate on window focus to reduce reads
    }
  )

  const updateSettings = async (updates: Partial<WeightTrackerSettings>) => {
    if (!user || !settings) return

    // Optimistic update
    mutateSettings({ ...settings, ...updates }, false)

    const { data, error } = await getSupabase()
      .from('weight_tracker_settings')
      .update(updates as never)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating settings:', error)
      mutateSettings() // Revert on error
      throw error
    }

    mutateSettings(data)
    return data
  }

  return { settings: settings || null, loading: isLoading, updateSettings, refetch: mutateSettings }
}

// Walking hook (דקות הליכה)
export function useWalking() {
  const { user } = useUser()
  
  const fetchRecords = async ([, userId, days]: [string, string, number]) => {
    const dates = days === 7 ? getLast7Days() : getLast30Days()
    const startDate = dates[0]

    const { data, error } = await getSupabase()
      .from('steps_records')
      .select('*')
      .eq('user_id', userId)
      .gte('date', startDate)
      .order('date', { ascending: false })

    if (error) {
      console.error('Error fetching walking records:', error)
      throw error
    }
    
    return data as WalkingRecord[]
  }

  const { data: records = [], isLoading, mutate: mutateRecords } = useSWR(
    user ? ['walking', user.id, 30] : null,
    fetchRecords
  )

  const getTodayRecord = () => {
    return records.find(r => r.date === getToday())
  }

  const addOrUpdateRecord = async (date: string, minutes: number, note?: string) => {
    if (!user) return

    const existing = records.find(r => r.date === date)
    
    // Optimistic update
    const optimisticRecord = existing 
      ? { ...existing, minutes, note: note ?? null, updated_at: new Date().toISOString() }
      : { 
          id: 'temp-' + Date.now(), 
          user_id: user.id, 
          date, 
          minutes, 
          note: note ?? null, 
          created_at: new Date().toISOString(), 
          updated_at: new Date().toISOString() 
        }
    
    const newRecords = existing
      ? records.map(r => r.date === date ? optimisticRecord : r)
      : [optimisticRecord as WalkingRecord, ...records].sort((a, b) => b.date.localeCompare(a.date))
      
    mutateRecords(newRecords, false)

    let result
    if (existing) {
      const { data, error } = await getSupabase()
        .from('steps_records')
        .update({ minutes, note } as never)
        .eq('id', existing.id)
        .select()
        .single()

      if (error) {
        mutateRecords() // Revert
        throw error
      }
      result = data
    } else {
      const { data, error } = await getSupabase()
        .from('steps_records')
        .insert({ user_id: user.id, date, minutes, note } as never)
        .select()
        .single()

      if (error) {
        mutateRecords() // Revert
        throw error
      }
      result = data
    }

    // Revalidate to ensure consistency
    mutateRecords() 
    return result
  }

  const deleteRecord = async (id: string) => {
    // Optimistic update
    mutateRecords(records.filter(r => r.id !== id), false)
    
    const { error } = await getSupabase()
      .from('steps_records')
      .delete()
      .eq('id', id)

    if (error) {
      mutateRecords() // Revert
      throw error
    }
  }

  // Calculate consecutive days where walking goal was achieved
  const getConsecutiveGoalDays = (dailyGoal: number): { consecutiveDays: number; todayGoalMet: boolean } => {
    if (!records.length) return { consecutiveDays: 0, todayGoalMet: false }
    
    const today = getToday()
    const todayRecord = records.find(r => r.date === today)
    const todayGoalMet = todayRecord ? todayRecord.minutes >= dailyGoal : false

    // Sort records by date descending
    const sortedRecords = [...records].sort((a, b) => b.date.localeCompare(a.date))

    // Start counting from today (or yesterday if today not recorded yet)
    let consecutiveDays = 0
    const startDate = new Date(today)
    
    // If today's goal is met, include today in the count
    // Otherwise, check if we should start from yesterday
    if (!todayGoalMet) {
      // Don't break the streak just because today isn't complete yet
      // Check yesterday first
      startDate.setDate(startDate.getDate() - 1)
    }

    // Count backwards
    let checkDate = new Date(startDate)
    for (let i = 0; i < 30; i++) { // Check up to 30 days back
      const dateStr = checkDate.toISOString().split('T')[0]
      const record = sortedRecords.find(r => r.date === dateStr)
      
      if (record && record.minutes >= dailyGoal) {
        consecutiveDays++
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }

    return { consecutiveDays, todayGoalMet }
  }

  return { records, loading: isLoading, getTodayRecord, addOrUpdateRecord, deleteRecord, getConsecutiveGoalDays, refetch: mutateRecords }
}

// Backward compatibility alias
export function useSteps() {
  const walking = useWalking()
  return {
    steps: walking.records,
    loading: walking.loading,
    getTodaySteps: walking.getTodayRecord,
    addOrUpdateSteps: walking.addOrUpdateRecord,
    deleteSteps: walking.deleteRecord,
    getConsecutiveGoalDays: walking.getConsecutiveGoalDays,
    refetch: walking.refetch,
  }
}

// Weight hook
export function useWeight() {
  const { user } = useUser()

  const fetchWeights = async ([, userId, days]: [string, string, number]) => {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - days)

    const { data, error } = await getSupabase()
      .from('weight_records')
      .select('*')
      .eq('user_id', userId)
      .gte('recorded_at', startDate.toISOString())
      .order('recorded_at', { ascending: false })

    if (error) {
      console.error('Error fetching weights:', error)
      throw error
    }
    
    return data as WeightRecord[]
  }

  const { data: weights = [], isLoading, mutate: mutateWeights } = useSWR(
    user ? ['weights', user.id, 90] : null,
    fetchWeights
  )

  const getLatestWeight = () => {
    return weights[0]
  }

  const addWeight = async (weight: number, recordedAt?: string, note?: string) => {
    if (!user) return

    const newRecord = {
      id: 'temp-' + Date.now(),
      user_id: user.id,
      weight,
      recorded_at: recordedAt || new Date().toISOString(),
      note: note || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // Optimistic update
    const newWeights = [newRecord as WeightRecord, ...weights].sort((a, b) => 
      new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    )
    mutateWeights(newWeights, false)

    const { data, error } = await getSupabase()
      .from('weight_records')
      .insert({
        user_id: user.id,
        weight,
        recorded_at: recordedAt || new Date().toISOString(),
        note,
      } as never)
      .select()
      .single()

    if (error) {
      mutateWeights() // Revert
      throw error
    }
    
    // Revalidate
    mutateWeights()
    return data
  }

  const updateWeight = async (id: string, updates: Partial<WeightRecord>) => {
    // Optimistic update
    const newWeights = weights.map(w => w.id === id ? { ...w, ...updates } : w)
    mutateWeights(newWeights, false)

    const { data, error } = await getSupabase()
      .from('weight_records')
      .update(updates as never)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      mutateWeights() // Revert
      throw error
    }
    
    mutateWeights()
    return data
  }

  const deleteWeight = async (id: string) => {
    // Optimistic update
    mutateWeights(weights.filter(w => w.id !== id), false)

    const { error } = await getSupabase()
      .from('weight_records')
      .delete()
      .eq('id', id)

    if (error) {
      mutateWeights() // Revert
      throw error
    }
  }

  return { weights, loading: isLoading, getLatestWeight, addWeight, updateWeight, deleteWeight, refetch: mutateWeights }
}

// Daily tip/challenge hook
export function useDailyContent() {
  const { user } = useUser()
  
  const fetchDailyContent = async () => {
    if (!user) return null

    const today = getToday()

    const fetchTipPromise = (async () => {
      // Check for existing tip today
      const { data: tipHistory } = await getSupabase()
        .from('daily_tip_history')
        .select('tip_id, tips(*)')
        .eq('user_id', user.id)
        .eq('shown_date', today)
        .single()

      const tipHistoryTyped = tipHistory as { tips: Tip } | null
      if (tipHistoryTyped?.tips) {
        return tipHistoryTyped.tips
      } else {
        // Get tips shown in last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const { data: recentTips } = await getSupabase()
          .from('daily_tip_history')
          .select('tip_id')
          .eq('user_id', user.id)
          .gte('shown_date', thirtyDaysAgo.toISOString().split('T')[0])

        const recentTipIds = recentTips?.map((t: { tip_id: string }) => t.tip_id) || []

        // Get a random tip not shown recently
        let query = getSupabase()
          .from('tips')
          .select('*')
          .eq('is_active', true)

        if (recentTipIds.length > 0) {
          query = query.not('id', 'in', `(${recentTipIds.join(',')})`)
        }

        const { data: availableTips } = await query

        if (availableTips && availableTips.length > 0) {
          const randomTip = availableTips[Math.floor(Math.random() * availableTips.length)] as Tip
          
          // Save to history
          await getSupabase().from('daily_tip_history').insert({
            user_id: user.id,
            tip_id: randomTip.id,
            shown_date: today,
          } as never)

          return randomTip
        }
      }
      return null
    })()

    const fetchChallengePromise = (async () => {
      // Check for existing challenge today
      const { data: challengeHistory } = await getSupabase()
        .from('daily_challenge_history')
        .select('*, challenges(*)')
        .eq('user_id', user.id)
        .eq('shown_date', today)
        .single()

      const challengeHistoryTyped = challengeHistory as { challenges: Challenge; completed: boolean; id: string } | null
      if (challengeHistoryTyped?.challenges) {
        return {
          ...challengeHistoryTyped.challenges,
          completed: challengeHistoryTyped.completed,
          historyId: challengeHistoryTyped.id,
        }
      } else {
        // Get challenges shown in last 30 days
        const thirtyDaysAgo = new Date()
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
        
        const { data: recentChallenges } = await getSupabase()
          .from('daily_challenge_history')
          .select('challenge_id')
          .eq('user_id', user.id)
          .gte('shown_date', thirtyDaysAgo.toISOString().split('T')[0])

        const recentChallengeIds = recentChallenges?.map((c: { challenge_id: string }) => c.challenge_id) || []

        // Get a random challenge not shown recently
        let query = getSupabase()
          .from('challenges')
          .select('*')
          .eq('is_active', true)
          .eq('difficulty', 'easy') // Start with easy challenges

        if (recentChallengeIds.length > 0) {
          query = query.not('id', 'in', `(${recentChallengeIds.join(',')})`)
        }

        const { data: availableChallenges } = await query

        if (availableChallenges && availableChallenges.length > 0) {
          const randomChallenge = availableChallenges[Math.floor(Math.random() * availableChallenges.length)] as Challenge
          
          // Save to history
          const { data: newHistory } = await getSupabase()
            .from('daily_challenge_history')
            .insert({
              user_id: user.id,
              challenge_id: randomChallenge.id,
              shown_date: today,
            } as never)
            .select()
            .single()

          const newHistoryTyped = newHistory as { id: string } | null
          if (newHistoryTyped) {
            return {
              ...randomChallenge,
              completed: false,
              historyId: newHistoryTyped.id,
            }
          }
        }
      }
      return null
    })()

    const [tip, challenge] = await Promise.all([fetchTipPromise, fetchChallengePromise])
    return { tip, challenge }
  }

  const { data, isLoading, mutate: mutateDaily } = useSWR(
    user ? ['dailyContent', user.id, getToday()] : null,
    fetchDailyContent,
    {
      revalidateOnFocus: false, // Don't revalidate on focus as daily content doesn't change during the day
    }
  )

  const completeChallenge = async () => {
    if (!data?.challenge) return

    // Optimistic update
    mutateDaily({ 
      ...data, 
      challenge: { ...data.challenge, completed: true } 
    }, false)

    const { error } = await getSupabase()
      .from('daily_challenge_history')
      .update({
        completed: true,
        completed_at: new Date().toISOString(),
      } as never)
      .eq('id', data.challenge.historyId)

    if (error) {
      mutateDaily() // Revert
      throw error
    }
    
    // Revalidate
    mutateDaily()
  }

  return { 
    tip: data?.tip || null, 
    challenge: data?.challenge || null, 
    loading: isLoading, 
    completeChallenge, 
    refetch: mutateDaily 
  }
}
