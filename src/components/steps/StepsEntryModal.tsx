'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useWalking } from '@/hooks/useSupabase'
import { getToday, formatDate } from '@/lib/utils'
import { Trash2, X, AlertTriangle, Footprints } from 'lucide-react'
import type { Tables } from '@/types/database'

interface WalkingEntryModalProps {
  isOpen: boolean
  onClose: () => void
  existingRecord?: Tables<'steps_records'>
  defaultDate?: string
  onSuccess: () => void
  onDelete?: () => void
}

export function WalkingEntryModal({
  isOpen,
  onClose,
  existingRecord,
  defaultDate,
  onSuccess,
  onDelete,
}: WalkingEntryModalProps) {
  const { addOrUpdateRecord, deleteRecord } = useWalking()
  const [date, setDate] = useState(defaultDate || getToday())
  const [minutes, setMinutes] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (existingRecord) {
      setDate(existingRecord.date)
      setMinutes(existingRecord.minutes.toString())
      setNote(existingRecord.note || '')
    } else {
      setDate(defaultDate || getToday())
      setMinutes('')
      setNote('')
    }
  }, [existingRecord, defaultDate, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const minutesNum = parseInt(minutes)
    if (isNaN(minutesNum) || minutesNum < 0) {
      setError('נא להזין מספר דקות תקין')
      return
    }

    if (minutesNum > 480) {
      setError('מספר הדקות נראה גבוה מדי (יותר מ-8 שעות). האם אתה בטוח?')
      return
    }

    if (date > getToday()) {
      setError('לא ניתן להזין דקות לתאריך עתידי')
      return
    }

    setLoading(true)
    try {
      await addOrUpdateRecord(date, minutesNum, note || undefined)
      onSuccess()
    } catch (err) {
      console.error(err)
      setError('שגיאה בשמירת הנתונים')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!existingRecord) return
    
    setDeleting(true)
    try {
      await deleteRecord(existingRecord.id)
      setShowDeleteConfirm(false)
      onDelete?.()
      onClose()
    } catch (err) {
      console.error(err)
      setError('שגיאה במחיקת הנתונים')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingRecord ? 'עריכת הליכה' : 'הזנת דקות הליכה'}
      icon={<Footprints className="w-6 h-6 text-white" />}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Date Input */}
        <Input
          type="date"
          label="תאריך"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={getToday()}
        />

        {/* Minutes Input */}
        <Input
          type="number"
          label="דקות הליכה"
          placeholder="הזן מספר דקות"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          min={0}
          autoFocus
        />

        {/* Quick select buttons - Elegant Design */}
        <div>
          <p className="text-xs font-medium text-slate-500 mb-2.5">בחירה מהירה</p>
          <div className="grid grid-cols-3 gap-2">
            {[10, 15, 20, 30, 45, 60].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => setMinutes(num.toString())}
                className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  minutes === num.toString()
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/25 scale-[1.02]'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-emerald-300 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 active:scale-95 shadow-sm'
                }`}
              >
                {num} דק׳
              </button>
            ))}
          </div>
        </div>

        {/* Note Input */}
        <Input
          label="הערה (אופציונלי)"
          placeholder="הליכה בפארק..."
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 120))}
          hint={`${note.length}/120`}
        />

        {error && (
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200 shadow-sm">
            <p className="text-sm font-medium text-rose-700">{error}</p>
          </div>
        )}

        {existingRecord && !showDeleteConfirm && (
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-amber-50 to-yellow-50 border border-amber-200 shadow-sm">
            <p className="text-sm font-medium text-amber-700">
              קיימת רשומה ל-{formatDate(existingRecord.date, 'd בMMMM')} - השמירה תעדכן אותה
            </p>
          </div>
        )}

        {/* Delete confirmation - Elegant */}
        {showDeleteConfirm && existingRecord && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-rose-900 mb-1">מחיקת רשומה</p>
                <p className="text-xs text-slate-600">
                  {formatDate(existingRecord.date, 'd בMMMM')} • {existingRecord.minutes} דקות
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 mb-3 px-1">
              פעולה זו לא ניתנת לביטול
            </p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 px-3 rounded-lg font-medium text-sm bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
              >
                ביטול
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-2 px-3 rounded-lg font-medium text-sm bg-rose-500 text-white hover:bg-rose-600 transition-colors disabled:opacity-50"
              >
                {deleting ? 'מוחק...' : 'מחק'}
              </button>
            </div>
          </div>
        )}

        {!showDeleteConfirm && (
          <div className="flex gap-2 pt-3">
            {existingRecord && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2.5 rounded-lg text-rose-500 hover:bg-gradient-to-br hover:from-rose-50 hover:to-red-50 border border-slate-200 hover:border-rose-300 transition-all hover:scale-105 active:scale-95 shadow-sm"
                title="מחיקה"
              >
                <Trash2 size={18} />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 px-4 rounded-lg font-medium text-sm bg-white border border-slate-200 text-slate-700 hover:bg-gradient-to-br hover:from-slate-50 hover:to-slate-100 transition-all shadow-sm hover:shadow"
            >
              ביטול
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-2.5 px-4 rounded-lg font-medium text-sm bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700 transition-all disabled:opacity-50 shadow-md hover:shadow-lg shadow-emerald-500/25"
            >
              {loading ? 'שומר...' : 'שמור'}
            </button>
          </div>
        )}
      </form>
    </Modal>
  )
}

// Backward compatibility alias
export { WalkingEntryModal as StepsEntryModal }
