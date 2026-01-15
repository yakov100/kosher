'use client'

import { Target, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Tables } from '@/types/database'

interface ChallengeCardProps {
  challenge: (Tables<'challenges'> & { completed: boolean }) | null
  onComplete: () => void
}

const categoryLabels: Record<string, string> = {
  walking: 'הליכה',
  consistency: 'עקביות',
  weighing: 'שקילה',
  lifestyle: 'אורח חיים',
}

export function ChallengeCard({ challenge, onComplete }: ChallengeCardProps) {
  if (!challenge) return null

  return (
    <div className="py-5 bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-3 rounded-xl bg-[var(--accent)]/15">
            <Target size={20} className="text-[var(--accent)]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-base text-[var(--foreground)] leading-tight">אתגר היום</h3>
            <p className="text-sm font-medium text-[var(--muted-foreground)] mt-1 break-words">{challenge.title}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl shrink-0 ${
          challenge.difficulty === 'easy' 
            ? 'bg-[var(--accent)]/20 text-[var(--accent)]' 
            : 'bg-[var(--secondary)]/20 text-[var(--secondary)]'
        }`}>
          {challenge.difficulty === 'easy' ? 'קל' : 'בינוני'}
        </span>
      </div>

      <p className="text-[var(--foreground)] font-medium mb-4 text-base">{challenge.description}</p>

      {challenge.rules && (
        <p className="text-sm text-[var(--muted-foreground)] mb-4 font-medium p-3 rounded-xl bg-gray-50">💡 {challenge.rules}</p>
      )}

      {challenge.completed ? (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-[var(--accent)]/15">
          <Check size={24} className="text-[var(--accent)]" />
          <span className="font-semibold text-[var(--foreground)]">בוצע! כל הכבוד 🎉</span>
        </div>
      ) : (
        <Button
          variant="primary"
          fullWidth
          icon={<Check size={18} />}
          onClick={onComplete}
        >
          סמן כבוצע
        </Button>
      )}
    </div>
  )
}
