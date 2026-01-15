'use client'

import { ProgressRing } from '@/components/ui/ProgressRing'
import { Timer, Scale, Trophy, Flame } from 'lucide-react'

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

  return (
    <div className="flex flex-col items-center justify-center py-10 relative">
      {/* Top: Large Circle (Walking) */}
      <div 
        className="relative z-0 cursor-pointer transition-transform hover:scale-105 active:scale-95"
        onClick={onWalkingClick}
      >
        <ProgressRing 
          progress={walkingProgress} 
          size={220} 
          strokeWidth={12}
        >
          <div className="flex flex-col items-center text-center">
            <Timer className="w-8 h-8 text-[var(--primary)] mb-2" />
            <div className="text-4xl font-bold text-[var(--foreground)]">
              {walking.target}
            </div>
            <div className="text-sm font-medium text-[var(--muted-foreground)]">
              דקות יעד
            </div>
            <div className="text-xs text-[var(--primary)] mt-1 font-semibold">
              {walking.current > 0 ? `הלכת ${walking.current}` : 'טרם התחלת'}
            </div>
          </div>
        </ProgressRing>
      </div>

      {/* Bottom: Medium (Weight) and Small (Stats) */}
      <div className="flex items-center justify-center gap-4 -mt-16 relative z-10">
        {/* Small Circle (Stats) */}
        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-[var(--accent)] to-purple-600 shadow-lg flex flex-col items-center justify-center text-white relative z-0 mb-4">
          <div className="flex items-center gap-1 mb-1">
            <Trophy size={14} />
            <span className="text-lg font-bold">{gamification.level}</span>
          </div>
          <div className="w-12 h-0.5 bg-white/30 mb-1" />
          <div className="flex items-center gap-1">
            <Flame size={14} />
            <span className="text-lg font-bold">{gamification.streak}</span>
          </div>
        </div>

        {/* Medium Circle (Weight) */}
        <button
          onClick={onWeightClick}
          className="w-40 h-40 rounded-full bg-gradient-to-br from-[var(--secondary)] to-blue-600 border-4 border-white shadow-lg flex flex-col items-center justify-center text-white transition-transform hover:scale-105 active:scale-95 relative z-10"
        >
          <Scale className="w-6 h-6 text-white mb-1" />
          <div className="text-3xl font-bold text-white">
            {weight.current > 0 ? weight.current : '--'}
          </div>
          <div className="text-xs font-medium text-blue-50">
            ק״ג אחרון
          </div>
        </button>
      </div>
    </div>
  )
}
