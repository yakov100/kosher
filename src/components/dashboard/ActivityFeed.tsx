'use client'

import { useMemo } from 'react'
import { Timer, Scale, Edit } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Tables } from '@/types/database'

interface ActivityFeedProps {
  walkingRecords: Tables<'steps_records'>[]
  weightRecords: Tables<'weight_records'>[]
  onEditWalking?: (record: Tables<'steps_records'>) => void
  onEditWeight?: (record: Tables<'weight_records'>) => void
  limit?: number
}

type ActivityItem = {
  id: string
  type: 'walking' | 'weight'
  date: string
  value: string
  record: Tables<'steps_records'> | Tables<'weight_records'>
}

export function ActivityFeed({ 
  walkingRecords, 
  weightRecords, 
  onEditWalking,
  onEditWeight,
  limit = 15 
}: ActivityFeedProps) {
  const activities = useMemo(() => {
    const items: ActivityItem[] = []

    // Add walking records
    walkingRecords.forEach(record => {
      items.push({
        id: `walking-${record.id}`,
        type: 'walking',
        date: record.date,
        value: `${record.minutes} דק׳`,
        record,
      })
    })

    // Add weight records
    weightRecords.forEach(record => {
      items.push({
        id: `weight-${record.id}`,
        type: 'weight',
        date: record.recorded_at.split('T')[0],
        value: `${record.weight} ק״ג`,
        record,
      })
    })

    // Sort by date descending
    return items
      .sort((a, b) => {
        const dateA = new Date(a.type === 'walking' 
          ? a.date 
          : (a.record as Tables<'weight_records'>).recorded_at)
        const dateB = new Date(b.type === 'walking' 
          ? b.date 
          : (b.record as Tables<'weight_records'>).recorded_at)
        return dateB.getTime() - dateA.getTime()
      })
      .slice(0, limit)
  }, [walkingRecords, weightRecords, limit])

  if (activities.length === 0) {
    return (
      <section className="py-10 border-t border-gray-200">
        <h3 className="font-semibold text-base text-[var(--foreground)] mb-6">פעילות אחרונה</h3>
        <div className="text-center py-12 text-[var(--muted-foreground)] text-sm">
          אין פעילות עדיין. התחל להזין נתונים!
        </div>
      </section>
    )
  }

  return (
    <section className="py-10 border-t border-gray-200">
      <h3 className="font-semibold text-base text-[var(--foreground)] mb-6">פעילות אחרונה</h3>
      <div className="space-y-3">
        {activities.map(activity => {
          const isWalking = activity.type === 'walking'
          const date = isWalking
            ? activity.date
            : (activity.record as Tables<'weight_records'>).recorded_at
          
          return (
            <div
              key={activity.id}
              className="flex items-center justify-between p-4 rounded-xl bg-white border-r-4 shadow-sm hover:shadow-md transition-all duration-300"
              style={{
                borderRightColor: isWalking ? 'var(--primary)' : 'var(--secondary)'
              }}
            >
              <div className="flex items-center gap-4 flex-1">
                <div className={`p-3 rounded-xl ${
                  isWalking 
                    ? 'bg-[var(--primary)]/15' 
                    : 'bg-[var(--secondary)]/15'
                }`}>
                  {isWalking ? (
                    <Timer className={`w-5 h-5 ${
                      isWalking ? 'text-[var(--primary)]' : 'text-[var(--secondary)]'
                    }`} />
                  ) : (
                    <Scale className="w-5 h-5 text-[var(--secondary)]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-[var(--foreground)] mb-1">
                    {activity.value}
                  </div>
                  <div className="text-xs text-[var(--muted-foreground)]">
                    {formatDate(date, 'EEEE, d/M בשעה HH:mm')}
                  </div>
                </div>
              </div>
              {((isWalking && onEditWalking) || (!isWalking && onEditWeight)) && (
                <button
                  onClick={() => {
                    if (isWalking && onEditWalking) {
                      onEditWalking(activity.record as Tables<'steps_records'>)
                    } else if (!isWalking && onEditWeight) {
                      onEditWeight(activity.record as Tables<'weight_records'>)
                    }
                  }}
                  className="p-2 rounded-xl text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-gray-50 transition-colors"
                  title="עריכה"
                >
                  <Edit size={16} />
                </button>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}
