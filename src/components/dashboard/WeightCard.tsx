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
                <span className="text-4xl font-bold text-gray-700">{weight}</span>
                <span className="text-lg text-gray-400">ק״ג</span>
              </div>
              <div className="text-sm text-gray-400 mt-1">
                {formatDate(latestWeight.recorded_at, 'dd/MM בשעה HH:mm')}
              </div>
            </div>

            {trend && (
              <div className={`flex items-center gap-1 px-3 py-1.5 rounded-lg ${
                trend === 'down' ? 'bg-emerald-100 text-emerald-600' :
                trend === 'up' ? 'bg-orange-100 text-orange-600' :
                'bg-gray-100 text-gray-500'
              }`}>
                {trend === 'down' && <TrendingDown size={16} />}
                {trend === 'up' && <TrendingUp size={16} />}
                {trend === 'stable' && <Minus size={16} />}
                <span className="text-sm font-medium">
                  {trend === 'stable' ? 'יציב' : `${Math.abs(trendValue)} ק״ג`}
                </span>
              </div>
            )}
          </div>
        ) : (
          <div className="text-gray-500">
            <div className="text-lg mb-1">לא הוזן משקל עדיין</div>
            <div className="text-sm">לחץ להזנת משקל</div>
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
