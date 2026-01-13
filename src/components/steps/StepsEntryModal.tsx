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
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                minutes === num.toString()
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
          <p className="text-sm text-rose-600 bg-rose-100 p-3 rounded-lg">{error}</p>
        )}

        {existingRecord && (
          <p className="text-sm text-amber-700 bg-amber-100 p-3 rounded-lg">
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
