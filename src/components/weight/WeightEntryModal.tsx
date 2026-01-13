'use client'

import { useState, useEffect } from 'react'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { useWeight } from '@/hooks/useSupabase'
import type { Tables } from '@/types/database'

interface WeightEntryModalProps {
  isOpen: boolean
  onClose: () => void
  existingRecord?: Tables<'weight_records'>
  onSuccess: () => void
}

export function WeightEntryModal({
  isOpen,
  onClose,
  existingRecord,
  onSuccess,
}: WeightEntryModalProps) {
  const { addWeight, updateWeight } = useWeight()
  const [weight, setWeight] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
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
          <p className="text-sm text-rose-600 bg-rose-100 p-3 rounded-lg">{error}</p>
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
