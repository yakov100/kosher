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
        className="relative z-0 cursor-pointer transition-transform hover:scale-105 active:scale-95 group"
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
            <div className="text-4xl font-bold text-slate-800">
              {walking.target}
            </div>
            <div className="text-sm font-medium text-slate-500">
              דקות יעד
            </div>
            <div className="text-xs text-emerald-600 mt-1 font-semibold">
              {walking.current > 0 ? `הלכת ${walking.current}` : 'טרם התחלת'}
            </div>
          </div>
        </ProgressRing>
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
