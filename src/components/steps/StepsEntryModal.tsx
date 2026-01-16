'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useWalking } from '@/hooks/useSupabase'
import { getToday, formatDate } from '@/lib/utils'
import { Trash2, X, AlertTriangle } from 'lucide-react'
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
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          type="date"
          label="תאריך"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          max={getToday()}
        />

        <Input
          type="number"
          label="דקות הליכה"
          placeholder="לדוגמה: 30"
          value={minutes}
          onChange={(e) => setMinutes(e.target.value)}
          min={0}
          autoFocus
        />

        {/* Quick select buttons */}
        <div className="flex flex-wrap gap-2">
          {[10, 15, 20, 30, 45, 60].map(num => (
            <button
              key={num}
              type="button"
              onClick={() => setMinutes(num.toString())}
              className={`px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                minutes === num.toString()
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/30 scale-105'
                  : 'bg-white/10 text-white/70 border border-white/10 hover:bg-white/20 hover:border-white/20 hover:text-white'
              }`}
            >
              {num} דק׳
            </button>
          ))}
        </div>

        <Input
          label="הערה (אופציונלי)"
          placeholder="הליכה בפארק..."
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 120))}
          hint={`${note.length}/120`}
        />

        {error && (
          <p className="text-sm text-rose-300 bg-rose-500/20 border border-rose-500/30 p-4 rounded-xl backdrop-blur-sm">{error}</p>
        )}

        {existingRecord && !showDeleteConfirm && (
          <p className="text-sm text-amber-300 bg-amber-500/20 border border-amber-500/30 p-4 rounded-xl backdrop-blur-sm">
            📝 קיימת רשומה ל-{formatDate(existingRecord.date)} - השמירה תעדכן אותה
          </p>
        )}

        {/* Delete confirmation */}
        {showDeleteConfirm && existingRecord && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/20 via-pink-500/10 to-red-500/20 border border-rose-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/40 to-pink-500/40 border border-rose-400/30 shadow-lg shadow-rose-500/20 animate-pulse">
                <AlertTriangle className="w-6 h-6 text-rose-300" />
              </div>
              <div>
                <p className="font-bold text-rose-200 mb-1">מחיקת רשומה</p>
                <p className="text-sm text-rose-300/80">
                  {formatDate(existingRecord.date)}
                </p>
              </div>
            </div>
            <p className="text-sm text-white/70 mb-5 pr-14">
              פעולה זו לא ניתנת לביטול. האם להמשיך?
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="group flex-1 relative py-3 px-4 rounded-xl overflow-hidden font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <div className="absolute inset-0 bg-white/10 group-hover:bg-white/20 transition-all duration-300" />
                <div className="absolute inset-0 border border-white/20 group-hover:border-white/30 rounded-xl transition-all duration-300" />
                <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                  <X size={18} />
                  ביטול
                </span>
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="group flex-1 relative py-3 px-4 rounded-xl overflow-hidden font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:hover:scale-100"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-rose-500 via-pink-500 to-rose-500 bg-[length:200%_100%] group-hover:animate-shimmer" />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 blur-xl bg-rose-500/50 transition-opacity duration-300" />
                <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                  <Trash2 size={18} className={deleting ? 'animate-bounce' : ''} />
                  {deleting ? 'מוחק...' : 'אישור מחיקה'}
                </span>
              </button>
            </div>
          </div>
        )}

        {!showDeleteConfirm && (
          <div className="flex gap-3 pt-2">
            {existingRecord && (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="group relative p-3 rounded-2xl overflow-hidden transition-all duration-300 hover:scale-110 active:scale-95"
                title="מחיקה"
              >
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-rose-500/20 via-pink-500/20 to-red-500/20 group-hover:from-rose-500/40 group-hover:via-pink-500/40 group-hover:to-red-500/40 transition-all duration-300" />
                <div className="absolute inset-0 border border-rose-500/30 group-hover:border-rose-400/50 rounded-2xl transition-all duration-300" />
                {/* Glow effect on hover */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 blur-xl bg-rose-500/30 transition-opacity duration-300" />
                {/* Icon with animation */}
                <Trash2 
                  size={20} 
                  className="relative z-10 text-rose-400 group-hover:text-rose-300 transition-all duration-300 group-hover:rotate-12" 
                />
              </button>
            )}
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
              className="flex-1"
            >
              ביטול
            </Button>
            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className="flex-1"
            >
              שמור
            </Button>
          </div>
        )}
      </form>
    </Modal>
  )
}

// Backward compatibility alias
export { WalkingEntryModal as StepsEntryModal }
