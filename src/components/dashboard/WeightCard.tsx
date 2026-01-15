'use client'

import { useState } from 'react'
import { Scale, Plus, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { WeightEntryModal } from '@/components/weight/WeightEntryModal'
import { formatDate } from '@/lib/utils'
import type { Tables } from '@/types/database'

interface WeightCardProps {
  latestWeight: Tables<'weight_records'> | undefined
  previousWeight: Tables<'weight_records'> | undefined
  onUpdate: () => void
}

export function WeightCard({ latestWeight, previousWeight, onUpdate }: WeightCardProps) {
  const [showModal, setShowModal] = useState(false)

  const hasData = !!latestWeight
  const weight = latestWeight?.weight || 0
  const prevWeight = previousWeight?.weight

  let trend: 'up' | 'down' | 'stable' | null = null
  let trendValue = 0

  if (prevWeight && weight) {
    trendValue = Number((weight - prevWeight).toFixed(1))
    if (trendValue > 0.1) trend = 'up'
    else if (trendValue < -0.1) trend = 'down'
    else trend = 'stable'
  }

  return (
    <>
      <Card className="fade-in stagger-2">
        <CardHeader
          title="משקל"
          icon={<Scale size={20} />}
          action={
            <Button
              variant="ghost"
              size="sm"
              icon={<Plus size={16} />}
              onClick={() => setShowModal(true)}
            >
              הזנה
            </Button>
          }
        />

        {hasData ? (
          <div className="flex items-end justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-black text-black">{weight}</span>
                <span className="text-xl font-bold text-gray-600">ק״ג</span>
              </div>
              <div className="text-sm font-medium text-gray-600 mt-1">
                {formatDate(latestWeight.recorded_at, 'dd/MM בשעה HH:mm')}
              </div>
            </div>

            {trend && (
              <div className={`flex items-center gap-1 px-3 py-2 rounded-xl border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] font-bold text-sm ${
                trend === 'down' ? 'bg-[var(--accent)] text-black' :
                trend === 'up' ? 'bg-[var(--secondary)] text-white' :
                'bg-gray-200 text-black'
              }`}>
                {trend === 'down' && <TrendingDown size={16} />}
                {trend === 'up' && <TrendingUp size={16} />}
                {trend === 'stable' && <Minus size={16} />}
                <span>
                  {trend === 'stable' ? 'יציב' : `${Math.abs(trendValue)} ק״ג`}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-600">
            <div className="text-xl font-bold mb-2">לא הוזן משקל עדיין</div>
            <div className="text-sm font-medium">לחץ להזנת משקל</div>
          </div>
        )}
      </Card>

      <WeightEntryModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => {
          setShowModal(false)
          onUpdate()
        }}
      />
    </>
  )
}
