'use client'

import { Target, Check } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
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
    <Card 
      className="fade-in stagger-5"
      highlight={!challenge.completed}
    >
      <CardHeader
        title="אתגר היום"
        subtitle={challenge.title}
        icon={<Target size={20} />}
        action={
          <span className={`text-xs px-2 py-1 rounded-full ${
            challenge.difficulty === 'easy' 
              ? 'bg-emerald-100 text-emerald-600' 
              : 'bg-amber-100 text-amber-600'
          }`}>
            {challenge.difficulty === 'easy' ? 'קל' : 'בינוני'}
          </span>
        }
      />

      <p className="text-gray-600 mb-4">{challenge.description}</p>

      {challenge.rules && (
        <p className="text-sm text-gray-400 mb-4 italic">💡 {challenge.rules}</p>
      )}

      {challenge.completed ? (
        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-100 text-emerald-600">
          <Check size={20} />
          <span className="font-medium">בוצע! כל הכבוד 🎉</span>
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
    </Card>
  )
}
