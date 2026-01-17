'use client'

import { useState } from 'react'
import { 
  Target, 
  Check, 
  Footprints, 
  Scale, 
  Flame, 
  Star,
  Sparkles,
  Zap,
  Trophy,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  X
} from 'lucide-react'
import { Confetti } from '@/components/gamification'

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
  completed: boolean
  historyId?: string
}

interface ChallengeCardProps {
  challenge: Challenge | null
  onComplete: () => void
  onReplace?: () => void
  onRemove?: () => void
  challengeStreak?: number
  xpReward?: number
  compact?: boolean
}

const categoryConfig: Record<string, { icon: typeof Footprints; label: string; gradient: string; color: string }> = {
  walking: { 
    icon: Footprints, 
    label: 'הליכה',
    gradient: 'from-emerald-200/40 via-teal-200/30 to-green-200/20',
    color: 'text-emerald-600'
  },
  consistency: { 
    icon: Flame, 
    label: 'עקביות',
    gradient: 'from-orange-200/40 via-amber-200/30 to-yellow-200/20',
    color: 'text-orange-600'
  },
  weighing: { 
    icon: Scale, 
    label: 'שקילה',
    gradient: 'from-blue-200/40 via-cyan-200/30 to-sky-200/20',
    color: 'text-blue-600'
  },
  lifestyle: { 
    icon: Star, 
    label: 'אורח חיים',
    gradient: 'from-violet-200/40 via-purple-200/30 to-fuchsia-200/20',
    color: 'text-violet-600'
  },
}

const difficultyConfig: Record<string, { label: string; color: string; bg: string }> = {
  easy: { 
    label: 'קל', 
    color: 'text-emerald-600',
    bg: 'bg-emerald-200/40 border-emerald-300/50'
  },
  medium: { 
    label: 'בינוני', 
    color: 'text-amber-600',
    bg: 'bg-amber-200/40 border-amber-300/50'
  },
  hard: { 
    label: 'מאתגר', 
    color: 'text-rose-600',
    bg: 'bg-rose-200/40 border-rose-300/50'
  },
}

export function ChallengeCard({ 
  challenge, 
  onComplete,
  onReplace,
  onRemove,
  challengeStreak = 0,
  xpReward = 50,
  compact = false 
}: ChallengeCardProps) {
  const [isCompleting, setIsCompleting] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [expanded, setExpanded] = useState(!compact)

  if (!challenge) return null

  const category = categoryConfig[challenge.category] || categoryConfig.lifestyle
  const difficulty = difficultyConfig[challenge.difficulty] || difficultyConfig.easy
  const CategoryIcon = category.icon

  const handleComplete = async () => {
    if (challenge.completed || isCompleting) return
    
    setIsCompleting(true)
    setShowConfetti(true)
    
    // Small delay for animation
    await new Promise(resolve => setTimeout(resolve, 300))
    
    await onComplete()
    setIsCompleting(false)
  }

  // Compact version for stats page
  if (compact && !expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className={`
          w-full text-right p-4 rounded-2xl 
          bg-gradient-to-br ${category.gradient}
          border border-[var(--border)] hover:border-[var(--accent)]/50
          transition-all duration-300 hover:scale-[1.01]
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl bg-[var(--accent)]/20`}>
              <Target className="w-5 h-5 text-[var(--accent)]" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-sm text-[var(--foreground)]">
                אתגר היום
              </div>
              <div className="text-xs text-[var(--muted-foreground)] line-clamp-1">
                {challenge.title}
              </div>
            </div>
          </div>
            <div className="flex items-center gap-2">
              {challenge.completed ? (
                <div className="p-2 rounded-lg bg-emerald-200/40 border border-emerald-300/50">
                  <Check className="w-5 h-5 text-emerald-600" />
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[var(--accent)]">+{xpReward} XP</span>
                  <ChevronDown size={18} className="text-[var(--muted-foreground)]" />
                </div>
              )}
            </div>
        </div>
      </button>
    )
  }

  return (
    <>
      <Confetti active={showConfetti} onComplete={() => setShowConfetti(false)} />
      
      <div 
        className={`
          relative overflow-hidden rounded-3xl
          bg-gradient-to-br ${category.gradient}
          border border-[var(--border)]
          transition-all duration-500
          ${challenge.completed ? 'ring-2 ring-emerald-300/60' : ''}
        `}
      >
        {/* Decorative background elements */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/5 to-transparent rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={`
                p-3 rounded-2xl bg-[var(--card)]/80 backdrop-blur-sm
                border border-white/10 shadow-lg
              `}>
                <Target size={24} className="text-[var(--accent)]" />
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-[var(--foreground)]">אתגר היום</h3>
                  {challengeStreak > 0 && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-200/40 border border-orange-300/50">
                      <Flame size={12} className="text-orange-600" />
                      <span className="text-xs font-bold text-orange-600">{challengeStreak}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <CategoryIcon size={14} className={category.color} />
                  <span className={`text-sm font-medium ${category.color}`}>
                    {category.label}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col items-end gap-2">
              <div className="flex items-center gap-2">
                {/* Remove button - for all challenges */}
                {onRemove && (
                  <button
                    onClick={onRemove}
                    aria-label="הסר אתגר"
                    title="הסר אתגר"
                    className={`
                      w-10 h-10 rounded-full
                      bg-[var(--card)]/60
                      border border-[var(--border)]
                      text-[var(--foreground)]/80
                      hover:bg-rose-500/20
                      hover:border-rose-500/50
                      hover:text-rose-400
                      transition-all duration-300
                      hover:scale-110 active:scale-95
                      flex items-center justify-center
                      group
                    `}
                  >
                    <X 
                      size={18} 
                      className="transition-transform duration-300 group-hover:rotate-90" 
                    />
                  </button>
                )}
                {/* Replace button - only for incomplete challenges */}
                {onReplace && !challenge.completed && (
                  <button
                    onClick={onReplace}
                    aria-label="החלף אתגר"
                    title="החלף אתגר"
                    className={`
                      w-10 h-10 rounded-full
                      bg-[var(--card)]/60
                      border border-[var(--border)]
                      text-[var(--foreground)]/80
                      hover:bg-[var(--card)]/80
                      hover:border-[var(--accent)]/50
                      hover:text-[var(--foreground)]
                      transition-all duration-300
                      hover:scale-110 active:scale-95
                      flex items-center justify-center
                      group
                    `}
                  >
                    <RefreshCw 
                      size={18} 
                      className="transition-transform duration-300 group-hover:rotate-90" 
                    />
                  </button>
                )}
                {/* Difficulty Badge */}
                <span className={`
                  text-xs font-bold px-3 py-1.5 rounded-xl border
                  ${difficulty.bg} ${difficulty.color}
                `}>
                  {difficulty.label}
                </span>
              </div>
              
              {/* XP Reward */}
              <div className="flex items-center gap-1 px-2 py-1 rounded-lg bg-violet-200/40 border border-violet-300/50">
                <Zap size={12} className="text-violet-600" />
                <span className="text-xs font-bold text-violet-600">+{xpReward} XP</span>
              </div>
            </div>
          </div>

          {/* Challenge Content */}
          <div className="mb-4">
            <h4 className="text-xl font-bold text-[var(--foreground)] mb-2">
              {challenge.title}
            </h4>
            <p className="text-[var(--foreground)]/80 font-medium leading-relaxed">
              {challenge.description}
            </p>
          </div>

          {/* Rules/Tips */}
          {challenge.rules && (
            <div className="mb-5 p-4 rounded-2xl bg-[var(--card)]/60 backdrop-blur-sm border border-white/10">
              <div className="flex items-start gap-3">
                <div className="p-1.5 rounded-lg bg-amber-200/40 border border-amber-300/50 mt-0.5">
                  <Sparkles size={14} className="text-amber-600" />
                </div>
                <p className="text-sm text-[var(--foreground)]/70 font-medium leading-relaxed">
                  {challenge.rules}
                </p>
              </div>
            </div>
          )}

          {/* Action Area */}
          {challenge.completed ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-200/40 border border-emerald-300/50">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-200/50 border border-emerald-300/50">
                    <Trophy size={24} className="text-emerald-600" />
                  </div>
                  <div>
                    <span className="font-bold text-emerald-600 text-lg">בוצע בהצלחה!</span>
                    <p className="text-sm text-emerald-600/80">כל הכבוד, קיבלת +{xpReward} XP 🎉</p>
                  </div>
                </div>
                <Check size={28} className="text-emerald-600" />
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <button
                onClick={handleComplete}
                disabled={isCompleting}
                className={`
                  group relative w-full py-4 px-6 rounded-2xl
                  font-bold text-lg text-white
                  overflow-hidden
                  transition-all duration-300
                  hover:scale-[1.02] active:scale-[0.98]
                  disabled:opacity-70 disabled:cursor-not-allowed
                `}
              >
                {/* Button background gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--accent)] via-[var(--primary)] to-[var(--accent)] bg-[length:200%_100%] group-hover:animate-shimmer" />
                
                {/* Glow effect */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 blur-xl bg-[var(--accent)]/50 transition-opacity duration-300" />
                
                {/* Button content */}
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {isCompleting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      מסמן...
                    </>
                  ) : (
                    <>
                      <Check size={22} className="group-hover:scale-110 transition-transform" />
                      סיימתי את האתגר!
                      <Sparkles size={18} className="text-amber-500 group-hover:animate-pulse" />
                    </>
                  )}
                </span>
              </button>
            </div>
          )}

          {/* Collapse button for compact mode */}
          {compact && expanded && (
            <button
              onClick={() => setExpanded(false)}
              className="w-full mt-3 py-2 flex items-center justify-center gap-2 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <ChevronUp size={16} />
              הסתר פרטים
            </button>
          )}
        </div>
      </div>
    </>
  )
}
