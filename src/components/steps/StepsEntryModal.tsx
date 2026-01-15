'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useWalking } from '@/hooks/useSupabase'
import { getToday, formatDate } from '@/lib/utils'
import type { Tables } from '@/types/database'

interface WalkingEntryModalProps {
  isOpen: boolean
  onClose: () => void
  existingRecord?: Tables<'steps_records'>
  defaultDate?: string
  onSuccess: () => void
}

export function WalkingEntryModal({
  isOpen,
  onClose,
  existingRecord,
  defaultDate,
  onSuccess,
}: WalkingEntryModalProps) {
  const { addOrUpdateRecord } = useWalking()
  const [date, setDate] = useState(defaultDate || getToday())
  const [minutes, setMinutes] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
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

        {existingRecord && (
          <p className="text-sm text-amber-300 bg-amber-500/20 border border-amber-500/30 p-4 rounded-xl backdrop-blur-sm">
            📝 קיימת רשומה ל-{formatDate(existingRecord.date)} - השמירה תעדכן אותה
          </p>
        )}

        <div className="flex gap-3 pt-2">
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
      </form>
    </Modal>
  )
}

// Backward compatibility alias
export { WalkingEntryModal as StepsEntryModal }
