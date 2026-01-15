'use client'

import { useMemo } from 'react'
import { Scale, Edit, Sparkles, TrendingUp, Footprints } from 'lucide-react'
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
      <section className="py-10">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20">
            <Sparkles className="w-5 h-5 text-violet-400" />
          </div>
          <h3 className="font-bold text-lg text-white">פעילות אחרונה</h3>
        </div>
        <div className="text-center py-16 rounded-3xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-white/10 backdrop-blur-xl">
          <div className="text-6xl mb-4">🚀</div>
          <div className="text-white/70 text-base font-medium">
            אין פעילות עדיין. התחל להזין נתונים!
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-10">
      {/* Header with gradient accent */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-gradient-to-br from-violet-500/30 to-fuchsia-500/30 shadow-lg shadow-violet-500/20">
          <Sparkles className="w-5 h-5 text-violet-300" />
        </div>
        <h3 className="font-bold text-lg bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
          פעילות אחרונה
        </h3>
        <div className="flex-1 h-px bg-gradient-to-l from-transparent via-white/20 to-transparent" />
      </div>

      {/* Activity list with modern cards */}
      <div className="space-y-3">
        {activities.map((activity, index) => {
          const isWalking = activity.type === 'walking'
          const date = isWalking
            ? activity.date
            : (activity.record as Tables<'weight_records'>).recorded_at
          
          return (
            <div
              key={activity.id}
              className={`
                group relative overflow-hidden
                flex items-center justify-between p-4 rounded-2xl
                bg-gradient-to-br backdrop-blur-xl
                border border-white/10
                shadow-lg hover:shadow-xl
                transition-all duration-300 ease-out
                hover:scale-[1.02] hover:-translate-y-0.5
                ${isWalking 
                  ? 'from-emerald-500/10 via-teal-500/5 to-transparent hover:from-emerald-500/20 hover:via-teal-500/10' 
                  : 'from-blue-500/10 via-cyan-500/5 to-transparent hover:from-blue-500/20 hover:via-cyan-500/10'
                }
              `}
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              {/* Glow effect on hover */}
              <div className={`
                absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500
                ${isWalking 
                  ? 'bg-gradient-to-r from-emerald-500/10 via-transparent to-transparent' 
                  : 'bg-gradient-to-r from-blue-500/10 via-transparent to-transparent'
                }
              `} />

              {/* Left accent bar with gradient */}
              <div className={`
                absolute right-0 top-2 bottom-2 w-1 rounded-full
                ${isWalking 
                  ? 'bg-gradient-to-b from-emerald-400 via-teal-400 to-emerald-500' 
                  : 'bg-gradient-to-b from-blue-400 via-cyan-400 to-blue-500'
                }
              `} />

              <div className="flex items-center gap-4 flex-1 pr-4 relative z-10">
                {/* Icon with gradient background */}
                <div className={`
                  relative p-3 rounded-xl
                  ${isWalking 
                    ? 'bg-gradient-to-br from-emerald-500/30 to-teal-500/20 shadow-lg shadow-emerald-500/20' 
                    : 'bg-gradient-to-br from-blue-500/30 to-cyan-500/20 shadow-lg shadow-blue-500/20'
                  }
                `}>
                  {isWalking ? (
                    <Footprints className="w-5 h-5 text-emerald-300" />
                  ) : (
                    <Scale className="w-5 h-5 text-blue-300" />
                  )}
                  
                  {/* Sparkle decoration */}
                  <div className={`
                    absolute -top-1 -right-1 w-2 h-2 rounded-full
                    ${isWalking ? 'bg-emerald-400' : 'bg-blue-400'}
                    animate-pulse
                  `} />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Value with gradient text */}
                  <div className={`
                    font-black text-xl mb-0.5
                    ${isWalking 
                      ? 'bg-gradient-to-r from-emerald-300 to-teal-200' 
                      : 'bg-gradient-to-r from-blue-300 to-cyan-200'
                    }
                    bg-clip-text text-transparent
                  `}>
                    {activity.value}
                  </div>
                  
                  {/* Date with subtle styling */}
                  <div className="text-xs text-white/50 font-medium">
                    {formatDate(date, 'EEEE, d/M בשעה HH:mm')}
                  </div>
                </div>

                {/* Type badge */}
                <div className={`
                  px-3 py-1 rounded-full text-xs font-bold
                  ${isWalking 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                    : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  }
                `}>
                  {isWalking ? 'הליכה' : 'משקל'}
                </div>
              </div>

              {/* Edit button */}
              {((isWalking && onEditWalking) || (!isWalking && onEditWeight)) && (
                <button
                  onClick={() => {
                    if (isWalking && onEditWalking) {
                      onEditWalking(activity.record as Tables<'steps_records'>)
                    } else if (!isWalking && onEditWeight) {
                      onEditWeight(activity.record as Tables<'weight_records'>)
                    }
                  }}
                  className={`
                    relative z-10 p-2.5 rounded-xl
                    text-white/40 hover:text-white
                    bg-white/5 hover:bg-white/15
                    border border-transparent hover:border-white/20
                    transition-all duration-300
                    hover:scale-110 active:scale-95
                    hover:shadow-lg
                  `}
                  title="עריכה"
                >
                  <Edit size={16} />
                </button>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom gradient fade */}
      {activities.length >= 5 && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 text-sm">
            <TrendingUp size={14} />
            <span>מציג {activities.length} פעילויות אחרונות</span>
          </div>
        </div>
      )}
    </section>
  )
}
