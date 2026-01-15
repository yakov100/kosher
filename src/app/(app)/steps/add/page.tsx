'use client'

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useWalking } from '@/hooks/useSupabase'
import { getToday, formatHebrewDate } from '@/lib/utils'
import Card from '@/components/Card'
import Button from '@/components/Button'
import Input from '@/components/Input'
import { Timer, Calendar, MessageSquare, Trash2, Loader2 } from 'lucide-react'
import { parseISO, isAfter, startOfDay } from 'date-fns'
import { BackButton } from '@/components/ui/BackButton'

function AddWalkingContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { records, addOrUpdateRecord, deleteRecord } = useWalking()
  
  const dateParam = searchParams.get('date')
  const [date, setDate] = useState(dateParam || getToday())
  const [minutes, setMinutes] = useState('')
  const [note, setNote] = useState('')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState('')

  // Check for existing record
  const existingRecord = records.find(r => r.date === date)
  const isEditing = !!existingRecord

  useEffect(() => {
    if (existingRecord) {
      setMinutes(existingRecord.minutes.toString())
      setNote(existingRecord.note || '')
    } else {
      setMinutes('')
      setNote('')
    }
  }, [existingRecord, date])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const minutesNum = parseInt(minutes)
    
    if (isNaN(minutesNum) || minutesNum < 0) {
      setError('נא להזין מספר דקות תקין')
      return
    }

    if (minutesNum > 480) {
      if (!confirm('מספר הדקות נראה גבוה מאוד (יותר מ-8 שעות). האם אתה בטוח?')) {
        return
      }
    }

    // Check for future date
    if (isAfter(startOfDay(parseISO(date)), startOfDay(new Date()))) {
      setError('לא ניתן להזין דקות לתאריך עתידי')
      return
    }

    setLoading(true)
    try {
      await addOrUpdateRecord(date, minutesNum, note || undefined)
      router.back()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה בשמירה')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!existingRecord) return
    
    if (!confirm('האם אתה בטוח שברצונך למחוק את הרשומה?')) {
      return
    }

    setDeleting(true)
    try {
      await deleteRecord(existingRecord.id)
      router.back()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'שגיאה במחיקה')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 fade-in">
        <BackButton />
        <div>
          <h1 className="text-xl font-bold text-white">
            {isEditing ? 'עריכת הליכה' : 'הזנת הליכה'}
          </h1>
          <p className="text-sm text-slate-400">
            {formatHebrewDate(parseISO(date))}
          </p>
        </div>
      </div>

      {isEditing && (
        <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400 text-sm fade-in">
          📝 עריכת רשומה קיימת
        </div>
      )}

      <Card className="fade-in stagger-1">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Calendar className="w-4 h-4" />
              תאריך
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={getToday()}
              className="input-field w-full"
              dir="ltr"
            />
          </div>

          {/* Minutes */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <Timer className="w-4 h-4" />
              דקות הליכה
            </label>
            <Input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="0"
              min="0"
              max="1440"
              required
              className="text-2xl font-bold text-center"
              dir="ltr"
            />
          </div>

          {/* Quick buttons */}
          <div className="flex flex-wrap gap-2">
            {[10, 15, 20, 30, 45, 60, 90].map(num => (
              <button
                key={num}
                type="button"
                onClick={() => setMinutes(num.toString())}
                className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                  minutes === num.toString()
                    ? 'bg-teal-500 text-slate-900'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                }`}
              >
                {num} דק׳
              </button>
            ))}
          </div>

          {/* Note */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
              <MessageSquare className="w-4 h-4" />
              הערה (אופציונלי)
            </label>
            <Input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value.slice(0, 120))}
              placeholder="למשל: הליכה בפארק"
              maxLength={120}
            />
            <p className="text-xs text-slate-500 mt-1">{note.length}/120</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
              size="lg"
            >
              {isEditing ? 'עדכון' : 'שמירה'}
            </Button>
            
            {isEditing && (
              <Button
                type="button"
                variant="danger"
                onClick={handleDelete}
                loading={deleting}
                size="lg"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            )}
          </div>
        </form>
      </Card>
    </div>
  )
}

export default function AddWalkingPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-400" />
      </div>
    }>
      <AddWalkingContent />
    </Suspense>
  )
}
