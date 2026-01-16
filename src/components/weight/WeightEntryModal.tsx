'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useWeight } from '@/hooks/useSupabase'
import { Trash2, X, AlertTriangle } from 'lucide-react'
import type { Tables } from '@/types/database'

interface WeightEntryModalProps {
  isOpen: boolean
  onClose: () => void
  existingRecord?: Tables<'weight_records'>
  onSuccess: () => void
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
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          type="number"
          label="משקל (ק״ג)"
          placeholder="לדוגמה: 75.5"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
          step="0.1"
          min={0}
          autoFocus
        />

        <div className="grid grid-cols-2 gap-4">
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

        <Input
          label="הערה (אופציונלי)"
          placeholder="אחרי אימון..."
          value={note}
          onChange={(e) => setNote(e.target.value.slice(0, 120))}
          hint={`${note.length}/120`}
        />

        {error && (
          <p className="text-sm text-rose-300 bg-rose-500/20 border border-rose-500/30 p-4 rounded-xl backdrop-blur-sm">{error}</p>
        )}

        {/* Delete confirmation */}
        {showDeleteConfirm && existingRecord && (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500/20 via-pink-500/10 to-red-500/20 border border-rose-500/30 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-rose-500/40 to-pink-500/40 border border-rose-400/30 shadow-lg shadow-rose-500/20 animate-pulse">
                <AlertTriangle className="w-6 h-6 text-rose-300" />
              </div>
              <div>
                <p className="font-bold text-rose-200 mb-1">מחיקת מדידה</p>
                <p className="text-sm text-rose-300/80">
                  {formatDateForDisplay(existingRecord.recorded_at)}
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
