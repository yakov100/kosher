'use client'

import { useState } from 'react'
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import type { Tables } from '@/types/database'

interface TipCardProps {
  tip: Tables<'tips'> | null
}

const categoryLabels: Record<string, string> = {
  walking: 'הליכה',
  consistency: 'עקביות',
  weighing: 'שקילה',
  lifestyle: 'אורח חיים',
}

const categoryColors: Record<string, string> = {
  walking: 'bg-emerald-100 text-emerald-600',
  consistency: 'bg-sky-100 text-sky-600',
  weighing: 'bg-violet-100 text-violet-600',
  lifestyle: 'bg-orange-100 text-orange-600',
}

export function TipCard({ tip }: TipCardProps) {
  const [expanded, setExpanded] = useState(false)

  if (!tip) return null

  return (
    <Card className="fade-in stagger-4">
      <CardHeader
        title="טיפ היום"
        subtitle={tip.title}
        icon={<Lightbulb size={20} />}
        action={
          <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[tip.category]}`}>
            {categoryLabels[tip.category]}
          </span>
        }
      />

      <p className="text-gray-600 leading-relaxed">{tip.body}</p>

      {tip.extended_body && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-500 mt-3 transition-colors"
          >
            {expanded ? (
              <>
                <ChevronUp size={16} />
                הסתר פרטים
              </>
            ) : (
              <>
                <ChevronDown size={16} />
                קרא עוד
              </>
            )}
          </button>

          {expanded && (
            <p className="text-sm text-gray-500 mt-3 p-3 rounded-lg bg-gray-50/80 leading-relaxed">
              {tip.extended_body}
            </p>
          )}
        </>
      )}
    </Card>
  )
}
