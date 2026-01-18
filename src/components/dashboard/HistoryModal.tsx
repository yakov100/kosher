'use client'

import { useMemo, useState } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Footprints, Scale, Edit, Trash2, Plus, TrendingUp, TrendingDown, Minus, AlertTriangle, History } from 'lucide-react'
import { formatDate } from '@/lib/utils'
import type { Tables } from '@/types/database'

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
}: HistoryModalProps) {
  const isWalking = type === 'walking'
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

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title={title} 
      size="lg"
      icon={isWalking ? <Footprints className="w-6 h-6 text-white" /> : <Scale className="w-6 h-6 text-white" />}
    >
      {/* Add New Button - Elegant */}
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
    </Modal>
  )
}
