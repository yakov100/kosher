'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useWeight } from '@/hooks/useSupabase'
import { Trash2, X, AlertTriangle, Scale } from 'lucide-react'
import type { Tables } from '@/types/database'

interface WeightEntryModalProps {
  isOpen: boolean
  onClose: () => void
  existingRecord?: Tables<'weight_records'>
  onSuccess: (recordDate: string) => void
  onDelete?: () => void
}

export function WeightEntryModal({
  isOpen,
  onClose,
  existingRecord,
  onSuccess,
  onDelete,
}: WeightEntryModalProps) {
  const { addWeight, updateWeight, deleteWeight } = useWeight()
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (existingRecord) {
      setWeight(existingRecord.weight.toString())
      const dt = new Date(existingRecord.recorded_at)
      setDate(dt.toISOString().split('T')[0])
      setTime(dt.toTimeString().slice(0, 5))
      setNote(existingRecord.note || '')
    } else {
      setWeight('')
      const now = new Date()
      setDate(now.toISOString().split('T')[0])
      setTime(now.toTimeString().slice(0, 5))
      setNote('')
    }
  }, [existingRecord, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const weightNum = parseFloat(weight)
    if (isNaN(weightNum) || weightNum <= 0) {
      setError('נא להזין משקל תקין')
      return
    }

    if (weightNum < 20 || weightNum > 300) {
      setError('משקל נראה לא סביר. נא לבדוק את הערך')
      return
    }

    const recordedAt = new Date(`${date}T${time}`).toISOString()
    
    if (new Date(recordedAt) > new Date()) {
      setError('לא ניתן להזין משקל לתאריך עתידי')
      return
    }

    setLoading(true)
    try {
      if (existingRecord) {
        await updateWeight(existingRecord.id, {
          weight: weightNum,
          recorded_at: recordedAt,
          note: note || undefined,
        })
      } else {
        await addWeight(weightNum, recordedAt, note || undefined)
      }
      onSuccess(recordedAt)
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
      await deleteWeight(existingRecord.id)
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

  const formatDateForDisplay = (recordedAt: string) => {
    const dt = new Date(recordedAt)
    return dt.toLocaleDateString('he-IL', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingRecord ? 'עריכת משקל' : 'הזנת משקל'}
      icon={<Scale className="w-6 h-6 text-white" />}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Weight Input */}
        <Input
          type="number"
          label="משקל (ק״ג)"
          placeholder="הזן משקל"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          step="0.1"
          min={0}
          autoFocus
        />

        {/* Date and Time Grid */}
        <div className="grid grid-cols-2 gap-3">
          <Input
            type="date"
            label="תאריך"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
          <Input
            type="time"
            label="שעה"
            value={time}
            onChange={(e) => setTime(e.target.value)}
          />
        </div>

        {/* Note Input */}
        <Input
          label="הערה (אופציונלי)"
          placeholder="אחרי אימון..."
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 120))}
          hint={`${note.length}/120`}
        />

        {error && (
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-rose-50 to-red-50 border border-rose-200 shadow-sm">
            <p className="text-sm font-medium text-rose-700">{error}</p>
          </div>
        )}

        {/* Delete confirmation - Elegant */}
        {showDeleteConfirm && existingRecord && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200">
            <div className="flex items-start gap-3 mb-3">
              <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-sm text-rose-900 mb-1">מחיקת מדידה</p>
                <p className="text-xs text-slate-600">
                  {formatDateForDisplay(existingRecord.recorded_at)} • {existingRecord.weight} ק״ג
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
              className="flex-1 py-2.5 px-4 rounded-lg font-medium text-sm bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 transition-all disabled:opacity-50 shadow-md hover:shadow-lg shadow-blue-500/25"
            >
              {loading ? 'שומר...' : 'שמור'}
            </button>
          </div>
        )}
      </form>
    </Modal>
  )
}
