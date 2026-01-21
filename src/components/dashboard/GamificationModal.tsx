'use client'

import { Modal } from '@/components/ui/Modal'
import { Trophy, Flame, Star, Award, X, Gift } from 'lucide-react'
import { getLevelFromXP } from '@/hooks/useGamification'

interface GamificationModalProps {
  isOpen: boolean
  onClose: () => void
  gamification: {
    level: number
    total_xp: number
    current_streak: number
    longest_streak: number
    total_walking_minutes_logged: number
    total_weight_logged: number
    total_challenges_completed: number
    total_treats_earned?: number
    xp_since_last_treat?: number
  }
  achievements: unknown[]
  userAchievements: unknown[]
}

export function GamificationModal({
  isOpen,
  onClose,
  gamification,
  achievements,
  userAchievements,
}: GamificationModalProps) {
  const levelInfo = getLevelFromXP(gamification.total_xp)
  const totalAchievements = achievements.length
  const completedAchievements = userAchievements.length

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <div className="relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 left-2 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-all z-10"
        >
          <X className="w-4 h-4 text-gray-600" />
        </button>

        {/* Header - Compact */}
        <div className="text-center pt-4 pb-6">
          <div className="flex justify-center mb-3">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-black text-white">{gamification.level}</div>
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shadow-lg">
                <Flame className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          
          <h2 className="text-lg font-black text-gray-800">ההתקדמות שלך</h2>
          
          {/* XP Progress - Compact */}
          <div className="mt-3 px-6">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>רמה {gamification.level}</span>
              <span>{levelInfo.currentLevelXP} / {levelInfo.nextLevelXP} XP</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full transition-all duration-500"
                style={{ width: `${levelInfo.progress}%` }}
              />
            </div>
          </div>
        </div>

        {/* Stats - Only the important ones */}
        <div className="px-6 pb-6 space-y-3">
          {/* Main Stats - 2x2 Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Level */}
            <div className="bg-gradient-to-br from-purple-50 to-fuchsia-50 rounded-xl p-3 border border-purple-100">
              <div className="flex items-center gap-2 mb-1">
                <Trophy className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-gray-600">רמה</span>
              </div>
              <div className="text-2xl font-black text-gray-800">{gamification.level}</div>
            </div>

            {/* Streak */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-3 border border-orange-100">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-medium text-gray-600">רצף</span>
              </div>
              <div className="text-2xl font-black text-gray-800">{gamification.current_streak}</div>
            </div>

            {/* XP */}
            <div className="bg-gradient-to-br from-amber-50 to-yellow-50 rounded-xl p-3 border border-amber-100">
              <div className="flex items-center gap-2 mb-1">
                <Star className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium text-gray-600">XP</span>
              </div>
              <div className="text-2xl font-black text-gray-800">{gamification.total_xp}</div>
            </div>

            {/* Achievements */}
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 rounded-xl p-3 border border-violet-100">
              <div className="flex items-center gap-2 mb-1">
                <Award className="w-4 h-4 text-violet-600" />
                <span className="text-xs font-medium text-gray-600">הישגים</span>
              </div>
              <div className="text-2xl font-black text-gray-800">{completedAchievements}/{totalAchievements}</div>
            </div>
          </div>

          {/* Treats Counter - if any treats earned */}
          {gamification.total_treats_earned && gamification.total_treats_earned > 0 && (
            <div className="bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-50 rounded-xl p-4 border-2 border-amber-200 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500">
                    <Gift className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="text-xs font-medium text-gray-600 mb-0.5">פינוקים שקיבלת</div>
                    <div className="text-3xl font-black text-amber-700">{gamification.total_treats_earned}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium text-gray-600 mb-0.5">עד הבא</div>
                  <div className="text-lg font-bold text-amber-600">
                    {700 - (gamification.xp_since_last_treat || 0)} XP
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Streak Info - if active */}
          {gamification.current_streak > 0 && (
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-100">
              <div className="flex items-center justify-between">
                <div className="text-center flex-1">
                  <div className="text-xl font-black text-orange-600">{gamification.current_streak}</div>
                  <div className="text-xs text-gray-600">רצף נוכחי</div>
                </div>
                <div className="w-px h-10 bg-orange-200" />
                <div className="text-center flex-1">
                  <div className="text-xl font-black text-orange-600">{gamification.longest_streak}</div>
                  <div className="text-xs text-gray-600">שיא אישי</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  )
}
