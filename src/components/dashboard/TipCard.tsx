'use client'

import { useState } from 'react'
import { Lightbulb, ChevronDown, ChevronUp } from 'lucide-react'
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
    <div className="py-5 bg-[var(--card)] rounded-xl shadow-sm p-6">
      <div className="flex items-start justify-between mb-4 gap-3">
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-3 rounded-xl bg-[var(--primary)]/15">
            <Lightbulb size={20} className="text-[var(--primary)]" />
          </div>
          <div className="min-w-0">
            <h3 className="font-semibold text-base text-[var(--foreground)] leading-tight">טיפ היום</h3>
            <p className="text-sm font-medium text-[var(--muted-foreground)] mt-1 break-words">{tip.title}</p>
          </div>
        </div>
        <span className={`text-xs font-semibold px-3 py-1.5 rounded-xl shrink-0 ${
          tip.category === 'walking' ? 'bg-[var(--accent)]/20 text-[var(--accent)]' :
          tip.category === 'consistency' ? 'bg-[var(--primary)]/20 text-[var(--primary)]' :
          tip.category === 'weighing' ? 'bg-[var(--secondary)]/20 text-[var(--secondary)]' :
          'bg-[var(--muted)] text-[var(--foreground)]'
        }`}>
          {categoryLabels[tip.category]}
        </span>
      </div>

      <p className="text-[var(--foreground)] font-medium leading-relaxed text-base mb-4">{tip.body}</p>

      {tip.extended_body && (
        <>
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--card-hover)] px-3 py-2 rounded-xl border border-[var(--border)] hover:border-[var(--muted-foreground)] mt-4 transition-all"
          >
            {expanded ? (
              <>
                <ChevronUp size={18} />
                הסתר פרטים
              </>
            ) : (
              <>
                <ChevronDown size={18} />
                קרא עוד
              </>
            )}
          </button>

          {expanded && (
            <p className="text-sm text-[var(--foreground)] font-medium mt-3 p-4 rounded-xl bg-[var(--muted)] leading-relaxed">
              {tip.extended_body}
            </p>
          )}
        </>
      )}
    </div>
  )
}
