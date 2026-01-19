'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUserContext } from '@/providers/UserProvider'
import { getToday } from '@/lib/utils'
import { format } from 'date-fns'
import useSWR from 'swr'

function getSupabase() {
  return createClient()
}

interface UserGamification {
  id: string
  user_id: string
  total_xp: number
  level: number
  current_streak: number
  longest_streak: number
  total_walking_minutes_logged: number
  total_weight_logged: number
  total_challenges_completed: number
  last_activity_date: string | null
}

interface Achievement {
  id: string
  key: string
  title: string
  description: string
  icon: string
  category: string
  requirement_type: string
  requirement_value: number
  xp_reward: number
  rarity: string
  sort_order: number
}

interface UserAchievement extends Achievement {
  unlocked_at: string
}

// XP required for each level (progressive)
export function getXPForLevel(level: number): number {
  return Math.floor(100 * Math.pow(1.5, level - 1))
}

// Get level from total XP
export function getLevelFromXP(totalXP: number): { level: number; currentLevelXP: number; nextLevelXP: number; progress: number } {
  let level = 1
  let xpNeeded = getXPForLevel(1)
  let accumulatedXP = 0

  while (accumulatedXP + xpNeeded <= totalXP) {
    accumulatedXP += xpNeeded
    level++
    xpNeeded = getXPForLevel(level)
  }

  const currentLevelXP = totalXP - accumulatedXP
  const nextLevelXP = xpNeeded
  const progress = (currentLevelXP / nextLevelXP) * 100

  return { level, currentLevelXP, nextLevelXP, progress }
}

// Motivational messages based on stats
export function getMotivationalMessage(gamification: UserGamification | null): string {
  if (!gamification) return 'בואו נתחיל את המסע! 💪'

  const { current_streak, total_xp, level } = gamification
  const today = new Date()
  const hour = today.getHours()

  // Time-based greetings
  let greeting = ''
  if (hour < 12) greeting = 'בוקר טוב! ☀️'
  else if (hour < 17) greeting = 'צהריים טובים! 🌤️'
  else if (hour < 21) greeting = 'ערב טוב! 🌅'
  else greeting = 'לילה טוב! 🌙'

  // Streak-based messages
  if (current_streak >= 30) {
    return `${greeting} חודש שלם של עקביות! אתה אלוף! 🏆`
  }
  if (current_streak >= 14) {
    return `${greeting} שבועיים ברצף! המשך כך! 💎`
  }
  if (current_streak >= 7) {
    return `${greeting} שבוע שלם! אתה על גל! 🔥`
  }
  if (current_streak >= 3) {
    return `${greeting} רצף יפה! בוא נשמור עליו! 🎯`
  }
  if (current_streak === 0) {
    return `${greeting} יום חדש, התחלה חדשה! 🌟`
  }

  // Level-based messages
  if (level >= 10) {
    return `${greeting} מומחה כושר ברמה ${level}! 👑`
  }
  if (level >= 5) {
    return `${greeting} רמה ${level} - מרשים! 💪`
  }

  return `${greeting} כל צעד מקרב אותך למטרה! 🚀`
}

export function useGamification() {
  const { user } = useUserContext()
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)

  const fetchGamificationData = async () => {
    if (!user) return null

    const gamificationPromise = (async () => {
      // Get or create gamification record
      let { data: gamData } = await getSupabase()
        .from('user_gamification')
        .select('*')
        .eq('user_id', user.id)
        .single()

      if (!gamData) {
        const { data: newData } = await getSupabase()
          .from('user_gamification')
          .insert({ user_id: user.id } as never)
          .select()
          .single()
        if (!newData) {
          throw new Error('Failed to create gamification record')
        }
        gamData = newData
      }
      
      if (!gamData) {
        throw new Error('Gamification data is missing')
      }
      
      return gamData as UserGamification
    })()

    const achievementsPromise = (async () => {
      const { data } = await getSupabase()
        .from('achievements')
        .select('*')
        .eq('is_active', true)
        .order('sort_order')
      return (data || []) as Achievement[]
    })()

    const userAchievementsPromise = (async () => {
      const { data } = await getSupabase()
        .from('user_achievements')
        .select('*, achievements(*)')
        .eq('user_id', user.id)
      
      return (data?.map((ua: { achievements: unknown; unlocked_at: string }) => ({
        ...(ua.achievements as Achievement),
        unlocked_at: ua.unlocked_at
      })) || []) as UserAchievement[]
    })()

    const [gamData, achievementsData, userAchData] = await Promise.all([
      gamificationPromise,
      achievementsPromise,
      userAchievementsPromise
    ])

    return {
      gamification: gamData,
      achievements: achievementsData,
      userAchievements: userAchData
    }
  }

  const { data, isLoading, mutate } = useSWR(
    user ? ['gamification', user.id] : null,
    fetchGamificationData
  )

  // Check and reset streak if user hasn't been active recently
  const getValidatedStreak = useCallback((gam: UserGamification | null): number => {
    if (!gam || !gam.last_activity_date) return 0

    const today = getToday()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = format(yesterday, 'yyyy-MM-dd')

    // If last activity was today or yesterday, streak is valid
    if (gam.last_activity_date === today || gam.last_activity_date === yesterdayStr) {
      return gam.current_streak
    }

    // Otherwise, streak should be 0 (will become 1 when they log activity)
    return 0
  }, [])

  // Reset streak in database if it's stale
  useEffect(() => {
    const resetStaleStreak = async () => {
      if (!user || !data?.gamification) return

      const gam = data.gamification
      const validStreak = getValidatedStreak(gam)

      // If the displayed streak differs from stored, update database
      if (validStreak === 0 && gam.current_streak > 0) {
        await getSupabase()
          .from('user_gamification')
          .update({ 
            current_streak: 0,
            updated_at: new Date().toISOString()
          } as never)
          .eq('user_id', user.id)
        
        mutate()
      }
    }

    resetStaleStreak()
  }, [user, data?.gamification, getValidatedStreak, mutate])

  const rawGamification = data?.gamification || null
  // Apply streak validation to displayed data
  const gamification = rawGamification ? {
    ...rawGamification,
    current_streak: getValidatedStreak(rawGamification)
  } : null
  const achievements = data?.achievements || []
  const userAchievements = data?.userAchievements || []

  // Add XP and check for level up
  const addXP = async (amount: number) => {
    if (!user || !gamification) return

    const newTotalXP = gamification.total_xp + amount
    const { level: newLevel } = getLevelFromXP(newTotalXP)
    const levelUp = newLevel > gamification.level

    const newGamification = { 
      ...gamification, 
      total_xp: newTotalXP, 
      level: newLevel,
      updated_at: new Date().toISOString()
    }

    // Optimistic update
    mutate({ ...data, gamification: newGamification } as any, false)

    const { data: updatedData } = await getSupabase()
      .from('user_gamification')
      .update({ 
        total_xp: newTotalXP,
        level: newLevel,
        updated_at: new Date().toISOString()
      } as never)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updatedData) {
      // Check for level achievements
      await checkAchievements({ ...(updatedData as UserGamification), level: newLevel }, achievements, userAchievements)
      mutate() // Revalidate to get fresh state including any new achievements
    } else {
        mutate() // Revert on error
    }

    return levelUp
  }

  // Update streak
  const updateStreak = async (recordedDate: string) => {
    if (!user || !gamification) return

    const today = getToday()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = format(yesterday, 'yyyy-MM-dd')

    let newStreak = gamification.current_streak
    let newLongest = gamification.longest_streak

    // If last activity was yesterday, increment streak
    if (gamification.last_activity_date === yesterdayStr) {
      newStreak = gamification.current_streak + 1
    } 
    // If last activity was today, keep streak
    else if (gamification.last_activity_date === today) {
      // Do nothing
    }
    // Otherwise, start new streak
    else {
      newStreak = 1
    }

    if (newStreak > newLongest) {
      newLongest = newStreak
    }

    const newGamification = { 
      ...gamification,
      current_streak: newStreak,
      longest_streak: newLongest,
      last_activity_date: today,
      updated_at: new Date().toISOString()
    }
    
    // Optimistic update
    mutate({ ...data, gamification: newGamification } as any, false)

    const { data: updatedData } = await getSupabase()
      .from('user_gamification')
      .update({ 
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: today,
        updated_at: new Date().toISOString()
      } as never)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updatedData) {
      await checkAchievements(updatedData as UserGamification, achievements, userAchievements)
      mutate()
    } else {
      mutate()
    }

    return newStreak
  }

  // Increment stats
  const incrementStat = async (stat: 'steps' | 'weight' | 'challenge') => {
    if (!user || !gamification) return

    const statMap = {
      steps: 'total_walking_minutes_logged',
      weight: 'total_weight_logged', 
      challenge: 'total_challenges_completed'
    }

    const field = statMap[stat] as keyof UserGamification
    const currentValue = gamification[field] as number
    
    const newGamification = {
        ...gamification,
        [field]: currentValue + 1,
        updated_at: new Date().toISOString()
    }

    // Optimistic update
    mutate({ ...data, gamification: newGamification } as any, false)

    const { data: updatedData } = await getSupabase()
      .from('user_gamification')
      .update({ 
        [field]: currentValue + 1,
        updated_at: new Date().toISOString()
      } as never)
      .eq('user_id', user.id)
      .select()
      .single()

    if (updatedData) {
      await checkAchievements(updatedData as UserGamification, achievements, userAchievements)
      mutate()
    } else {
      mutate()
    }
  }

  // Check and unlock achievements
  const checkAchievements = async (
    stats: UserGamification, 
    allAchievements: Achievement[], 
    currentUserAchievements: UserAchievement[]
  ) => {
    if (!user) return

    const unlockedIds = currentUserAchievements.map(a => a.id)
    const newUnlocked = []
    
    for (const achievement of allAchievements) {
      if (unlockedIds.includes(achievement.id)) continue

      let shouldUnlock = false

      switch (achievement.requirement_type) {
        case 'streak_days':
          shouldUnlock = stats.current_streak >= achievement.requirement_value
          break
        case 'goal_reached':
          shouldUnlock = stats.total_walking_minutes_logged >= achievement.requirement_value
          break
        case 'weight_logged':
          shouldUnlock = stats.total_weight_logged >= achievement.requirement_value
          break
        case 'challenges_completed':
          shouldUnlock = stats.total_challenges_completed >= achievement.requirement_value
          break
        case 'first_steps':
          shouldUnlock = stats.total_walking_minutes_logged >= 1
          break
        case 'first_weight':
          shouldUnlock = stats.total_weight_logged >= 1
          break
        case 'first_challenge':
          shouldUnlock = stats.total_challenges_completed >= 1
          break
        case 'level':
          shouldUnlock = stats.level >= achievement.requirement_value
          break
      }

      if (shouldUnlock) {
        // Unlock the achievement
        await getSupabase()
          .from('user_achievements')
          .insert({ user_id: user.id, achievement_id: achievement.id } as never)

        // Add XP reward
        // Note: calling addXP here would be recursive/complicated, so we just update XP manually or call a separate helper
        // Ideally addXP logic should be separated from the hook state logic
        
        // For now, let's just trigger the notification
        setNewAchievement(achievement)
        newUnlocked.push(achievement)
      }
    }
    
    if (newUnlocked.length > 0) {
        // Force re-fetch to get updated XP if we added any (not implemented here to avoid circularity)
        // and to get the new achievements list
    }
  }

  const clearNewAchievement = () => setNewAchievement(null)

  const levelInfo = gamification ? getLevelFromXP(gamification.total_xp) : { level: 1, currentLevelXP: 0, nextLevelXP: 100, progress: 0 }
  const motivationalMessage = getMotivationalMessage(gamification)

  return {
    gamification,
    achievements,
    userAchievements,
    loading: isLoading,
    newAchievement,
    clearNewAchievement,
    levelInfo,
    motivationalMessage,
    addXP,
    updateStreak,
    incrementStat,
    refetch: mutate
  }
}
