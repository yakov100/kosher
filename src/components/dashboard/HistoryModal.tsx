'use client'

import { useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Footprints, Scale, Edit, Trash2, Plus, TrendingUp, TrendingDown, Minus, AlertTriangle, History, ChartBar } from 'lucide-react'
import { formatDate, calculateMovingAverage } from '@/lib/utils'
import { WalkingChart } from '@/components/steps/StepsChart'
import { WeightChart } from '@/components/weight/WeightChart'
import type { Tables } from '@/types/database'

type TabType = 'history' | 'charts'

interface HistoryModalProps {
  isOpen: boolean
  onClose: () => void
  type: 'walking' | 'weight'
  walkingRecords?: Tables<'steps_records'>[]
  weightRecords?: Tables<'weight_records'>[]
  onEditWalking?: (record: Tables<'steps_records'>) => void
  onEditWeight?: (record: Tables<'weight_records'>) => void
  onDeleteWalking?: (id: string) => void
  onDeleteWeight?: (id: string) => void
  onAddNew: () => void
  dailyGoal?: number
}

export function HistoryModal({
  isOpen,
  onClose,
  type,
  walkingRecords = [],
  weightRecords = [],
  onEditWalking,
  onEditWeight,
  onDeleteWalking,
  onDeleteWeight,
  onAddNew,
  dailyGoal = 30,
}: HistoryModalProps) {
  const isWalking = type === 'walking'
  const [activeTab, setActiveTab] = useState<TabType>('history')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  // Sort records by date descending
  const sortedWalkingRecords = useMemo(() =>
    [...walkingRecords].sort((a, b) => b.date.localeCompare(a.date)),
    [walkingRecords]
  )

  const sortedWeightRecords = useMemo(() =>
    [...weightRecords].sort((a, b) =>
      new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime()
    ),
    [weightRecords]
  )

  // Calculate weight changes
  const weightChanges = useMemo(() => {
    const changes: Record<string, number | null> = {}
    for (let i = 0; i < sortedWeightRecords.length; i++) {
      const current = sortedWeightRecords[i]
      const previous = sortedWeightRecords[i + 1]
      changes[current.id] = previous ? +(current.weight - previous.weight).toFixed(1) : null
    }
    return changes
  }, [sortedWeightRecords])

  // Chart data for walking
  const walkingChartData = useMemo(() => {
    const data = walkingRecords
      .map(r => ({ date: r.date, value: r.minutes }))
      .sort((a, b) => a.date.localeCompare(b.date))
    const withMovingAvg = calculateMovingAverage(data, 7)
    return withMovingAvg.map(d => ({
      date: d.date,
      minutes: d.value,
      movingAvg: d.movingAvg,
      hasData: true
    }))
  }, [walkingRecords])

  // Chart data for weight
  const weightChartData = useMemo(() => {
    const data = weightRecords
      .map(w => ({ date: w.recorded_at.split('T')[0], value: Number(w.weight) }))
      .sort((a, b) => a.date.localeCompare(b.date))
    return calculateMovingAverage(data, 7)
  }, [weightRecords])

  const title = isWalking ? 'היסטוריית הליכות' : 'היסטוריית משקל'
  const emptyMessage = isWalking ? 'אין רשומות הליכה עדיין' : 'אין רשומות משקל עדיין'
  const emptyEmoji = isWalking ? '🚶' : '⚖️'

  const records = isWalking ? sortedWalkingRecords : sortedWeightRecords
  const hasRecords = records.length > 0

  const handleDeleteConfirm = async (id: string) => {
    setIsDeleting(true)
    try {
      if (isWalking && onDeleteWalking) {
        await onDeleteWalking(id)
      } else if (!isWalking && onDeleteWeight) {
        await onDeleteWeight(id)
      }
    } finally {
      setIsDeleting(false)
      setDeleteConfirmId(null)
    }
  }

  const tabs = [
    { id: 'history' as TabType, label: 'היסטוריה', icon: History },
    { id: 'charts' as TabType, label: 'גרפים', icon: ChartBar },
  ]

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title} 
      size="lg"
      icon={isWalking ? <Footprints className="w-6 h-6 text-white" /> : <Scale className="w-6 h-6 text-white" />}
    >
      {/* Tab Navigation */}
      <div className="flex gap-2 p-1 bg-white/95 backdrop-blur-sm rounded-2xl shadow-md border border-white/20 mb-5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`
              flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl
              font-semibold text-sm transition-all duration-300
              ${activeTab === tab.id 
                ? `${isWalking 
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
                    : 'bg-gradient-to-r from-blue-500 to-cyan-500'
                  } text-white shadow-md scale-[1.02]` 
                : 'text-slate-600 hover:text-slate-800 hover:bg-slate-50'
              }
            `}
          >
            <tab.icon size={18} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Add New Button - Elegant (only in history tab) */}
      {activeTab === 'history' && (
      <button
        onClick={onAddNew}
        className={`
          w-full mb-5 py-3 px-4 rounded-xl
          flex items-center justify-center gap-2
          font-semibold text-white text-sm
          transition-all shadow-md hover:shadow-lg
          ${isWalking
            ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/25'
            : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 shadow-blue-500/25'
          }
        `}
      >
        <Plus size={18} />
        <span>{isWalking ? 'הוסף הליכה חדשה' : 'הוסף משקל חדש'}</span>
      </button>
      )}

      {/* History Tab Content */}
      {activeTab === 'history' && (
      <>
      {/* Records List */}
      <div className="max-h-[60vh] overflow-y-auto space-y-2.5 custom-scrollbar">
        {!hasRecords ? (
          <div className="text-center py-16 rounded-xl bg-slate-50 border border-slate-200">
            <div className="text-5xl mb-4">{emptyEmoji}</div>
            <div className="text-slate-600 text-sm font-medium">
              {emptyMessage}
            </div>
          </div>
        ) : isWalking ? (
          // Walking Records
          sortedWalkingRecords.map((record, index) => (
            <div
              key={record.id}
              className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-gradient-to-br hover:from-emerald-50/50 hover:to-teal-50/30 transition-all shadow-sm hover:shadow"
            >
              <div className="flex items-center gap-3 flex-1 min-w-0">
                {/* Icon */}
                <div className="p-2.5 rounded-lg bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-sm flex-shrink-0">
                  <Footprints className="w-4 h-4 text-white" />
                </div>

                <div className="flex-1 min-w-0">
                  {/* Value */}
                  <div className="flex items-baseline gap-1.5 mb-0.5">
                    <span className="font-bold text-base text-slate-900">
                      {record.minutes}
                    </span>
                    <span className="text-xs font-medium text-slate-500">
                      דקות
                    </span>
                  </div>

                  {/* Date */}
                  <div className="text-xs text-slate-600 font-medium">
                    {formatDate(record.date, 'd בMMMM yyyy')}
                  </div>

                  {/* Note */}
                  {record.note && (
                    <div className="text-xs text-slate-500 mt-1 truncate">
                      {record.note}
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                {deleteConfirmId === record.id ? (
                  // Delete confirmation
                  <div className="flex items-center gap-1.5 bg-rose-50 rounded-lg p-1.5 border border-rose-200">
                    <button
                      onClick={() => handleDeleteConfirm(record.id)}
                      disabled={isDeleting}
                      className="px-2 py-1 rounded-md bg-rose-500 text-white text-xs font-medium hover:bg-rose-600 transition-colors disabled:opacity-50"
                    >
                      מחק
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(null)}
                      className="px-2 py-1 rounded-md bg-white text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors"
                    >
                      ביטול
                    </button>
                  </div>
                ) : (
                  <>
                    {onEditWalking && (
                      <button
                        onClick={() => onEditWalking(record)}
                        className="p-2 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                        title="עריכה"
                      >
                        <Edit size={16} />
                      </button>
                    )}
                    {onDeleteWalking && (
                      <button
                        onClick={() => setDeleteConfirmId(record.id)}
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="מחיקה"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          ))
        ) : (
          // Weight Records
          sortedWeightRecords.map((record, index) => {
            const change = weightChanges[record.id]

            return (
              <div
                key={record.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-white border border-slate-200 hover:border-blue-300 hover:bg-gradient-to-br hover:from-blue-50/50 hover:to-cyan-50/30 transition-all shadow-sm hover:shadow"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Icon */}
                  <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 shadow-sm flex-shrink-0">
                    <Scale className="w-4 h-4 text-white" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 mb-0.5">
                      {/* Value */}
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold text-base text-slate-900">
                          {record.weight}
                        </span>
                        <span className="text-xs font-medium text-slate-500">
                          ק״ג
                        </span>
                      </div>

                      {/* Change indicator - Minimal Badge */}
                      {change !== null && (
                        <div className={`
                          flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium
                          ${change < 0
                            ? 'bg-emerald-100 text-emerald-700'
                            : change > 0
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-slate-100 text-slate-600'
                          }
                        `}>
                          {change < 0 ? (
                            <>
                              <TrendingDown size={12} />
                              <span>{change}</span>
                            </>
                          ) : change > 0 ? (
                            <>
                              <TrendingUp size={12} />
                              <span>+{change}</span>
                            </>
                          ) : (
                            <span>—</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Date */}
                    <div className="text-xs text-slate-600 font-medium">
                      {formatDate(record.recorded_at, 'd בMMMM בשעה HH:mm')}
                    </div>

                    {/* Note */}
                    {record.note && (
                      <div className="text-xs text-slate-500 mt-1 truncate">
                        {record.note}
                      </div>
                    )}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {deleteConfirmId === record.id ? (
                    // Delete confirmation
                    <div className="flex items-center gap-1.5 bg-rose-50 rounded-lg p-1.5 border border-rose-200">
                      <button
                        onClick={() => handleDeleteConfirm(record.id)}
                        disabled={isDeleting}
                        className="px-2 py-1 rounded-md bg-rose-500 text-white text-xs font-medium hover:bg-rose-600 transition-colors disabled:opacity-50"
                      >
                        מחק
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2 py-1 rounded-md bg-white text-slate-600 text-xs font-medium hover:bg-slate-100 transition-colors"
                      >
                        ביטול
                      </button>
                    </div>
                  ) : (
                    <>
                      {onEditWeight && (
                        <button
                          onClick={() => onEditWeight(record)}
                          className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                          title="עריכה"
                        >
                          <Edit size={16} />
                        </button>
                      )}
                      {onDeleteWeight && (
                        <button
                          onClick={() => setDeleteConfirmId(record.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                          title="מחיקה"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Summary */}
      {hasRecords && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-100 text-slate-600 text-xs font-medium">
            <span>מציג {records.length} רשומות</span>
          </div>
        </div>
      )}
      </>
      )}

      {/* Charts Tab Content */}
      {activeTab === 'charts' && (
        <div className="space-y-6">
        <style jsx>{`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .animate-fadeIn {
            animation: fadeIn 0.3s ease-out forwards;
          }
        `}</style>
        <div className="animate-fadeIn">
          {isWalking ? (
            walkingChartData.length > 0 ? (
              <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-emerald-100">
                    <Footprints className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">הליכה</h3>
                    <p className="text-xs text-slate-600">30 ימים אחרונים</p>
                  </div>
                </div>
                <WalkingChart data={walkingChartData} goal={dailyGoal} />
              </div>
            ) : (
              <div className="text-center py-16 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-50 border border-slate-200">
                <div className="text-5xl mb-4">📊</div>
                <div className="text-slate-600 font-medium">
                  אין מספיק נתונים להצגת גרף
                </div>
              </div>
            )
          ) : (
            weightChartData.length > 0 ? (
              <div className="p-5 rounded-3xl bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-blue-100">
                    <Scale className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-800">משקל</h3>
                    <p className="text-xs text-slate-600">30 ימים אחרונים</p>
                  </div>
                </div>
                <WeightChart data={weightChartData} />
              </div>
            ) : (
              <div className="text-center py-16 rounded-3xl bg-gradient-to-br from-slate-50 to-slate-50 border border-slate-200">
                <div className="text-5xl mb-4">📊</div>
                <div className="text-slate-600 font-medium">
                  אין מספיק נתונים להצגת גרף
                </div>
              </div>
            )
          )}
        </div>
        </div>
      )}
    </Modal>
  )
}
