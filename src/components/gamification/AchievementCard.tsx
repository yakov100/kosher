'use client'

import { Lock } from 'lucide-react'

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
}

interface AchievementCardProps {
  achievement: Achievement
  unlocked: boolean
  unlockedAt?: string
  compact?: boolean
}

const rarityColors = {
  common: {
    bg: 'bg-gray-100/70',
    border: 'border-gray-300',
    text: 'text-gray-600',
    glow: ''
  },
  uncommon: {
    bg: 'bg-emerald-100/70',
    border: 'border-emerald-300',
    text: 'text-emerald-600',
    glow: 'shadow-emerald-200/50'
  },
  rare: {
    bg: 'bg-sky-100/70',
    border: 'border-sky-300',
    text: 'text-sky-600',
    glow: 'shadow-sky-200/50'
  },
  epic: {
    bg: 'bg-violet-100/70',
    border: 'border-violet-300',
    text: 'text-violet-600',
    glow: 'shadow-violet-200/50'
  },
  legendary: {
    bg: 'bg-gradient-to-br from-amber-100/80 to-orange-100/80',
    border: 'border-amber-300',
    text: 'text-amber-600',
    glow: 'shadow-amber-200/60'
  }
}

const rarityLabels: Record<string, string> = {
  common: 'נפוץ',
  uncommon: 'לא נפוץ',
  rare: 'נדיר',
  epic: 'אפי',
  legendary: 'אגדי'
}

export function AchievementCard({ achievement, unlocked, unlockedAt, compact = false }: AchievementCardProps) {
  const colors = rarityColors[achievement.rarity as keyof typeof rarityColors] || rarityColors.common

  if (compact) {
    return (
      <div 
        className={`
          relative p-3 rounded-xl border transition-all duration-300
          ${unlocked ? colors.bg : 'bg-gray-100/40'}
          ${unlocked ? colors.border : 'border-gray-200'}
          ${unlocked ? `shadow-lg ${colors.glow}` : 'opacity-50'}
        `}
      >
        <div className="flex items-center gap-3">
          <div className={`text-2xl ${!unlocked && 'grayscale opacity-50'}`}>
            {unlocked ? achievement.icon : '🔒'}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={`font-medium text-sm truncate ${unlocked ? 'text-gray-700' : 'text-gray-400'}`}>
              {achievement.title}
            </h4>
            <p className={`text-xs truncate ${unlocked ? colors.text : 'text-gray-400'}`}>
              +{achievement.xp_reward} XP
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div 
      className={`
        relative p-4 rounded-2xl border transition-all duration-300
        ${unlocked ? colors.bg : 'bg-gray-100/40'}
        ${unlocked ? colors.border : 'border-gray-200'}
        ${unlocked ? `shadow-xl ${colors.glow}` : ''}
      `}
    >
      {/* Rarity badge */}
      <div className={`absolute top-3 left-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${colors.bg} ${colors.text}`}>
        {rarityLabels[achievement.rarity]}
      </div>

      {/* Icon */}
      <div className="flex justify-center mb-3">
        <div className={`
          text-5xl p-3 rounded-2xl
          ${unlocked ? '' : 'grayscale opacity-30'}
          ${unlocked && achievement.rarity === 'legendary' ? 'animate-pulse-glow' : ''}
        `}>
          {unlocked ? achievement.icon : <Lock className="w-12 h-12 text-gray-400" />}
        </div>
      </div>

      {/* Title & Description */}
      <div className="text-center">
        <h3 className={`font-bold mb-1 ${unlocked ? 'text-gray-700' : 'text-gray-400'}`}>
          {achievement.title}
        </h3>
        <p className={`text-sm mb-2 ${unlocked ? 'text-gray-500' : 'text-gray-400'}`}>
          {achievement.description}
        </p>
        
        {/* XP Reward */}
        <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium
          ${unlocked ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}
        `}>
          <span className="text-base">⭐</span>
          +{achievement.xp_reward} XP
        </div>

        {/* Unlocked date */}
        {unlocked && unlockedAt && (
          <p className="text-xs text-gray-400 mt-2">
            נפתח: {new Date(unlockedAt).toLocaleDateString('he-IL')}
          </p>
        )}
      </div>

      <style jsx>{`
        @keyframes pulse-glow {
          0%, 100% { filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.4)); }
          50% { filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.7)); }
        }
        .animate-pulse-glow {
          animation: pulse-glow 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
