'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useUser } from './useSupabase'
import { getToday } from '@/lib/utils'

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
  const { user } = useUser()
  const [gamification, setGamification] = useState<UserGamification | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([])
  const [loading, setLoading] = useState(true)
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null)

  const fetchGamification = useCallback(async () => {
    if (!user) return

    // Get or create gamification record
    let { data: gamData } = await getSupabase()
      .from('user_gamification')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (!gamData) {
      const { data: newData } = await getSupabase()
        .from('user_gamification')
        .insert({ user_id: user.id })
        .select()
        .single()
      gamData = newData
    }

    setGamification(gamData)

    // Get all achievements
    const { data: achievementsData } = await getSupabase()
      .from('achievements')
      .select('*')
      .eq('is_active', true)
      .order('sort_order')

    setAchievements(achievementsData || [])

    // Get user's unlocked achievements
    const { data: userAchData } = await getSupabase()
      .from('user_achievements')
      .select('*, achievements(*)')
      .eq('user_id', user.id)

    const unlocked = userAchData?.map(ua => ({
      ...(ua.achievements as unknown as Achievement),
      unlocked_at: ua.unlocked_at
    })) || []

    setUserAchievements(unlocked)
    setLoading(false)
  }, [user])

  useEffect(() => {
    fetchGamification()
  }, [fetchGamification])

  // Add XP and check for level up
  const addXP = async (amount: number) => {
    if (!user || !gamification) return

    const newTotalXP = gamification.total_xp + amount
    const { level: newLevel } = getLevelFromXP(newTotalXP)

    const { data } = await getSupabase()
      .from('user_gamification')
      .update({ 
        total_xp: newTotalXP,
        level: newLevel,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (data) {
      setGamification(data)
      
      // Check for level achievements
      await checkAchievements({ ...data, level: newLevel })
    }

    return newLevel > gamification.level
  }

  // Update streak
  const updateStreak = async (recordedDate: string) => {
    if (!user || !gamification) return

    const today = getToday()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    const yesterdayStr = yesterday.toISOString().split('T')[0]

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

    const { data } = await getSupabase()
      .from('user_gamification')
      .update({ 
        current_streak: newStreak,
        longest_streak: newLongest,
        last_activity_date: today,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (data) {
      setGamification(data)
      await checkAchievements(data)
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
    
    const { data } = await getSupabase()
      .from('user_gamification')
      .update({ 
        [field]: currentValue + 1,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)
      .select()
      .single()

    if (data) {
      setGamification(data)
      await checkAchievements(data)
    }
  }

  // Check and unlock achievements
  const checkAchievements = async (stats: UserGamification) => {
    if (!user) return

    const unlockedIds = userAchievements.map(a => a.id)
    
    for (const achievement of achievements) {
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
          .insert({ user_id: user.id, achievement_id: achievement.id })

        // Add XP reward
        await addXP(achievement.xp_reward)

        // Update local state
        setUserAchievements(prev => [...prev, { ...achievement, unlocked_at: new Date().toISOString() }])
        
        // Show notification
        setNewAchievement(achievement)
      }
    }
  }

  const clearNewAchievement = () => setNewAchievement(null)

  const levelInfo = gamification ? getLevelFromXP(gamification.total_xp) : { level: 1, currentLevelXP: 0, nextLevelXP: 100, progress: 0 }
  const motivationalMessage = getMotivationalMessage(gamification)

  return {
    gamification,
    achievements,
    userAchievements,
    loading,
    newAchievement,
    clearNewAchievement,
    levelInfo,
    motivationalMessage,
    addXP,
    updateStreak,
    incrementStat,
    refetch: fetchGamification
  }
}
